<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");

try {
    require_once __DIR__ . "/../config/database.php";
    
    $db = getDBConnection();
    $action = $_GET["action"] ?? "";
    
    switch ($action) {
        case "status":
            // Get last clustering time
            $stmt = $db->prepare("SELECT MAX(analysis_date) as last_clustering FROM clustering_results");
            $stmt->execute();
            $result = $stmt->fetch();
            $lastClustering = $result["last_clustering"];
            
            // Get recent game sessions count
            $stmt = $db->prepare("
                SELECT COUNT(*) as new_games
                FROM game_sessions 
                WHERE completed_at > COALESCE((SELECT MAX(analysis_date) FROM clustering_results), \"1900-01-01\")
            ");
            $stmt->execute();
            $gameStats = $stmt->fetch();
            
            echo json_encode([
                "success" => true,
                "status" => [
                    "last_clustering" => $lastClustering,
                    "new_games_since_last" => $gameStats["new_games"],
                    "should_run" => !$lastClustering || $gameStats["new_games"] >= 10
                ]
            ]);
            break;
            
        case "run":
            // Test clustering
            echo json_encode([
                "success" => true,
                "message" => "Clustering test successful",
                "timestamp" => date("Y-m-d H:i:s")
            ]);
            break;
            
        default:
            echo json_encode([
                "success" => false,
                "message" => "Invalid action"
            ]);
    }
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>