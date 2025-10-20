<?php
/**
 * Authentication API Endpoints
 * Handles user registration, login, and logout
 * SECURITY: Production-ready with CSRF, rate limiting, and validation
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/middleware.php';
require_once __DIR__ . '/../config/email-manager.php';

header('Content-Type: application/json');

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// CORS headers for development (remove or restrict in production)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Apply security middleware for API requests (but skip CSRF for login, register, logout, check-session, forgot-password, reset-password)
// Login, register, forgot-password, and reset-password don't need CSRF since user hasn't established a session yet
if (!in_array($action, ['register', 'login', 'logout', 'check-session', 'forgot-password', 'reset-password'])) {
    SecurityManager::validateAPIRequest();
}

try {
    $db = getDBConnection();
    
    switch ($action) {
        case 'register':
            handleRegister($db);
            break;
            
        case 'login':
            handleLogin($db);
            break;
            
        case 'logout':
            handleLogout();
            break;
            
        case 'check-session':
            handleCheckSession($db);
            break;
            
        case 'forgot-password':
            handleForgotPassword($db);
            break;
            
        case 'reset-password':
            handleResetPassword($db);
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
 * Handle user registration
 */
function handleRegister($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Apply input validation middleware
    $errors = ValidationMiddleware::validate($data, 'register');
    if (!empty($errors)) {
        echo json_encode(ValidationMiddleware::handleValidationError($errors));
        return;
    }
    
    // Sanitize input
    $data = ValidationMiddleware::sanitizeInput($data);
    
    $fullName = $data['fullName'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $confirmPassword = $data['confirmPassword'] ?? '';
    
    // Additional validation
    if ($password !== $confirmPassword) {
        SecurityManager::logSecurityEvent('Password mismatch during registration', [
            'email' => $email,
            'ip' => $_SERVER['REMOTE_ADDR']
        ]);
        echo json_encode([
            'success' => false,
            'message' => 'Passwords do not match'
        ]);
        return;
    }
    
    // Rate limiting for registration
    if (!RateLimitMiddleware::check($email, 'registration', 3, 3600)) { // 3 attempts per hour
        SecurityManager::logSecurityEvent('Registration rate limit exceeded', [
            'email' => $email,
            'ip' => $_SERVER['REMOTE_ADDR']
        ]);
        echo json_encode([
            'success' => false,
            'message' => 'Too many registration attempts. Please try again later.'
        ]);
        return;
    }
    
    // Check if email already exists
    $stmt = $db->prepare("SELECT user_id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        SecurityManager::logSecurityEvent('Registration attempt with existing email', [
            'email' => $email,
            'ip' => $_SERVER['REMOTE_ADDR']
        ]);
        echo json_encode([
            'success' => false,
            'message' => 'Email already registered'
        ]);
        return;
    }
    
    // Hash password
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);
    
    // Insert user
    $stmt = $db->prepare("
        INSERT INTO users (full_name, email, password_hash) 
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$fullName, $email, $passwordHash]);
    
    $userId = $db->lastInsertId();
    
    // Initialize student progress
    $stmt = $db->prepare("
        INSERT INTO student_progress (user_id) 
        VALUES (?)
    ");
    $stmt->execute([$userId]);
    
    // Set session
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_name'] = $fullName;
    $_SESSION['user_email'] = $email;
    
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful',
        'user' => [
            'id' => $userId,
            'name' => $fullName,
            'email' => $email
        ]
    ]);
}

/**
 * Handle user login
 */
