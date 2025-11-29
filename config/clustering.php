<?php
/**
 * Clustering Integration Functions
 * Handles communication with PythonAnywhere clustering service
 */

function runClusteringOnPythonAnywhere() {
    $url = 'https://matts.pythonanywhere.com/cluster';
    
    // Note: PythonAnywhere may not be able to connect to Hostinger MySQL
    // Hostinger blocks external connections by default
    // Solution: Use local PHP clustering instead
    
    // Prepare the request
    $data = json_encode([
        'trigger' => 'clustering',
        'timestamp' => time()
    ]);
    
    // Make the request
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => [
                'Content-Type: application/json',
                'User-Agent: ClusteringGame-PHP/1.0'
            ],
            'content' => $data,
            'timeout' => 60  // 60 seconds timeout
        ]
    ]);
    
    try {
        $response = file_get_contents($url, false, $context);
        
        if ($response === false) {
            error_log("Failed to connect to clustering service");
            return false;
        }
        
        $result = json_decode($response, true);
        
        if ($result && $result['success']) {
            // Log successful clustering
            error_log("Clustering completed successfully: " . $result['message']);
            
            // You can also save the report to your database
            if (isset($result['report'])) {
                saveClusteringReport($result['report']);
            }
            
            return true;
        } else {
            error_log("Clustering failed: " . ($result['error'] ?? 'Unknown error'));
            return false;
        }
        
    } catch (Exception $e) {
        error_log("Clustering service error: " . $e->getMessage());
        return false;
    }
}

function saveClusteringReport($report) {
    // Save clustering report to your database
    $db = getDBConnection();
    
    try {
        $stmt = $db->prepare("
            INSERT INTO clustering_reports 
            (analysis_date, total_students, number_of_clusters, report_data, created_at)
            VALUES (?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $report['analysis_date'],
            $report['total_students'],
            $report['number_of_clusters'],
            json_encode($report)
        ]);
        
        return true;
    } catch (Exception $e) {
        error_log("Failed to save clustering report: " . $e->getMessage());
        return false;
    }
}

function shouldRunClustering($db) {
    // Run clustering every 10 completed games
    $stmt = $db->prepare("
        SELECT COUNT(*) as total_completed 
        FROM game_sessions 
        WHERE completed_at IS NOT NULL
    ");
    $stmt->execute();
    $result = $stmt->fetch();
    
    return ($result['total_completed'] % 10 == 0);
}

function runClusteringAsync() {
    // Run local clustering in background (instead of PythonAnywhere)
    $url = 'http' . (isset($_SERVER['HTTPS']) ? 's' : '') . '://' . 
           $_SERVER['HTTP_HOST'] . 
           dirname(dirname($_SERVER['REQUEST_URI'])) . 
           '/api/clustering.php?action=run';
    
    // Use cURL for async request
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['trigger' => 'clustering']));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 1); // 1 second timeout for async
    
    // Execute in background
    curl_exec($ch);
    curl_close($ch);
}

function getClusteringServiceStatus() {
    $url = 'https://matts.pythonanywhere.com/health';
    
    try {
        $response = file_get_contents($url);
        $result = json_decode($response, true);
        
        return [
            'success' => true,
            'service_status' => $result['status'] ?? 'unknown',
            'service_url' => 'https://matts.pythonanywhere.com'
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Clustering service unavailable: ' . $e->getMessage()
        ];
    }
}
