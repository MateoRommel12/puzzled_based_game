<?php
/**
 * Clustering API - Manual trigger for clustering
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/clustering-local.php';

header('Content-Type: application/json; charset=utf-8');

// Check if user is admin
if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Admin access required']);
    exit();
}

$action = $_GET['action'] ?? '';
$category = $_GET['category'] ?? 'all'; // 'literacy', 'math', or 'all'
$useWeka = isset($_GET['use_weka']) && $_GET['use_weka'] === 'true'; // Optional WEKA flag
$useWekaRender = isset($_GET['use_weka_render']) && $_GET['use_weka_render'] === 'true'; // WEKA via Render API
$useEnhanced = isset($_GET['use_enhanced']) && $_GET['use_enhanced'] === 'true'; // Enhanced PHP clustering

switch ($action) {
    case 'run':
        if ($useWekaRender) {
            // Use WEKA clustering via Render API (works on shared hosting!)
            require_once __DIR__ . '/clustering-weka-render.php';
            $numClusters = isset($_GET['clusters']) ? (int)$_GET['clusters'] : 3;
            $result = runWekaClusteringRender($category, $numClusters);
            echo json_encode($result);
        } elseif ($useWeka) {
            // Use WEKA clustering locally (requires Java/VPS)
            require_once __DIR__ . '/clustering-weka.php';
            $numClusters = isset($_GET['clusters']) ? (int)$_GET['clusters'] : 3;
            $result = runWekaClustering($category, $numClusters);
            echo json_encode($result);
        } elseif ($useEnhanced) {
            // Use enhanced PHP K-Means clustering (works on shared hosting)
            require_once __DIR__ . '/clustering-enhanced.php';
            $numClusters = isset($_GET['clusters']) ? (int)$_GET['clusters'] : 3;
            $result = runEnhancedClustering($category, $numClusters);
            echo json_encode($result);
        } else {
            // Use simple threshold-based clustering (default, fastest)
            runLocalClustering($category);
        }
        break;
        
    case 'status':
        getClusteringStatus();
        break;
        
    case 'check_weka':
        // Check WEKA availability
        require_once __DIR__ . '/clustering-weka.php';
        $checks = checkWekaAvailability();
        echo json_encode([
            'success' => true,
            'checks' => $checks,
            'all_ok' => array_reduce($checks, function($carry, $item) {
                return $carry && $item;
            }, true)
        ]);
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
?>