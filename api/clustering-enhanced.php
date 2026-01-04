<?php
/**
 * Enhanced PHP Clustering (Hostinger Compatible)
 * 
 * This is a pure PHP implementation of K-Means clustering
 * that works on shared hosting without Java/WEKA.
 * 
 * Features:
 * - K-Means++ initialization
 * - Euclidean distance metric
 * - Multiple cluster validation
 * - Works on Hostinger shared hosting
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Enhanced K-Means clustering with K-Means++ initialization
 */
function performEnhancedKMeans($students, $category = 'all', $numClusters = 3) {
    if (count($students) < $numClusters) {
        return null;
    }
    
    // Extract features based on category
    $features = extractFeatures($students, $category);
    
    // Normalize features
    $normalizedFeatures = normalizeFeatures($features);
    
    // Initialize centroids using K-Means++ (better than random)
    $centroids = initializeCentroidsKMeansPlusPlus($normalizedFeatures, $numClusters);
    
    // Perform K-Means iteration
    $maxIterations = 100;
    $convergenceThreshold = 0.01;
    
    for ($iteration = 0; $iteration < $maxIterations; $iteration++) {
        // Assign points to nearest centroid
        $clusters = assignToClusters($normalizedFeatures, $centroids);
        
        // Calculate new centroids
        $newCentroids = calculateCentroids($normalizedFeatures, $clusters, $numClusters);
        
        // Check convergence
        $converged = true;
        for ($i = 0; $i < $numClusters; $i++) {
            $distance = euclideanDistance($centroids[$i], $newCentroids[$i]);
            if ($distance > $convergenceThreshold) {
                $converged = false;
                break;
            }
        }
        
        $centroids = $newCentroids;
        
        if ($converged) {
            break;
        }
    }
    
    // Final assignment
    $finalClusters = assignToClusters($normalizedFeatures, $centroids);
    
    // Map back to students with labels
    return mapClustersToStudents($students, $finalClusters, $centroids, $category);
}

/**
 * Extract features from students based on category
 */
function extractFeatures($students, $category) {
    $features = [];
    
    foreach ($students as $student) {
        if ($category === 'literacy') {
            $features[] = [
                (float)$student['literacy_score'],
                (float)$student['games_played'],
                (float)$student['total_score']
            ];
        } elseif ($category === 'math') {
            $features[] = [
                (float)$student['math_score'],
                (float)$student['games_played'],
                (float)$student['total_score']
            ];
        } else {
            $features[] = [
                (float)$student['literacy_score'],
                (float)$student['math_score'],
                (float)$student['games_played'],
                (float)$student['total_score']
            ];
        }
    }
    
    return $features;
}

/**
 * Normalize features to [0, 1] range
 */
function normalizeFeatures($features) {
    if (empty($features)) {
        return [];
    }
    
    $numFeatures = count($features[0]);
    $mins = array_fill(0, $numFeatures, PHP_INT_MAX);
    $maxs = array_fill(0, $numFeatures, PHP_INT_MIN);
    
    // Find min and max for each feature
    foreach ($features as $feature) {
        for ($i = 0; $i < $numFeatures; $i++) {
            $mins[$i] = min($mins[$i], $feature[$i]);
            $maxs[$i] = max($maxs[$i], $feature[$i]);
        }
    }
    
    // Normalize
    $normalized = [];
    foreach ($features as $feature) {
        $normalizedFeature = [];
        for ($i = 0; $i < $numFeatures; $i++) {
            $range = $maxs[$i] - $mins[$i];
            if ($range > 0) {
                $normalizedFeature[] = ($feature[$i] - $mins[$i]) / $range;
            } else {
                $normalizedFeature[] = 0.5; // Default if no variation
            }
        }
        $normalized[] = $normalizedFeature;
    }
    
    return $normalized;
}

/**
 * K-Means++ initialization (better than random)
 */
function initializeCentroidsKMeansPlusPlus($features, $numClusters) {
    $numPoints = count($features);
    $centroids = [];
    
    // First centroid: random point
    $centroids[0] = $features[rand(0, $numPoints - 1)];
    
    // Select remaining centroids
    for ($k = 1; $k < $numClusters; $k++) {
        $distances = [];
        $totalDistance = 0;
        
        // Calculate distance from each point to nearest centroid
        foreach ($features as $i => $point) {
            $minDist = PHP_INT_MAX;
            for ($j = 0; $j < $k; $j++) {
                $dist = euclideanDistance($point, $centroids[$j]);
                $minDist = min($minDist, $dist);
            }
            $distances[$i] = $minDist;
            $totalDistance += $minDist;
        }
        
        // Select next centroid with probability proportional to distance squared
        $random = mt_rand() / mt_getrandmax() * $totalDistance;
        $cumulative = 0;
        foreach ($distances as $i => $dist) {
            $cumulative += $dist;
            if ($cumulative >= $random) {
                $centroids[$k] = $features[$i];
                break;
            }
        }
    }
    
    return $centroids;
}

