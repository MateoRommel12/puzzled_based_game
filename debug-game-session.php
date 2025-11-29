<?php
/**
 * Debug Game Session API
 * Check what's happening with the get-stats endpoint
 */

require_once __DIR__ . '/config/database.php';

header('Content-Type: application/json; charset=utf-8');

echo "=== DEBUG GAME SESSION API ===\n\n";

// Check session
echo "Session Status:\n";
if (session_status() === PHP_SESSION_NONE) {
    session_start();
    echo "- Session started\n";
} else {
    echo "- Session already active\n";
}

echo "- Session ID: " . session_id() . "\n";
echo "- User ID in session: " . ($_SESSION['user_id'] ?? 'NOT SET') . "\n";
echo "- All session data: " . print_r($_SESSION, true) . "\n\n";

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo "ERROR: User not logged in!\n";
    echo "This is why the API returns empty JSON.\n";
    echo "\nTo fix this:\n";
    echo "1. Make sure you're logged in\n";
    echo "2. Check if session is working properly\n";
    echo "3. Verify login process\n";
    exit;
}

// Test database connection
echo "Database Connection:\n";
try {
    $db = getDBConnection();
    echo "- Database connected successfully\n";
    
    // Test the actual query
    $userId = $_SESSION['user_id'];
    echo "- Testing with user ID: $userId\n";
    
    $stmt = $db->prepare("SELECT * FROM student_progress WHERE user_id = ?");
    $stmt->execute([$userId]);
    $progress = $stmt->fetch();
    
    if ($progress) {
        echo "- Student progress found: " . print_r($progress, true) . "\n";
    } else {
        echo "- No student progress found for user $userId\n";
    }
    
    $stmt = $db->prepare("SELECT * FROM game_statistics WHERE user_id = ?");
    $stmt->execute([$userId]);
    $gameStats = $stmt->fetchAll();
    
    echo "- Game statistics count: " . count($gameStats) . "\n";
    
} catch (Exception $e) {
    echo "- Database error: " . $e->getMessage() . "\n";
}

echo "\n=== END DEBUG ===\n";
?>
