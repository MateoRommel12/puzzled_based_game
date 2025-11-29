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

switch ($action) {
    case 'run':
        runLocalClustering();
        break;
        
    case 'status':
        getClusteringStatus();
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
?>