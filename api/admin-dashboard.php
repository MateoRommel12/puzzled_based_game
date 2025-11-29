<?php
/**
 * Admin Dashboard API
 * Provides data for admin dashboard
 */

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check admin authentication
if (!isset($_SESSION['admin_id']) || !isset($_SESSION['is_admin'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Admin authentication required'
    ]);
    exit();
}

try {
    $db = getDBConnection();
    
    switch ($action) {
        case 'overview':
            handleGetOverview($db);
            break;
            
        case 'students':
            handleGetStudents($db);
            break;
            
        case 'clustering':
            handleGetClustering($db);
            break;
            
        case 'student-details':
            handleGetStudentDetails($db);
            break;
            
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

/**
 * Get overview statistics
 */
function handleGetOverview($db) {
    // Total students
    $stmt = $db->query("SELECT COUNT(*) as total FROM users WHERE is_active = 1");
    $totalStudents = $stmt->fetch()['total'];
    
    // Total games played
    $stmt = $db->query("SELECT COUNT(*) as total FROM game_sessions WHERE completed_at IS NOT NULL");
    $totalGames = $stmt->fetch()['total'];
    
    // Average score
    $stmt = $db->query("SELECT AVG(score) as avg_score FROM game_sessions WHERE completed_at IS NOT NULL");
    $avgScore = round($stmt->fetch()['avg_score'] ?? 0, 2);
    
    // Active today
    $stmt = $db->query("
        SELECT COUNT(DISTINCT user_id) as active 
        FROM game_sessions 
        WHERE DATE(started_at) = CURDATE()
    ");
    $activeToday = $stmt->fetch()['active'];
    
    // Custom games list
    $stmt = $db->query("
        SELECT 
            cg.game_id,
            cg.game_name,
            cg.game_type,
            cg.game_category,
            cg.description,
            cg.icon_emoji,
            cg.difficulty,
            cg.created_at,
            COUNT(DISTINCT cgq.question_id) as total_questions,
            COUNT(DISTINCT gs.session_id) as play_count
        FROM custom_games cg
        LEFT JOIN custom_game_questions cgq ON cg.game_id = cgq.game_id
        LEFT JOIN game_sessions gs ON CONCAT('custom_', cg.game_id) = gs.game_type
        WHERE cg.is_active = 1
        GROUP BY cg.game_id
        ORDER BY cg.created_at DESC
    ");
    $customGames = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Performance distribution
    $stmt = $db->query("
        SELECT performance_level, COUNT(*) as count 
        FROM student_progress 
        GROUP BY performance_level
    ");
    $performanceDistribution = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'overview' => [
            'totalStudents' => (int)$totalStudents,
            'totalGames' => (int)$totalGames,
            'averageScore' => $avgScore,
            'activeToday' => (int)$activeToday
        ],
        'customGames' => $customGames,
        'performanceDistribution' => $performanceDistribution
    ]);
}

/**
 * Get all students with their stats
 */
function handleGetStudents($db) {
    $search = $_GET['search'] ?? '';
    $filter = $_GET['filter'] ?? 'all';
    
    $query = "
        SELECT 
            u.user_id,
            u.full_name,
            u.email,
            sp.total_score,
            sp.games_played,
            sp.literacy_progress,
            sp.math_progress,
            sp.performance_level,
            u.last_login,
            u.created_at,
            COALESCE(SUM(gs.hints_used), 0) as total_hints_used,
            COALESCE(SUM(COALESCE(gs.time_taken, TIMESTAMPDIFF(SECOND, gs.started_at, gs.completed_at))), 0) as total_time_consumed
        FROM users u
        LEFT JOIN student_progress sp ON u.user_id = sp.user_id
        LEFT JOIN game_sessions gs ON u.user_id = gs.user_id AND gs.completed_at IS NOT NULL
        WHERE u.is_active = 1
    ";
    
    $params = [];
    
    // Add search condition
    if (!empty($search)) {
        $query .= " AND (u.full_name LIKE ? OR u.email LIKE ?)";
        $searchParam = "%$search%";
        $params[] = $searchParam;
        $params[] = $searchParam;
    }
    
    // Add filter condition
    if ($filter !== 'all') {
        $query .= " AND sp.performance_level = ?";
        $params[] = $filter;
    }
    
    $query .= " GROUP BY u.user_id, u.full_name, u.email, sp.total_score, sp.games_played, sp.literacy_progress, sp.math_progress, sp.performance_level, u.last_login, u.created_at";
    $query .= " ORDER BY sp.total_score DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $students = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'students' => $students
    ]);
}

/**
 * Get clustering data
 */
function handleGetClustering($db) {
    // Get current clustering results
    $stmt = $db->query("
        SELECT 
            cr.cluster_number,
            cr.cluster_label,
            COUNT(cr.user_id) as student_count,
            AVG(cr.literacy_score) as avg_literacy,
            AVG(cr.math_score) as avg_math,
            AVG(cr.overall_performance) as avg_performance
        FROM clustering_results cr
        WHERE cr.is_current = 1
        GROUP BY cr.cluster_number, cr.cluster_label
        ORDER BY cr.cluster_number
    ");
    $clusters = $stmt->fetchAll();
    
    // Get students in each cluster
    $stmt = $db->query("
        SELECT 
            u.user_id,
            u.full_name,
            cr.cluster_number,
            cr.cluster_label,
            cr.literacy_score,
            cr.math_score,
            cr.overall_performance
        FROM clustering_results cr
        JOIN users u ON cr.user_id = u.user_id
        WHERE cr.is_current = 1
        ORDER BY cr.cluster_number, u.full_name
    ");
    $studentsInClusters = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'clusters' => $clusters,
        'students' => $studentsInClusters
    ]);
}

/**
 * Get detailed information for a specific student
 */
function handleGetStudentDetails($db) {
    $userId = $_GET['userId'] ?? 0;
    
    if (empty($userId)) {
        throw new Exception('User ID required');
    }
    
    // Get student info
    $stmt = $db->prepare("SELECT * FROM v_student_performance WHERE user_id = ?");
    $stmt->execute([$userId]);
    $student = $stmt->fetch();
    
    if (!$student) {
        throw new Exception('Student not found');
    }
    
    // Get game sessions
    $stmt = $db->prepare("
        SELECT * FROM game_sessions 
        WHERE user_id = ? 
        ORDER BY completed_at DESC 
        LIMIT 20
    ");
    $stmt->execute([$userId]);
    $sessions = $stmt->fetchAll();
    
    // Get achievements
    $stmt = $db->prepare("
        SELECT * FROM achievements 
        WHERE user_id = ? 
        ORDER BY earned_at DESC
    ");
    $stmt->execute([$userId]);
    $achievements = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'student' => $student,
        'sessions' => $sessions,
        'achievements' => $achievements
    ]);
}

