<?php
/**
 * Profile Management API
 * Handles user profile operations
 */

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT');
header('Access-Control-Allow-Headers: Content-Type');

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check user authentication
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'User authentication required'
    ]);
    exit();
}

try {
    $db = getDBConnection();
    
    switch ($action) {
        case 'get':
            handleGetProfile($db);
            break;
            
        case 'update':
            handleUpdateProfile($db);
            break;
            
        case 'change-password':
            handleChangePassword($db);
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
 * Get user profile data
 */
function handleGetProfile($db) {
    $userId = $_SESSION['user_id'];
    
    $stmt = $db->prepare("
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
        WHERE u.user_id = ?
    ");
    
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        throw new Exception('User not found');
    }
    
    // Remove sensitive data
    unset($user['password_hash']);
    
    echo json_encode([
        'success' => true,
        'profile' => $user
    ]);
}

/**
 * Update user profile
 */
function handleUpdateProfile($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid method');
    }
    
    $userId = $_SESSION['user_id'];
    
    // Debug: Log session info
    error_log("Profile update - User ID: " . ($userId ?? 'NULL'));
    error_log("Profile update - Session: " . print_r($_SESSION, true));
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Debug: Log input data
    error_log("Profile update - Input: " . print_r($input, true));
    
    if (!$input) {
        throw new Exception('Invalid JSON data');
    }
    
    $fullName = trim($input['full_name'] ?? '');
    $email = trim($input['email'] ?? '');
    
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
    $stmt = $db->prepare("
        SELECT user_id FROM users 
        WHERE email = ? AND user_id != ?
    ");
    $stmt->execute([$email, $userId]);
    
    if ($stmt->fetch()) {
        throw new Exception('Email is already taken by another user');
    }
    
    // Update profile
    $stmt = $db->prepare("
        UPDATE users 
        SET full_name = ?, email = ?
        WHERE user_id = ?
    ");
    
    $result = $stmt->execute([$fullName, $email, $userId]);
    
    if (!$result) {
        throw new Exception('Failed to update profile');
    }
    
    // Update session data
    $_SESSION['user_name'] = $fullName;
    $_SESSION['user_email'] = $email;
    
    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully'
    ]);
}

/**
 * Change user password
 */
function handleChangePassword($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid method');
    }
    
    $userId = $_SESSION['user_id'];
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON data');
    }
    
    $currentPassword = $input['current_password'] ?? '';
    $newPassword = $input['new_password'] ?? '';
    $confirmPassword = $input['confirm_password'] ?? '';
    
    // Validate input
    if (empty($currentPassword)) {
        throw new Exception('Current password is required');
    }
    
    if (empty($newPassword)) {
        throw new Exception('New password is required');
    }
    
    if (strlen($newPassword) < 6) {
        throw new Exception('New password must be at least 6 characters long');
    }
    
    if ($newPassword !== $confirmPassword) {
        throw new Exception('New passwords do not match');
    }
    
    // Get current password hash
    $stmt = $db->prepare("
        SELECT password_hash FROM users WHERE user_id = ?
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        throw new Exception('User not found');
    }
    
    // Verify current password
    if (!password_verify($currentPassword, $user['password_hash'])) {
        throw new Exception('Current password is incorrect');
    }
    
    // Hash new password
    $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Update password
    $stmt = $db->prepare("
        UPDATE users 
        SET password_hash = ?
        WHERE user_id = ?
    ");
    
    $result = $stmt->execute([$newPasswordHash, $userId]);
    
    if (!$result) {
        throw new Exception('Failed to update password');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Password changed successfully'
    ]);
}
?>
