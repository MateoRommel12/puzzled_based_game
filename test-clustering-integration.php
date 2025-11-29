<?php
/**
 * Test Clustering Integration
 * Simple test script to verify PythonAnywhere clustering service
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/clustering.php';

echo "<h1>Clustering Integration Test</h1>";

// Test 1: Check service status
echo "<h2>Test 1: Service Status</h2>";
$status = getClusteringServiceStatus();
if ($status['success']) {
    echo "<p style='color: green;'>✅ Service is online: " . $status['service_status'] . "</p>";
} else {
    echo "<p style='color: red;'>❌ Service is offline: " . $status['message'] . "</p>";
}

// Test 2: Database connection
echo "<h2>Test 2: Database Connection</h2>";
try {
    $db = getDBConnection();
    echo "<p style='color: green;'>✅ Database connection successful</p>";
    
    // Check if clustering_reports table exists
    $stmt = $db->prepare("SHOW TABLES LIKE 'clustering_reports'");
    $stmt->execute();
    if ($stmt->fetch()) {
        echo "<p style='color: green;'>✅ clustering_reports table exists</p>";
    } else {
        echo "<p style='color: orange;'>⚠️ clustering_reports table missing - run complete-setup.sql</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Database connection failed: " . $e->getMessage() . "</p>";
}

// Test 3: Test clustering function
echo "<h2>Test 3: Clustering Function</h2>";
echo "<p>Testing clustering function (this will make a real API call)...</p>";

// First, let's check if we have students with game data
try {
    $db = getDBConnection();
    $stmt = $db->prepare("
        SELECT COUNT(DISTINCT u.user_id) as students_with_data 
        FROM users u 
        INNER JOIN game_sessions gs ON u.user_id = gs.user_id 
        WHERE u.is_active = 1 AND gs.completed_at IS NOT NULL
    ");
    $stmt->execute();
    $studentsWithData = $stmt->fetch()['students_with_data'];
    
    echo "<p>Students with game data: <strong>{$studentsWithData}</strong></p>";
    
    if ($studentsWithData < 3) {
        echo "<p style='color: orange;'>⚠️ Need at least 3 students with game data for clustering</p>";
        echo "<p>Try playing some games first, then run clustering again.</p>";
    } else {
        echo "<p style='color: green;'>✅ Sufficient data for clustering</p>";
        
        $startTime = microtime(true);
        $result = runClusteringOnPythonAnywhere();
        $endTime = microtime(true);
        $duration = round(($endTime - $startTime) * 1000, 2);

        if ($result) {
            echo "<p style='color: green;'>✅ Clustering completed successfully in {$duration}ms</p>";
        } else {
            echo "<p style='color: red;'>❌ Clustering failed</p>";
            
            // Let's try a direct API call to see the error
            echo "<h3>Debug: Direct API Call</h3>";
            $url = 'https://matts.pythonanywhere.com/cluster';
            $data = json_encode(['trigger' => 'test']);
            
            $context = stream_context_create([
                'http' => [
                    'method' => 'POST',
                    'header' => 'Content-Type: application/json',
                    'content' => $data,
                    'timeout' => 30
                ]
            ]);
            
            $response = file_get_contents($url, false, $context);
            echo "<p><strong>Raw Response:</strong></p>";
            echo "<pre style='background: #f5f5f5; padding: 10px; border-radius: 5px;'>";
            echo htmlspecialchars($response);
            echo "</pre>";
        }
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error checking student data: " . $e->getMessage() . "</p>";
}

// Test 4: Check latest clustering report
echo "<h2>Test 4: Latest Clustering Report</h2>";
try {
    $db = getDBConnection();
    $stmt = $db->prepare("
        SELECT * FROM clustering_reports 
        ORDER BY created_at DESC 
        LIMIT 1
    ");
    $stmt->execute();
    $report = $stmt->fetch();
    
    if ($report) {
        echo "<p style='color: green;'>✅ Latest report found:</p>";
        echo "<ul>";
        echo "<li>Date: " . $report['analysis_date'] . "</li>";
        echo "<li>Students: " . $report['total_students'] . "</li>";
        echo "<li>Clusters: " . $report['number_of_clusters'] . "</li>";
        echo "<li>Created: " . $report['created_at'] . "</li>";
        echo "</ul>";
        
        // Decode and show report data
        $reportData = json_decode($report['report_data'], true);
        if ($reportData && isset($reportData['clusters'])) {
            echo "<h3>Cluster Details:</h3>";
            foreach ($reportData['clusters'] as $cluster) {
                echo "<div style='border: 1px solid #ccc; padding: 10px; margin: 5px;'>";
                echo "<strong>" . $cluster['label'] . "</strong><br>";
                echo "Students: " . $cluster['student_count'] . " (" . $cluster['percentage'] . "%)<br>";
                echo "Performance: " . $cluster['average_performance'] . "%<br>";
                echo "</div>";
            }
        }
    } else {
        echo "<p style='color: orange;'>⚠️ No clustering reports found</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error checking reports: " . $e->getMessage() . "</p>";
}

echo "<h2>Integration Test Complete!</h2>";
echo "<p><a href='admin/admin-dashboard.php'>Go to Admin Dashboard</a></p>";
echo "<p><a href='admin/clustering-management.php'>Go to Clustering Management</a></p>";
?>
