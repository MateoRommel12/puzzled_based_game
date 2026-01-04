<?php
/**
 * WEKA Clustering Integration via Render API
 * This file calls a WEKA service deployed on Render
 * 
 * Setup:
 * 1. Deploy weka-service to Render (see RENDER_WEKA_SETUP.md)
 * 2. Set RENDER_WEKA_API_URL in config or environment variable
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/clustering-local.php';

// Configuration - Set your Render service URL here
// Get this URL after deploying to Render: https://your-service.onrender.com
define('RENDER_WEKA_API_URL', getenv('RENDER_WEKA_API_URL') ?: 'https://your-service.onrender.com/api');

/**
 * Run WEKA clustering via Render API
 */
function runWekaClusteringRender($category = 'all', $numClusters = 3) {
    try {
        $db = getDBConnection();
        
        // Get student data
        $students = getStudentData($db, $category);
        
        if (count($students) < $numClusters) {
            return [
                'success' => false,
                'message' => "Need at least {$numClusters} students for clustering"
            ];
        }
        
        // Prepare student data for API
        $studentData = [];
        foreach ($students as $student) {
            $studentData[] = [
                'user_id' => (int)$student['user_id'],
                'literacy_score' => (float)$student['literacy_score'],
                'math_score' => (float)$student['math_score'],
                'games_played' => (int)$student['games_played'],
                'total_score' => (float)$student['total_score']
            ];
        }
        
        // Prepare request payload
        $payload = [
            'students' => $studentData,
            'category' => $category,
            'clusters' => $numClusters
        ];
        
        // Call Render API
        $apiUrl = RENDER_WEKA_API_URL . '/cluster';
        $ch = curl_init($apiUrl);
        
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Accept: application/json'
            ],
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_TIMEOUT => 60, // Render free tier may take time to wake up
            CURLOPT_CONNECTTIMEOUT => 30
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        if ($curlError) {
            throw new Exception("API request failed: " . $curlError);
        }
        
        if ($httpCode !== 200) {
            $errorData = json_decode($response, true);
            $errorMsg = $errorData['message'] ?? "API returned status code {$httpCode}";
            throw new Exception("Render API error: " . $errorMsg);
        }
        
        $result = json_decode($response, true);
        
        if (!$result || !isset($result['success']) || !$result['success']) {
            $errorMsg = $result['message'] ?? 'Unknown error from Render API';
            throw new Exception("Clustering failed: " . $errorMsg);
        }
        
        // Convert API response to our format
        $clusterResults = [];
        foreach ($result['assignments'] as $assignment) {
            // Find corresponding student
            $student = null;
            foreach ($students as $s) {
                if ($s['user_id'] == $assignment['userId']) {
                    $student = $s;
                    break;
                }
            }
            
            if ($student) {
                $clusterResults[] = [
                    'user_id' => $student['user_id'],
                    'cluster' => $assignment['clusterNumber'],
                    'label' => $assignment['clusterLabel'],
                    'score' => $assignment['score'],
                    'literacy_score' => (float)$student['literacy_score'],
                    'math_score' => (float)$student['math_score']
                ];
            }
        }
        
        // Save to database
        saveClusteringResults($db, $students, $clusterResults, $category);
        
        // Generate report
        $report = generateClusteringReport($students, $clusterResults);
        
        $categoryLabel = $category === 'literacy' ? 'Literacy' : ($category === 'math' ? 'Math' : 'Overall');
        
        return [
            'success' => true,
            'message' => $categoryLabel . ' WEKA clustering completed successfully (via Render)',
            'report' => $report,
            'category' => $category,
            'algorithm' => 'WEKA K-Means (Render API)'
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'WEKA clustering failed: ' . $e->getMessage()
        ];
    }
}

/**
 * Check if Render WEKA API is available
 */
function checkRenderWekaAvailability() {
    $apiUrl = RENDER_WEKA_API_URL . '/health';
    
    $ch = curl_init($apiUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_CONNECTTIMEOUT => 5
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'available' => $httpCode === 200,
        'http_code' => $httpCode,
        'response' => $response
    ];
}

// API Endpoint Handler
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action'])) {
    header('Content-Type: application/json; charset=utf-8');
    
    // Check admin authentication
    if (!isset($_SESSION['admin_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit;
    }
    
    $action = $_GET['action'];
    
    switch ($action) {
        case 'check':
            // Check Render API availability
            $checks = checkRenderWekaAvailability();
            echo json_encode([
                'success' => true,
                'checks' => $checks,
                'api_url' => RENDER_WEKA_API_URL,
                'all_ok' => $checks['available']
            ]);
            break;
            
        case 'run':
            $category = $_GET['category'] ?? 'all';
            $numClusters = isset($_GET['clusters']) ? (int)$_GET['clusters'] : 3;
            
            $result = runWekaClusteringRender($category, $numClusters);
            echo json_encode($result);
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}

?>

