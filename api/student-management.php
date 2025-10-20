<?php
/**
 * Student Management API
 * Handles CRUD operations for students
 */

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
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
        case 'list':
            handleGetStudents($db);
            break;
            
        case 'create':
            handleCreateStudent($db);
            break;
            
        case 'update':
            handleUpdateStudent($db);
            break;
            
        case 'delete':
            handleDeleteStudent($db);
            break;
            
        case 'toggle-status':
            handleToggleStudentStatus($db);
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
 * Get all students with search and pagination
 */
function handleGetStudents($db) {
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = min(50, max(10, intval($_GET['limit'] ?? 20)));
    $search = trim($_GET['search'] ?? '');
    $status = $_GET['status'] ?? 'all';
    
    $offset = ($page - 1) * $limit;
    
    // Build WHERE clause
    $whereConditions = [];
    $params = [];
    
    if (!empty($search)) {
        $whereConditions[] = "(u.full_name LIKE ? OR u.email LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    if ($status !== 'all') {
        $whereConditions[] = "u.is_active = ?";
        $params[] = ($status === 'active') ? 1 : 0;
    }
    
    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
    
    // Get total count
    $countSql = "
        SELECT COUNT(*) as total
        FROM users u
        LEFT JOIN student_progress sp ON u.user_id = sp.user_id
        $whereClause
    ";
    
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($params);
    $totalCount = $countStmt->fetch()['total'];
    
    // Get students
    $studentsSql = "
        SELECT 
            u.user_id,
            u.full_name,
            u.email,
            u.created_at,
            u.last_login,
            u.is_active,
            sp.total_score,
            sp.games_played,
            sp.literacy_progress,
            sp.math_progress,
            sp.performance_level
        FROM users u
        LEFT JOIN student_progress sp ON u.user_id = sp.user_id
        $whereClause
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
    ";
    
    $studentsStmt = $db->prepare($studentsSql);
    $studentsStmt->execute(array_merge($params, [$limit, $offset]));
    $students = $studentsStmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'students' => $students,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $totalCount,
            'pages' => ceil($totalCount / $limit)
        ]
    ]);
}

/**
 * Create new student
 */
function handleCreateStudent($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid method');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON data');
    }
    
    $fullName = trim($input['full_name'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    
    // Validate input
    if (empty($fullName)) {
        throw new Exception('Full name is required');
    }
    
    if (empty($email)) {
        throw new Exception('Email is required');
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }
    
    if (empty($password)) {
        throw new Exception('Password is required');
    }
    
    if (strlen($password) < 6) {
        throw new Exception('Password must be at least 6 characters long');
    }
    
    // Check if email already exists
    $stmt = $db->prepare("SELECT user_id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        throw new Exception('Email is already taken');
    }
    
    // Hash password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    // Create user
    $stmt = $db->prepare("
        INSERT INTO users (full_name, email, password_hash, is_active) 
        VALUES (?, ?, ?, 1)
    ");
    
    $result = $stmt->execute([$fullName, $email, $passwordHash]);
    
    if (!$result) {
        throw new Exception('Failed to create student');
    }
    
    $userId = $db->lastInsertId();
    
    // Create initial progress record
    $stmt = $db->prepare("
        INSERT INTO student_progress (user_id, total_score, games_played, literacy_progress, math_progress, performance_level) 
        VALUES (?, 0, 0, 0.00, 0.00, 'low')
    ");
    $progressResult = $stmt->execute([$userId]);
    
    if (!$progressResult) {
        // Log error but don't fail the student creation
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Student created successfully',
        'user_id' => $userId
    ]);
}

/**
 * Update student
 */
function handleUpdateStudent($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid method');
    }
    
    $userId = intval($_GET['user_id'] ?? 0);
    
    if (!$userId) {
        throw new Exception('User ID is required');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON data');
    }
    
    $fullName = trim($input['full_name'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    
    // Validate input
    if (empty($fullName)) {
        throw new Exception('Full name is required');
    }
    
    if (empty($email)) {
        throw new Exception('Email is required');
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }
    
    // Check if email is already taken by another user
    $stmt = $db->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
    $stmt->execute([$email, $userId]);
    
    if ($stmt->fetch()) {
        throw new Exception('Email is already taken by another user');
    }
    
    // Build update query
    $updateFields = ['full_name = ?', 'email = ?'];
    $params = [$fullName, $email];
    
    if (!empty($password)) {
        if (strlen($password) < 6) {
            throw new Exception('Password must be at least 6 characters long');
        }
        $updateFields[] = 'password_hash = ?';
        $params[] = password_hash($password, PASSWORD_DEFAULT);
    }
    
    $params[] = $userId;
    
    $stmt = $db->prepare("
        UPDATE users 
        SET " . implode(', ', $updateFields) . "
        WHERE user_id = ?
    ");
    
    $result = $stmt->execute($params);
    
    if (!$result) {
        throw new Exception('Failed to update student');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Student updated successfully'
    ]);
}

/**
 * Delete student
 */
function handleDeleteStudent($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        throw new Exception('Invalid method');
    }
    
    $userId = intval($_GET['user_id'] ?? 0);
    
    if (!$userId) {
        throw new Exception('User ID is required');
    }
    
    // Check if user exists
    $stmt = $db->prepare("SELECT user_id FROM users WHERE user_id = ?");
    $stmt->execute([$userId]);
    
    if (!$stmt->fetch()) {
        throw new Exception('Student not found');
    }
    
    // Delete user (cascade will handle related records)
    $stmt = $db->prepare("DELETE FROM users WHERE user_id = ?");
    $result = $stmt->execute([$userId]);
    
    if (!$result) {
        throw new Exception('Failed to delete student');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Student deleted successfully'
    ]);
}

/**
 * Toggle student status (active/inactive)
 */
function handleToggleStudentStatus($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid method');
    }
    
    $userId = intval($_GET['user_id'] ?? 0);
    
    if (!$userId) {
        throw new Exception('User ID is required');
    }
    
    // Get current status
    $stmt = $db->prepare("SELECT is_active FROM users WHERE user_id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        throw new Exception('Student not found');
    }
    
    // Toggle status
    $newStatus = $user['is_active'] ? 0 : 1;
    
    $stmt = $db->prepare("UPDATE users SET is_active = ? WHERE user_id = ?");
    $result = $stmt->execute([$newStatus, $userId]);
    
    if (!$result) {
        throw new Exception('Failed to update student status');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Student status updated successfully',
        'is_active' => $newStatus
    ]);
}
?>
