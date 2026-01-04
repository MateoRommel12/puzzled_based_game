<?php
/**
 * Local Clustering Implementation (No Python needed)
 * This runs directly on your Hostinger server using PHP
 */

function runLocalClustering($category = 'all') {
    try {
        $db = getDBConnection();
        
        // Get student data filtered by category
        $students = getStudentData($db, $category);
        
        if (count($students) < 3) {
            echo json_encode([
                'success' => false,
                'message' => 'Need at least 3 students with game data for clustering'
            ]);
            return;
        }
        
        // Perform simple clustering based on category performance
        $clusters = performSimpleClustering($students, $category);
        
        // Save results
        saveClusteringResults($db, $students, $clusters, $category);
        
        // Generate report
        $report = generateClusteringReport($students, $clusters);
        
        $categoryLabel = $category === 'literacy' ? 'Literacy' : ($category === 'math' ? 'Math' : 'Overall');
        
        echo json_encode([
            'success' => true,
            'message' => $categoryLabel . ' clustering completed successfully',
            'report' => $report,
            'category' => $category
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Clustering failed: ' . $e->getMessage()
        ]);
    }
}

function getStudentData($db, $category = 'all') {
    // Build query based on category
    $categoryFilter = "";
    if ($category === 'literacy') {
        // Filter for students who have played literacy games
        $categoryFilter = " AND EXISTS (
            SELECT 1 FROM game_sessions gs 
            WHERE gs.user_id = u.user_id 
            AND gs.game_category = 'literacy' 
            AND gs.completed_at IS NOT NULL
        )";
    } elseif ($category === 'math') {
        // Filter for students who have played math games
        $categoryFilter = " AND EXISTS (
            SELECT 1 FROM game_sessions gs 
            WHERE gs.user_id = u.user_id 
            AND gs.game_category = 'math' 
            AND gs.completed_at IS NOT NULL
        )";
    }
    
    $stmt = $db->prepare("
        SELECT 
            u.user_id,
            u.full_name,
            COALESCE(sp.literacy_progress, 0) as literacy_score,
            COALESCE(sp.math_progress, 0) as math_score,
            COALESCE(sp.total_score, 0) as total_score,
            COALESCE(sp.games_played, 0) as games_played,
            COALESCE(sp.performance_level, 'low') as performance_level
        FROM users u
        LEFT JOIN student_progress sp ON u.user_id = sp.user_id
        WHERE u.is_active = 1 
            AND sp.games_played > 0
            $categoryFilter
        ORDER BY u.user_id
    ");
    
    $stmt->execute();
    return $stmt->fetchAll();
}

function performSimpleClustering($students, $category = 'all') {
    // Simple clustering based on category performance
    $clusters = [];
    
    foreach ($students as $student) {
        // Determine score based on category
        if ($category === 'literacy') {
            $score = (float)$student['literacy_score'];
        } elseif ($category === 'math') {
            $score = (float)$student['math_score'];
        } else {
            // For 'all', use average of both
            $score = ((float)$student['literacy_score'] + (float)$student['math_score']) / 2;
        }
        
        // Cluster based on score thresholds
        if ($score >= 75) {
            $cluster = 0; // High Achievers
            $label = 'High Achievers';
        } elseif ($score >= 50) {
            $cluster = 1; // Average Performers
            $label = 'Average Performers';
        } else {
            $cluster = 2; // Needs Support
            $label = 'Needs Support';
        }
        
        $clusters[] = [
            'user_id' => $student['user_id'],
            'cluster' => $cluster,
            'label' => $label,
            'score' => $score,
            'literacy_score' => (float)$student['literacy_score'],
            'math_score' => (float)$student['math_score']
        ];
    }
    
    return $clusters;
}

