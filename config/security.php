<?php
/**
 * Security Configuration and Utilities
 * CRITICAL: Production security measures
 */

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

class SecurityManager {
    
    // CSRF Token Management
    public static function generateCSRFToken() {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
    
    public static function validateCSRFToken($token) {
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
    
    public static function getCSRFTokenField() {
        return '<input type="hidden" name="csrf_token" value="' . self::generateCSRFToken() . '">';
    }
    
    // Rate Limiting
    private static function getRateLimitKey($identifier, $action) {
        return "rate_limit_{$action}_{$identifier}";
    }
    
    public static function checkRateLimit($identifier, $action, $maxAttempts = 10, $windowSeconds = 300) {
        $key = self::getRateLimitKey($identifier, $action);
        
        if (!isset($_SESSION[$key])) {
            $_SESSION[$key] = [
                'count' => 0,
                'window_start' => time()
            ];
        }
        
        $rateData = $_SESSION[$key];
        
        // Reset window if expired
        if (time() - $rateData['window_start'] > $windowSeconds) {
            $_SESSION[$key] = [
                'count' => 1,
                'window_start' => time()
            ];
            return true;
        }
        
        // Check if limit exceeded
        if ($rateData['count'] >= $maxAttempts) {
            return false;
        }
        
        // Increment counter
        $_SESSION[$key]['count']++;
        return true;
    }
    
    // Input Validation
    public static function sanitizeInput($input, $type = 'string') {
        switch ($type) {
            case 'email':
                return filter_var(trim($input), FILTER_SANITIZE_EMAIL);
            case 'int':
                return filter_var($input, FILTER_SANITIZE_NUMBER_INT);
            case 'float':
                return filter_var($input, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
            case 'url':
                return filter_var(trim($input), FILTER_SANITIZE_URL);
            case 'string':
            default:
                return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
        }
    }
    
    public static function validateInput($input, $type, $required = true) {
        if ($required && empty($input)) {
            return false;
        }
        
        switch ($type) {
            case 'email':
                return filter_var($input, FILTER_VALIDATE_EMAIL);
            case 'int':
                return filter_var($input, FILTER_VALIDATE_INT) !== false;
            case 'float':
                return filter_var($input, FILTER_VALIDATE_FLOAT) !== false;
            case 'url':
                return filter_var($input, FILTER_VALIDATE_URL) !== false;
            case 'alphanumeric':
                return preg_match('/^[a-zA-Z0-9]+$/', $input);
            case 'username':
                return preg_match('/^[a-zA-Z0-9_]{3,20}$/', $input);
            case 'password':
                return strlen($input) >= 6;
            default:
                return !empty($input);
        }
    }
    
    // Error Logging
    public static function logError($message, $context = []) {
        $logFile = __DIR__ . '/../logs/security_' . date('Y-m-d') . '.log';
        $logDir = dirname($logFile);
        
        // Create logs directory if it doesn't exist
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        $contextStr = !empty($context) ? ' | Context: ' . json_encode($context) : '';
        
        $logEntry = "[{$timestamp}] IP: {$ip} | UserAgent: {$userAgent} | Message: {$message}{$contextStr}" . PHP_EOL;
        
        file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }
    
    public static function logSecurityEvent($event, $details = []) {
        self::logError("SECURITY EVENT: {$event}", $details);
    }
    
    // HTTPS Enforcement
    public static function enforceHTTPS() {
        if (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] !== 'on') {
            $redirectURL = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
            header("Location: {$redirectURL}", true, 301);
            exit();
        }
    }
    
    // Security Headers
    public static function setSecurityHeaders() {
        // Prevent XSS
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');
        
        // Content Security Policy
        header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'");
        
        // HSTS (HTTP Strict Transport Security)
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
        
        // Referrer Policy
        header('Referrer-Policy: strict-origin-when-cross-origin');
    }
    
    // API Security
    public static function validateAPIRequest() {
        // Check CSRF token for POST requests
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Try to get token from multiple sources
            $token = $_POST['csrf_token'] ?? 
                     $_SERVER['HTTP_X_CSRF_TOKEN'] ?? 
                     getallheaders()['X-CSRF-Token'] ?? 
                     '';
            
            if (!self::validateCSRFToken($token)) {
                self::logSecurityEvent('Invalid CSRF token', [
                    'ip' => $_SERVER['REMOTE_ADDR'],
                    'user_agent' => $_SERVER['HTTP_USER_AGENT'],
                    'url' => $_SERVER['REQUEST_URI'],
                    'token_received' => substr($token, 0, 10) . '...' // Log first 10 chars for debugging
                ]);
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Invalid CSRF token']);
                exit();
            }
        }
        
        // Rate limiting for API endpoints
        $identifier = $_SESSION['user_id'] ?? $_SERVER['REMOTE_ADDR'];
        if (!self::checkRateLimit($identifier, 'api_request', 60, 300)) { // 60 requests per 5 minutes
            self::logSecurityEvent('Rate limit exceeded', [
                'ip' => $_SERVER['REMOTE_ADDR'],
                'identifier' => $identifier,
                'url' => $_SERVER['REQUEST_URI']
            ]);
            http_response_code(429);
            echo json_encode(['success' => false, 'message' => 'Rate limit exceeded']);
            exit();
        }
    }
    
    // Database Security
    public static function sanitizeForDatabase($input) {
        // Remove potential SQL injection characters
        $input = str_replace(['"', "'", ';', '--', '/*', '*/'], '', $input);
        return trim($input);
    }
}

// Auto-enable security measures
if ($_SERVER['SERVER_NAME'] !== 'localhost' && $_SERVER['SERVER_NAME'] !== '127.0.0.1') {
    // Only enforce HTTPS in production
    SecurityManager::enforceHTTPS();
}

// Set security headers
SecurityManager::setSecurityHeaders();

// Log security events
register_shutdown_function(function() {
    if (error_get_last()) {
        SecurityManager::logError('PHP Error: ' . error_get_last()['message'], [
            'file' => error_get_last()['file'],
            'line' => error_get_last()['line']
        ]);
    }
});

?>
