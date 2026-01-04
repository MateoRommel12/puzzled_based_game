<?php
/**
 * Leaderboard API
 * Provides real-time leaderboard data
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

try {
    $db = getDBConnection();
    
    switch ($action) {
        case 'overall':
            handleGetOverallLeaderboard($db);
            break;
            
        case 'literacy':
            handleGetLiteracyLeaderboard($db);
            break;
            
        case 'math':
            handleGetMathLeaderboard($db);
            break;
            
        case 'recent':
            handleGetRecentLeaderboard($db);
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
 * Get overall leaderboard (total scores)
 */
function handleGetOverallLeaderboard($db) {
    $stmt = $db->prepare("
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
            ROW_NUMBER() OVER (ORDER BY sp.total_score DESC) as rank
        FROM users u
        LEFT JOIN student_progress sp ON u.user_id = sp.user_id
        WHERE u.is_active = TRUE
        ORDER BY sp.total_score DESC, sp.games_played DESC
        LIMIT 10
    ");
    
    $stmt->execute();
    $students = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'leaderboard' => $students,
        'type' => 'overall',
        'updated_at' => date('Y-m-d H:i:s')
    ]);
}

/**
 * Get literacy leaderboard (literacy progress)
 */
function handleGetLiteracyLeaderboard($db) {
    $stmt = $db->prepare("
        SELECT 
            u.user_id,
            u.full_name,
            u.email,
            sp.literacy_progress as score,
            sp.games_played,
            sp.total_score,
            sp.performance_level,
            u.last_login,
            ROW_NUMBER() OVER (ORDER BY sp.literacy_progress DESC) as rank
        FROM users u
        LEFT JOIN student_progress sp ON u.user_id = sp.user_id
        WHERE u.is_active = TRUE AND sp.literacy_progress > 0
        ORDER BY sp.literacy_progress DESC, sp.total_score DESC
        LIMIT 10
    ");
    
    $stmt->execute();
    $students = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'leaderboard' => $students,
        'type' => 'literacy',
        'updated_at' => date('Y-m-d H:i:s')
    ]);
}

/**
 * Get math leaderboard (math progress)
 */
function handleGetMathLeaderboard($db) {
    $stmt = $db->prepare("
        SELECT 
            u.user_id,
            u.full_name,
            u.email,
            sp.math_progress as score,
            sp.games_played,
            sp.total_score,
            sp.performance_level,
            u.last_login,
            ROW_NUMBER() OVER (ORDER BY sp.math_progress DESC) as rank
        FROM users u
        LEFT JOIN student_progress sp ON u.user_id = sp.user_id
        WHERE u.is_active = TRUE AND sp.math_progress > 0
        ORDER BY sp.math_progress DESC, sp.total_score DESC
        LIMIT 10
    ");
    
    $stmt->execute();
    $students = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'leaderboard' => $students,
        'type' => 'math',
        'updated_at' => date('Y-m-d H:i:s')
    ]);
}

/**
 * Get recent activity leaderboard (last 7 days)
 */
function handleGetRecentLeaderboard($db) {
    $stmt = $db->prepare("
        SELECT 
            u.user_id,
            u.full_name,
            u.email,
            COALESCE(recent_scores.total_recent_score, 0) as score,
            COALESCE(recent_scores.recent_games, 0) as games_played,
            sp.total_score,
            sp.performance_level,
            u.last_login,
            ROW_NUMBER() OVER (ORDER BY COALESCE(recent_scores.total_recent_score, 0) DESC) as rank
        FROM users u
        LEFT JOIN student_progress sp ON u.user_id = sp.user_id
        LEFT JOIN (
            SELECT 
                user_id,
                SUM(score) as total_recent_score,
                COUNT(*) as recent_games
            FROM game_sessions 
            WHERE completed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                AND completed_at IS NOT NULL
            GROUP BY user_id
        ) recent_scores ON u.user_id = recent_scores.user_id
        WHERE u.is_active = TRUE
        ORDER BY COALESCE(recent_scores.total_recent_score, 0) DESC, COALESCE(recent_scores.recent_games, 0) DESC
        LIMIT 10
    ");
    
    $stmt->execute();
    $students = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'leaderboard' => $students,
        'type' => 'recent',
        'updated_at' => date('Y-m-d H:i:s')
    ]);
}
?>
