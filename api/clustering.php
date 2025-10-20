<?php
/**
 * Clustering API
 * Handles automatic and manual clustering operations
 */

// Start session first before any output
session_start();

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if user is admin (for manual clustering)
if (!isset($_SESSION['admin_id']) && $action === 'run-manual') {
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
        case 'run':
        case 'run-manual':
            handleRunClustering($db, $action === 'run-manual');
            break;
            
        case 'status':
            handleGetClusteringStatus($db);
            break;
            
        case 'should-run':
            handleShouldRunClustering($db);
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
 * Run clustering
 */
function handleRunClustering($db, $isManual = false) {
    // Check if clustering should run (unless manual override)
    if (!$isManual && !shouldRunClustering($db)) {
        echo json_encode([
            'success' => true,
            'message' => 'Clustering not needed - no new data since last run',
            'skipped' => true
        ]);
        return;
    }
    
    // Get project root directory
    $projectRoot = dirname(__DIR__);
    
    // Try both possible locations for the Python script
    $pythonScript = $projectRoot . '/clustering/cluster_students.py';
    if (!file_exists($pythonScript)) {
        $pythonScript = $projectRoot . '/python/cluster_students.py';
    }
    
    // Check if Python script exists
    if (!file_exists($pythonScript)) {
        throw new Exception('Clustering script not found: ' . $pythonScript);
    }
    
    // Run Python clustering script
    $command = "cd " . escapeshellarg($projectRoot) . " && python " . escapeshellarg($pythonScript) . " 2>&1";
    $output = [];
    $returnCode = 0;
    
    exec($command, $output, $returnCode);
    
    if ($returnCode !== 0) {
        $errorMessage = implode("\n", $output);
        throw new Exception('Clustering failed: ' . $errorMessage);
    }
    
    // Update last clustering timestamp
    updateLastClusteringTime($db);
    
    // Get latest clustering results
    $latestResults = getLatestClusteringResults($db);
    
    echo json_encode([
        'success' => true,
        'message' => 'Clustering completed successfully',
        'output' => $output,
        'results' => $latestResults,
        'manual' => $isManual
    ]);
}

/**
 * Get clustering status
 */
function handleGetClusteringStatus($db) {
    $stmt = $db->prepare("
        SELECT 
            MAX(analysis_date) as last_clustering,
            COUNT(*) as total_clusters,
            COUNT(DISTINCT DATE(analysis_date)) as clustering_days
        FROM clustering_results
    ");
    $stmt->execute();
    $status = $stmt->fetch();
    
    // Get recent game sessions count
    $stmt = $db->prepare("
        SELECT COUNT(*) as new_games
        FROM game_sessions 
        WHERE completed_at > COALESCE((SELECT MAX(analysis_date) FROM clustering_results), '1900-01-01')
    ");
    $stmt->execute();
    $gameStats = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'status' => [
            'last_clustering' => $status['last_clustering'],
            'total_clusters' => $status['total_clusters'],
            'clustering_days' => $status['clustering_days'],
            'new_games_since_last' => $gameStats['new_games'],
            'should_run' => shouldRunClustering($db)
        ]
    ]);
}

/**
 * Check if clustering should run
 */
function handleShouldRunClustering($db) {
    $shouldRun = shouldRunClustering($db);
    $reason = getClusteringReason($db);
    
    echo json_encode([
        'success' => true,
        'should_run' => $shouldRun,
        'reason' => $reason
    ]);
}

/**
 * Determine if clustering should run automatically
 */
function shouldRunClustering($db) {
    // Get last clustering time
    $stmt = $db->prepare("SELECT MAX(analysis_date) as last_clustering FROM clustering_results");
    $stmt->execute();
    $result = $stmt->fetch();
    $lastClustering = $result['last_clustering'];
    
    // If never run before, run it
    if (!$lastClustering) {
        return true;
    }
    
    // Check if it's been more than 24 hours
    $stmt = $db->prepare("SELECT TIMESTAMPDIFF(HOUR, ?, NOW()) as hours_since");
    $stmt->execute([$lastClustering]);
    $result = $stmt->fetch();
    $hoursSince = $result['hours_since'];
    
    // Run if more than 24 hours have passed
    if ($hoursSince >= 24) {
        return true;
    }
    
    // Check if there are enough new games (threshold: 10 games)
    $stmt = $db->prepare("
        SELECT COUNT(*) as new_games
        FROM game_sessions 
        WHERE completed_at > ?
    ");
    $stmt->execute([$lastClustering]);
    $result = $stmt->fetch();
    
    return $result['new_games'] >= 10;
}

/**
 * Get reason why clustering should/shouldn't run
 */
function getClusteringReason($db) {
    $stmt = $db->prepare("SELECT MAX(analysis_date) as last_clustering FROM clustering_results");
    $stmt->execute();
    $result = $stmt->fetch();
    $lastClustering = $result['last_clustering'];
    
    if (!$lastClustering) {
        return "Never run before - initial clustering needed";
    }
    
    $stmt = $db->prepare("SELECT TIMESTAMPDIFF(HOUR, ?, NOW()) as hours_since");
    $stmt->execute([$lastClustering]);
    $result = $stmt->fetch();
    $hoursSince = $result['hours_since'];
    
    if ($hoursSince >= 24) {
        return "Last clustering was {$hoursSince} hours ago (threshold: 24 hours)";
    }
    
    $stmt = $db->prepare("
        SELECT COUNT(*) as new_games
        FROM game_sessions 
        WHERE completed_at > ?
    ");
    $stmt->execute([$lastClustering]);
    $result = $stmt->fetch();
    $newGames = $result['new_games'];
    
    if ($newGames >= 10) {
        return "{$newGames} new games since last clustering (threshold: 10 games)";
    }
    
    return "Only {$newGames} new games since last clustering (need 10+) and only {$hoursSince} hours passed (need 24+)";
}

/**
 * Update last clustering timestamp
 */
function updateLastClusteringTime($db) {
    // This will be updated when new clustering_results are inserted by the Python script
    // But we can also create a simple tracking table if needed
    try {
        $db->query("
            CREATE TABLE IF NOT EXISTS clustering_status (
                id INT PRIMARY KEY DEFAULT 1,
                last_run TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_id (id)
            )
        ");
        
        $db->query("
            INSERT INTO clustering_status (id, last_run) 
            VALUES (1, NOW()) 
            ON DUPLICATE KEY UPDATE last_run = NOW()
        ");
    } catch (Exception $e) {
        // Ignore errors - not critical
    }
}

/**
 * Get latest clustering results
 */
function getLatestClusteringResults($db) {
    $stmt = $db->prepare("
        SELECT 
            cluster_id,
            user_id,
            cluster_number,
            cluster_label,
            literacy_score,
            math_score,
            overall_performance,
            analysis_date,
            is_current
        FROM clustering_results 
        WHERE analysis_date = (SELECT MAX(analysis_date) FROM clustering_results)
        ORDER BY cluster_id
    ");
    $stmt->execute();
    return $stmt->fetchAll();
}
?>
