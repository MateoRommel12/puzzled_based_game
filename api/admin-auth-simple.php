<?php
/**
 * Admin Authentication API (Deployment-Safe Version)
 * Handles admin login and session management
 */

// Start session first
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../config/database.php';

// Set JSON header
header('Content-Type: application/json; charset=utf-8');

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    $db = getDBConnection();
    
    switch ($action) {
        case 'login':
            handleAdminLogin($db);
            break;
            
        case 'logout':
            handleAdminLogout();
            break;
            
        case 'check-session':
            handleCheckAdminSession($db);
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
 * Handle admin login
 */
function handleAdminLogin($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        throw new Exception('Invalid JSON data');
    }
    
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        throw new Exception('Username and password are required');
    }
    
    // Get admin from database
    $stmt = $db->prepare("
        SELECT admin_id, username, full_name, password_hash, is_active 
        FROM admins 
        WHERE username = ?
    ");
    $stmt->execute([$username]);
    $admin = $stmt->fetch();
    
    if (!$admin) {
        throw new Exception('Invalid username or password');
    }
    
    if (!$admin['is_active']) {
        throw new Exception('Admin account is deactivated');
    }
    
    // Verify password
    if (!password_verify($password, $admin['password_hash'])) {
        throw new Exception('Invalid username or password');
    }
    
    // Update last login
    $stmt = $db->prepare("UPDATE admins SET last_login = NOW() WHERE admin_id = ?");
    $stmt->execute([$admin['admin_id']]);
    
    // Set admin session
    $_SESSION['admin_id'] = $admin['admin_id'];
    $_SESSION['admin_username'] = $admin['username'];
    $_SESSION['admin_name'] = $admin['full_name'];
    $_SESSION['is_admin'] = true;
    
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'admin' => [
            'id' => $admin['admin_id'],
            'username' => $admin['username'],
            'name' => $admin['full_name']
        ]
    ]);
}

/**
 * Handle admin logout
 */
function handleAdminLogout() {
    // Clear all session variables
    $_SESSION = array();
    
    // Destroy the session cookie
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    
    // Destroy the session
    session_destroy();
    
    echo json_encode([
        'success' => true,
        'message' => 'Logout successful'
    ]);
}

/**
 * Check admin session
 */
function handleCheckAdminSession($db) {
    if (!isset($_SESSION['admin_id']) || !isset($_SESSION['is_admin'])) {
        throw new Exception('Not authenticated');
    }
    
    $stmt = $db->prepare("
        SELECT admin_id, username, full_name 
        FROM admins 
        WHERE admin_id = ? AND is_active = 1
    ");
    $stmt->execute([$_SESSION['admin_id']]);
    $admin = $stmt->fetch();
    
    if (!$admin) {
        session_destroy();
        throw new Exception('Session invalid');
    }
    
    echo json_encode([
        'success' => true,
        'admin' => [
            'id' => $admin['admin_id'],
            'username' => $admin['username'],
            'name' => $admin['full_name']
        ]
    ]);
}

?>