function handleLogin($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Apply input validation middleware
    $errors = ValidationMiddleware::validate($data, 'login');
    if (!empty($errors)) {
        echo json_encode(ValidationMiddleware::handleValidationError($errors));
        return;
    }
    
    // Sanitize input
    $data = ValidationMiddleware::sanitizeInput($data);
    
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    
    // Rate limiting for login attempts
    if (!RateLimitMiddleware::checkLoginAttempts($email)) {
        SecurityManager::logSecurityEvent('Login rate limit exceeded', [
            'email' => $email,
            'ip' => $_SERVER['REMOTE_ADDR']
        ]);
        echo json_encode([
            'success' => false,
            'message' => 'Too many login attempts. Please try again later.'
        ]);
        return;
    }
    
    // Get user from database
    $stmt = $db->prepare("
        SELECT user_id, full_name, email, password_hash, is_active 
        FROM users 
        WHERE email = ?
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        SecurityManager::logSecurityEvent('Login attempt with non-existent email', [
            'email' => $email,
            'ip' => $_SERVER['REMOTE_ADDR']
        ]);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password'
        ]);
        return;
    }
    
    if (!$user['is_active']) {
        SecurityManager::logSecurityEvent('Login attempt with deactivated account', [
            'email' => $email,
            'user_id' => $user['user_id'],
            'ip' => $_SERVER['REMOTE_ADDR']
        ]);
        echo json_encode([
            'success' => false,
            'message' => 'Account is deactivated'
        ]);
        return;
    }
    
    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        SecurityManager::logSecurityEvent('Failed login attempt - invalid password', [
            'email' => $email,
            'user_id' => $user['user_id'],
            'ip' => $_SERVER['REMOTE_ADDR']
        ]);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password'
        ]);
        return;
    }
    
    // Update last login
    $stmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE user_id = ?");
    $stmt->execute([$user['user_id']]);
    
    // Set session
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['user_name'] = $user['full_name'];
    $_SESSION['user_email'] = $user['email'];
    
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id' => $user['user_id'],
            'name' => $user['full_name'],
            'email' => $user['email']
        ]
    ]);
}

/**
 * Handle user logout
 */
function handleLogout() {
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
    
    // Log the logout event
    SecurityManager::logSecurityEvent('User logout', [
        'ip' => $_SERVER['REMOTE_ADDR'],
        'user_agent' => $_SERVER['HTTP_USER_AGENT']
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Logout successful'
    ]);
}

/**
 * Check if user session is valid
 */
function handleCheckSession($db) {
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Not authenticated');
    }
    
    $stmt = $db->prepare("
        SELECT u.user_id, u.full_name, u.email, 
               sp.total_score, sp.games_played 
        FROM users u 
        LEFT JOIN student_progress sp ON u.user_id = sp.user_id 
        WHERE u.user_id = ? AND u.is_active = 1
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        session_destroy();
        throw new Exception('Session invalid');
    }
    
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user['user_id'],
            'name' => $user['full_name'],
            'email' => $user['email'],
            'totalScore' => (int)$user['total_score'],
            'gamesPlayed' => (int)$user['games_played']
        ]
    ]);
}

/**
 * Handle forgot password request
 */
function handleForgotPassword($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate input
    if (!isset($input['email']) || empty($input['email'])) {
        throw new Exception('Email is required');
    }
    
    $email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }
    
    // Check if user exists
    $stmt = $db->prepare("SELECT user_id, full_name, email FROM users WHERE email = ? AND is_active = 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        // Don't reveal if email exists or not for security
        echo json_encode([
            'success' => true,
            'message' => 'If an account with that email exists, a password reset link has been sent.'
        ]);
        return;
    }
    
    // Generate reset token
    $resetToken = bin2hex(random_bytes(32));
    
    // Create password_reset_tokens table if it doesn't exist
    $db->query("
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token VARCHAR(64) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            used_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            INDEX idx_token (token),
            INDEX idx_user_id (user_id),
            INDEX idx_expires_at (expires_at)
        )
    ");
    
    // Store reset token using MySQL's NOW() + INTERVAL for consistent timezone handling
    $stmt = $db->prepare("
        INSERT INTO password_reset_tokens (user_id, token, expires_at) 
        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))
    ");
    $result = $stmt->execute([$user['user_id'], $resetToken]);
    
    error_log("Forgot Password Debug - Token stored: " . ($result ? 'YES' : 'NO') . " - Token: " . $resetToken . " - User ID: " . $user['user_id']);
    
    // Send password reset email
    $emailManager = new EmailManager();
    $emailSent = $emailManager->sendPasswordResetEmail(
        $user['email'], 
        $user['full_name'], 
        $resetToken
    );
    
    // Log security event
    SecurityManager::logSecurityEvent('Password reset requested', [
        'user_id' => $user['user_id'],
        'email' => $email,
        'email_sent' => $emailSent,
        'ip' => $_SERVER['REMOTE_ADDR']
    ]);
    
    if ($emailSent) {
        echo json_encode([
            'success' => true,
            'message' => 'If an account with that email exists, a password reset link has been sent to your email.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Unable to send password reset email. Please try again later.'
        ]);
    }
}