function saveClusteringResults($db, $students, $clusters, $category = 'all') {
    // Delete old clustering results
    $stmt = $db->prepare("DELETE FROM clustering_reports");
    $stmt->execute();
    
    // Mark old clustering_results for this category as not current
    // For now, mark all as not current since we're doing category-specific clustering
    $stmt = $db->prepare("UPDATE clustering_results SET is_current = 0");
    $stmt->execute();
    
    // Group students by cluster
    $clusterGroups = [
        0 => ['High Achievers', []],
        1 => ['Average Performers', []],
        2 => ['Needs Support', []]
    ];
    
    foreach ($clusters as $item) {
        $clusterGroups[$item['cluster']][1][] = $item['user_id'];
    }
    
    // Save report
    $stmt = $db->prepare("
        INSERT INTO clustering_reports 
        (analysis_date, total_students, number_of_clusters, report_data, created_at)
        VALUES (NOW(), ?, ?, ?, NOW())
    ");
    
    $reportData = json_encode([
        'clusters' => array_map(function($group, $clusterNum) {
            return [
                'cluster_number' => $clusterNum,
                'label' => $group[0],
                'student_count' => count($group[1]),
                'percentage' => 0 // Will calculate later
            ];
        }, $clusterGroups, array_keys($clusterGroups))
    ]);
    
    $stmt->execute([
        count($students),
        3,
        $reportData
    ]);
    
    // ALSO save to clustering_results table for admin dashboard display
    $stmt = $db->prepare("
        INSERT INTO clustering_results 
        (user_id, cluster_number, cluster_label, literacy_score, math_score, 
         overall_performance, features, analysis_date, is_current)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 1)
    ");
    
    // Create student lookup
    $studentMap = [];
    foreach ($students as $student) {
        $studentMap[$student['user_id']] = $student;
    }
    
    foreach ($clusters as $item) {
        $student = $studentMap[$item['user_id']];
        $literacyScore = (float)$student['literacy_score'];
        $mathScore = (float)$student['math_score'];
        
        // Calculate overall performance based on category
        if ($category === 'literacy') {
            $overallPerformance = $literacyScore; // Use literacy score for literacy clustering
        } elseif ($category === 'math') {
            $overallPerformance = $mathScore; // Use math score for math clustering
        } else {
            $overallPerformance = ($literacyScore + $mathScore) / 2; // Average for overall
        }
        
        $features = json_encode([
            'literacy_score' => $literacyScore,
            'math_score' => $mathScore,
            'total_score' => (float)$student['total_score'],
            'games_played' => (int)$student['games_played'],
            'category' => $category
        ]);
        
        $stmt->execute([
            $item['user_id'],
            $item['cluster'],
            $item['label'],
            $literacyScore,
            $mathScore,
            $overallPerformance,
            $features
        ]);
    }
}

function generateClusteringReport($students, $clusters) {
    // Count students in each cluster
    $clusterCounts = [0 => 0, 1 => 0, 2 => 0];
    foreach ($clusters as $item) {
        $clusterCounts[$item['cluster']]++;
    }
    
    $totalStudents = count($students);
    $labels = ['High Achievers', 'Average Performers', 'Needs Support'];
    
    $report = [
        'analysis_date' => date('Y-m-d H:i:s'),
        'total_students' => $totalStudents,
        'number_of_clusters' => 3,
        'clusters' => []
    ];
    
    foreach ($clusterCounts as $clusterNum => $count) {
        $report['clusters'][] = [
            'cluster_number' => $clusterNum,
            'label' => $labels[$clusterNum],
            'student_count' => $count,
            'percentage' => round(($count / $totalStudents) * 100, 1),
            'average_performance' => 0, // Calculate if needed
            'literacy_average' => 0,
            'math_average' => 0,
            'accuracy_average' => 0
        ];
    }
    
    return $report;
}

function getClusteringStatus() {
    try {
        $db = getDBConnection();
        
        // Check if clustering_reports table exists
        $stmt = $db->prepare("
            SELECT * FROM clustering_reports 
            ORDER BY created_at DESC 
            LIMIT 1
        ");
        $stmt->execute();
        $report = $stmt->fetch();
        
        // Count new games since last clustering
        $newGamesCount = 0;
        if ($report) {
            $stmt = $db->prepare("
                SELECT COUNT(*) as count 
                FROM game_sessions 
                WHERE completed_at > ?
            ");
            $stmt->execute([$report['created_at']]);
            $newGamesCount = $stmt->fetch()['count'];
        } else {
            // If no previous clustering, count all completed games
            $stmt = $db->prepare("
                SELECT COUNT(*) as count 
                FROM game_sessions 
                WHERE completed_at IS NOT NULL
            ");
            $stmt->execute();
            $newGamesCount = $stmt->fetch()['count'];
        }
        
        echo json_encode([
            'success' => true,
            'last_clustering' => $report ? $report['created_at'] : null,
            'new_games_since_last' => $newGamesCount,
            'should_run' => $newGamesCount >= 10  // Run clustering every 10 games
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
}
?>
