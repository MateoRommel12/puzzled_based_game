<?php
/**
 * Debug script specifically for math games
 * This will help us see why math games are not contributing to math_progress
 */

require_once 'config/database.php';

echo "<h2>Math Games Debug Test</h2>\n";

try {
    $db = getDBConnection();
    echo "<p>✅ Database connection successful</p>\n";
    
    // 1. Check what game types exist for math games
    echo "<h3>1. All Game Types in Database:</h3>\n";
    $stmt = $db->query("SELECT DISTINCT game_type FROM game_sessions ORDER BY game_type");
    $gameTypes = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "<ul>\n";
    foreach ($gameTypes as $type) {
        echo "<li>" . htmlspecialchars($type) . "</li>\n";
    }
    echo "</ul>\n";
    
    // 2. Check recent game sessions with their types
    echo "<h3>2. Recent Game Sessions (Last 10):</h3>\n";
    $stmt = $db->query("
        SELECT session_id, user_id, game_type, score, accuracy, completed_at 
        FROM game_sessions 
        WHERE completed_at IS NOT NULL 
        ORDER BY completed_at DESC 
        LIMIT 10
    ");
    $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($sessions)) {
        echo "<p>❌ No completed game sessions found</p>\n";
    } else {
        echo "<table border='1' style='border-collapse: collapse;'>\n";
        echo "<tr><th>Session ID</th><th>User ID</th><th>Game Type</th><th>Score</th><th>Accuracy</th><th>Completed</th></tr>\n";
        foreach ($sessions as $session) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($session['session_id']) . "</td>";
            echo "<td>" . htmlspecialchars($session['user_id']) . "</td>";
            echo "<td>" . htmlspecialchars($session['game_type']) . "</td>";
            echo "<td>" . htmlspecialchars($session['score']) . "</td>";
            echo "<td>" . htmlspecialchars($session['accuracy']) . "</td>";
            echo "<td>" . htmlspecialchars($session['completed_at']) . "</td>";
            echo "</tr>\n";
        }
        echo "</table>\n";
    }
    
    // 3. Check specifically for math game types
    echo "<h3>3. Math Game Types Analysis:</h3>\n";
    $mathGameTypes = ['number_puzzle', 'math_challenge', 'fill_blanks_math'];
    
    foreach ($mathGameTypes as $mathType) {
        $stmt = $db->prepare("
            SELECT COUNT(*) as count, AVG(accuracy) as avg_accuracy 
            FROM game_sessions 
            WHERE game_type = ? AND completed_at IS NOT NULL
        ");
        $stmt->execute([$mathType]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "<p><strong>" . htmlspecialchars($mathType) . ":</strong> ";
        echo "Count: " . htmlspecialchars($result['count']) . ", ";
        echo "Avg Accuracy: " . htmlspecialchars($result['avg_accuracy'] ?? 'N/A') . "%</p>\n";
    }
    
    // 4. Check what the stored procedure is actually calculating for math progress
    echo "<h3>4. Testing Math Progress Calculation:</h3>\n";
    if (!empty($sessions)) {
        $testUserId = $sessions[0]['user_id'];
        echo "<p>Testing with User ID: " . htmlspecialchars($testUserId) . "</p>\n";
        
        // Manually calculate what the stored procedure should return for math progress
        $stmt = $db->prepare("
            SELECT 
                game_type,
                COUNT(*) as session_count,
                AVG(accuracy) as avg_accuracy
            FROM game_sessions
            WHERE user_id = ? 
                AND game_type IN ('number_puzzle', 'math_challenge', 'fill_blanks_math')
                AND completed_at IS NOT NULL
            GROUP BY game_type
        ");
        $stmt->execute([$testUserId]);
        $mathResults = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($mathResults)) {
            echo "<p>❌ No math game sessions found for this user</p>\n";
        } else {
            echo "<table border='1' style='border-collapse: collapse;'>\n";
            echo "<tr><th>Game Type</th><th>Sessions</th><th>Avg Accuracy</th></tr>\n";
            foreach ($mathResults as $result) {
                echo "<tr>";
                echo "<td>" . htmlspecialchars($result['game_type']) . "</td>";
                echo "<td>" . htmlspecialchars($result['session_count']) . "</td>";
                echo "<td>" . htmlspecialchars($result['avg_accuracy']) . "%</td>";
                echo "</tr>\n";
            }
            echo "</table>\n";
        }
        
        // Now test the stored procedure
        echo "<h4>Stored Procedure Result:</h4>\n";
        try {
            $stmt = $db->prepare("CALL update_student_progress(?)");
            $stmt->execute([$testUserId]);
            
            // Check the updated progress
            $stmt = $db->prepare("SELECT * FROM student_progress WHERE user_id = ?");
            $stmt->execute([$testUserId]);
            $progress = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($progress) {
                echo "<p><strong>Current Progress:</strong></p>\n";
                echo "<ul>\n";
                echo "<li>Literacy Progress: " . htmlspecialchars($progress['literacy_progress']) . "%</li>\n";
                echo "<li>Math Progress: " . htmlspecialchars($progress['math_progress']) . "%</li>\n";
                echo "<li>Total Score: " . htmlspecialchars($progress['total_score']) . "</li>\n";
                echo "<li>Games Played: " . htmlspecialchars($progress['games_played']) . "</li>\n";
                echo "</ul>\n";
            }
            
        } catch (Exception $e) {
            echo "<p>❌ Error with stored procedure: " . htmlspecialchars($e->getMessage()) . "</p>\n";
        }
    }
    
    // 5. Check if there are any number_puzzle or math_challenge games
    echo "<h3>5. Default Math Games Check:</h3>\n";
    $stmt = $db->query("
        SELECT game_type, COUNT(*) as count 
        FROM game_sessions 
        WHERE game_type IN ('number_puzzle', 'math_challenge') 
        AND completed_at IS NOT NULL
        GROUP BY game_type
    ");
    $defaultMath = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($defaultMath)) {
        echo "<p>❌ No default math games (number_puzzle, math_challenge) found in database</p>\n";
        echo "<p><strong>This means:</strong> Either no one has played the default math games, or they're being saved with different game types.</p>\n";
    } else {
        echo "<table border='1' style='border-collapse: collapse;'>\n";
        echo "<tr><th>Game Type</th><th>Count</th></tr>\n";
        foreach ($defaultMath as $game) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($game['game_type']) . "</td>";
            echo "<td>" . htmlspecialchars($game['count']) . "</td>";
            echo "</tr>\n";
        }
        echo "</table>\n";
    }
    
} catch (Exception $e) {
    echo "<p>❌ Error: " . htmlspecialchars($e->getMessage()) . "</p>\n";
}
?>