/**
 * Calculate Euclidean distance between two points
 */
function euclideanDistance($point1, $point2) {
    $sum = 0;
    $dim = min(count($point1), count($point2));
    
    for ($i = 0; $i < $dim; $i++) {
        $diff = $point1[$i] - $point2[$i];
        $sum += $diff * $diff;
    }
    
    return sqrt($sum);
}

/**
 * Assign each point to nearest centroid
 */
function assignToClusters($features, $centroids) {
    $clusters = [];
    
    foreach ($features as $point) {
        $minDist = PHP_INT_MAX;
        $nearestCluster = 0;
        
        foreach ($centroids as $i => $centroid) {
            $dist = euclideanDistance($point, $centroid);
            if ($dist < $minDist) {
                $minDist = $dist;
                $nearestCluster = $i;
            }
        }
        
        $clusters[] = $nearestCluster;
    }
    
    return $clusters;
}

/**
 * Calculate new centroids based on assigned clusters
 */
function calculateCentroids($features, $clusters, $numClusters) {
    $centroids = [];
    $counts = array_fill(0, $numClusters, 0);
    $sums = [];
    
    // Initialize sums
    if (!empty($features)) {
        $numFeatures = count($features[0]);
        for ($i = 0; $i < $numClusters; $i++) {
            $sums[$i] = array_fill(0, $numFeatures, 0);
        }
    }
    
    // Sum up points in each cluster
    foreach ($features as $i => $point) {
        $cluster = $clusters[$i];
        $counts[$cluster]++;
        for ($j = 0; $j < count($point); $j++) {
            $sums[$cluster][$j] += $point[$j];
        }
    }
    
    // Calculate averages
    for ($i = 0; $i < $numClusters; $i++) {
        if ($counts[$i] > 0) {
            $centroids[$i] = [];
            for ($j = 0; $j < count($sums[$i]); $j++) {
                $centroids[$i][$j] = $sums[$i][$j] / $counts[$i];
            }
        } else {
            // If cluster is empty, keep previous centroid or use random point
            $centroids[$i] = $features[rand(0, count($features) - 1)];
        }
    }
    
    return $centroids;
}

/**
 * Map cluster assignments back to students with labels
 */
function mapClustersToStudents($students, $clusters, $centroids, $category) {
    $results = [];
    
    // Calculate average scores per cluster for labeling
    $clusterScores = [];
    foreach ($centroids as $i => $centroid) {
        // Use first feature (score) for labeling
        $clusterScores[$i] = $centroid[0] * 100; // Denormalize
    }
    
    // Sort clusters by score to assign labels
    arsort($clusterScores);
    $labelMap = [];
    $labels = ['High Achievers', 'Average Performers', 'Needs Support'];
    $labelIndex = 0;
    foreach ($clusterScores as $clusterNum => $score) {
        $labelMap[$clusterNum] = $labels[$labelIndex] ?? 'Cluster ' . $clusterNum;
        $labelIndex++;
    }
    
    // Map students to clusters
    foreach ($students as $i => $student) {
        $clusterNum = $clusters[$i];
        
        // Determine score based on category
        if ($category === 'literacy') {
            $score = (float)$student['literacy_score'];
        } elseif ($category === 'math') {
            $score = (float)$student['math_score'];
        } else {
            $score = ((float)$student['literacy_score'] + (float)$student['math_score']) / 2;
        }
        
        $results[] = [
            'user_id' => $student['user_id'],
            'cluster' => $clusterNum,
            'label' => $labelMap[$clusterNum],
            'score' => $score,
            'literacy_score' => (float)$student['literacy_score'],
            'math_score' => (float)$student['math_score']
        ];
    }
    
    return $results;
}

/**
 * Run enhanced clustering (main function)
 */
function runEnhancedClustering($category = 'all', $numClusters = 3) {
    try {
        $db = getDBConnection();
        
        // Get student data (reuse existing function)
        require_once __DIR__ . '/clustering-local.php';
        $students = getStudentData($db, $category);
        
        if (count($students) < $numClusters) {
            return [
                'success' => false,
                'message' => "Need at least {$numClusters} students for clustering"
            ];
        }
        
        // Perform enhanced K-Means clustering
        $clusters = performEnhancedKMeans($students, $category, $numClusters);
        
        if ($clusters === null) {
            return [
                'success' => false,
                'message' => 'Clustering failed'
            ];
        }
        
        // Save results (reuse existing function)
        saveClusteringResults($db, $students, $clusters, $category);
        
        // Generate report (reuse existing function)
        $report = generateClusteringReport($students, $clusters);
        
        $categoryLabel = $category === 'literacy' ? 'Literacy' : ($category === 'math' ? 'Math' : 'Overall');
        
        return [
            'success' => true,
            'message' => $categoryLabel . ' enhanced clustering completed successfully',
            'report' => $report,
            'category' => $category,
            'algorithm' => 'Enhanced K-Means (PHP)'
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Enhanced clustering failed: ' . $e->getMessage()
        ];
    }
}

?>