/**
 * Handle password reset
 */
function handleResetPassword($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Debug logging
    error_log("Reset Password Debug - Input: " . json_encode($input));
    error_log("Reset Password Debug - JSON Error: " . json_last_error_msg());
    
    // Validate input
    if (!isset($input['token']) || empty($input['token'])) {
        error_log("Reset Password Error: Token missing or empty");
        throw new Exception('Reset token is required');
    }
    
    if (!isset($input['password']) || strlen($input['password']) < 6) {
        error_log("Reset Password Error: Password validation failed - length: " . (isset($input['password']) ? strlen($input['password']) : 'not set'));
        throw new Exception('Password must be at least 6 characters long');
    }
    
    if (!isset($input['confirmPassword']) || $input['password'] !== $input['confirmPassword']) {
        error_log("Reset Password Error: Password confirmation failed");
        throw new Exception('Passwords do not match');
    }
    
    $token = $input['token'];
    $password = $input['password'];
    
    // Ensure password_reset_tokens table exists
    $db->query("
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token VARCHAR(64) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            used_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            INDEX idx_token (token),
            INDEX idx_user_id (user_id),
            INDEX idx_expires_at (expires_at)
        )
    ");
    
    // Check if token exists and is valid
    error_log("Reset Password Debug - Checking token: " . $token);
    
    // First, let's check if there are any tokens in the table
    $countStmt = $db->query("SELECT COUNT(*) as count FROM password_reset_tokens");
    $countResult = $countStmt->fetch();
    error_log("Reset Password Debug - Total tokens in table: " . $countResult['count']);
    
    // Check if our specific token exists (without expiration check)
    $checkStmt = $db->prepare("SELECT token FROM password_reset_tokens WHERE token = ?");
    $checkStmt->execute([$token]);
    $tokenExists = $checkStmt->fetch();
    error_log("Reset Password Debug - Token exists in table: " . ($tokenExists ? 'YES' : 'NO'));
    
    // First try the simple query without JOIN
    $simpleStmt = $db->prepare("
        SELECT user_id, token, expires_at, used_at
        FROM password_reset_tokens
        WHERE token = ? AND expires_at > NOW() AND used_at IS NULL
    ");
    $simpleStmt->execute([$token]);
    $simpleData = $simpleStmt->fetch();
    
    error_log("Reset Password Debug - Simple query result: " . ($simpleData ? 'Found' : 'Not found'));
    
    if ($simpleData) {
        // Get user info separately
        $userStmt = $db->prepare("SELECT email, full_name FROM users WHERE user_id = ?");
        $userStmt->execute([$simpleData['user_id']]);
        $userData = $userStmt->fetch();
        
        if ($userData) {
            $resetData = array_merge($simpleData, $userData);
            error_log("Reset Password Debug - User data found, proceeding with reset");
        } else {
            error_log("Reset Password Debug - User data not found for user_id: " . $simpleData['user_id']);
            $resetData = false;
        }
    } else {
        $resetData = false;
    }
    
    error_log("Reset Password Debug - Final result: " . ($resetData ? 'Found' : 'Not found'));
    
    if (!$resetData) {
        error_log("Reset Password Error: Invalid or expired token");
        throw new Exception('Invalid or expired reset token. Please request a new password reset.');
    }
    
    // Hash new password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    
    // Update user password
    $stmt = $db->prepare("UPDATE users SET password_hash = ? WHERE user_id = ?");
    $stmt->execute([$hashedPassword, $resetData['user_id']]);
    
    // Mark token as used
    $stmt = $db->prepare("UPDATE password_reset_tokens SET used_at = NOW() WHERE token = ?");
    $stmt->execute([$token]);
    
    // Log security event
    SecurityManager::logSecurityEvent('Password reset completed', [
        'user_id' => $resetData['user_id'],
        'email' => $resetData['email'],
        'ip' => $_SERVER['REMOTE_ADDR']
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Password has been reset successfully. You can now log in with your new password.'
    ]);
}

