<?php
/**
 * WEKA Clustering Integration
 * This file integrates WEKA clustering algorithms with the PHP application
 * 
 * Requirements:
 * 1. Java JDK 8+ installed
 * 2. WEKA JAR file in weka/weka.jar
 * 3. Compiled StudentClustering.class in weka/
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/clustering-local.php';

// Configuration
define('WEKA_JAR_PATH', __DIR__ . '/../weka/weka.jar');
define('WEKA_CLASS_PATH', __DIR__ . '/../weka');
define('WEKA_CLASS_NAME', 'StudentClustering');
define('ARFF_DIR', __DIR__ . '/../weka/arff');
define('JAVA_BIN', 'java'); // Change to full path if needed: 'C:\\Program Files\\Java\\jdk-17\\bin\\java.exe'

/**
 * Generate ARFF file from student data
 * ARFF (Attribute-Relation File Format) is WEKA's native format
 */
function generateARFF($students, $category = 'all', $filename = null) {
    if (!file_exists(ARFF_DIR)) {
        mkdir(ARFF_DIR, 0777, true);
    }
    
    if ($filename === null) {
        $filename = ARFF_DIR . '/students_' . $category . '_' . time() . '.arff';
    }
    
    $fp = fopen($filename, 'w');
    
    // Write ARFF header
    fwrite($fp, "@relation student_performance\n\n");
    
    // Define attributes based on category
    if ($category === 'literacy') {
        fwrite($fp, "@attribute literacy_score numeric\n");
        fwrite($fp, "@attribute games_played numeric\n");
        fwrite($fp, "@attribute total_score numeric\n");
    } elseif ($category === 'math') {
        fwrite($fp, "@attribute math_score numeric\n");
        fwrite($fp, "@attribute games_played numeric\n");
        fwrite($fp, "@attribute total_score numeric\n");
    } else {
        fwrite($fp, "@attribute literacy_score numeric\n");
        fwrite($fp, "@attribute math_score numeric\n");
        fwrite($fp, "@attribute games_played numeric\n");
        fwrite($fp, "@attribute total_score numeric\n");
    }
    
    fwrite($fp, "\n@data\n");
    
    // Write data
    foreach ($students as $student) {
        $values = [];
        
        if ($category === 'literacy') {
            $values[] = round($student['literacy_score'], 2);
            $values[] = $student['games_played'];
            $values[] = $student['total_score'];
        } elseif ($category === 'math') {
            $values[] = round($student['math_score'], 2);
            $values[] = $student['games_played'];
            $values[] = $student['total_score'];
        } else {
            $values[] = round($student['literacy_score'], 2);
            $values[] = round($student['math_score'], 2);
            $values[] = $student['games_played'];
            $values[] = $student['total_score'];
        }
        
        fwrite($fp, implode(',', $values) . "\n");
    }
    
    fclose($fp);
    return $filename;
}

/**
 * Run WEKA clustering using command-line execution
 */
function runWekaClustering($category = 'all', $numClusters = 3) {
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
        
        // Generate ARFF file
        $arffFile = generateARFF($students, $category);
        
        // Generate output file
        $outputFile = ARFF_DIR . '/clusters_' . $category . '_' . time() . '.csv';
        
        // Build Java command
        $classpath = WEKA_CLASS_PATH . ';' . WEKA_JAR_PATH; // Use ; for Windows, : for Linux/Mac
        if (strtoupper(substr(PHP_OS, 0, 3)) !== 'WIN') {
            $classpath = WEKA_CLASS_PATH . ':' . WEKA_JAR_PATH;
        }
        
        $command = sprintf(
            '%s -cp "%s" %s "%s" %d "%s"',
            escapeshellarg(JAVA_BIN),
            $classpath,
            WEKA_CLASS_NAME,
            escapeshellarg($arffFile),
            $numClusters,
            escapeshellarg($outputFile)
        );
        
        // Execute command
        $output = [];
        $returnVar = 0;
        exec($command . ' 2>&1', $output, $returnVar);
        
        if ($returnVar !== 0) {
            throw new Exception("WEKA execution failed: " . implode("\n", $output));
        }
        
        // Check if output file was created
        if (!file_exists($outputFile)) {
            throw new Exception("WEKA output file not created");
        }
        
        // Parse results
        $clusterResults = parseClusterResults($outputFile, $students);
        
        // Save to database
        saveClusteringResults($db, $students, $clusterResults, $category);
        
        // Cleanup temporary files
        @unlink($arffFile);
        @unlink($outputFile);
        
        // Generate report
        $report = generateClusteringReport($students, $clusterResults);
        
        $categoryLabel = $category === 'literacy' ? 'Literacy' : ($category === 'math' ? 'Math' : 'Overall');
        
        return [
            'success' => true,
            'message' => $categoryLabel . ' WEKA clustering completed successfully',
            'report' => $report,
            'category' => $category,
            'algorithm' => 'WEKA K-Means'
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'WEKA clustering failed: ' . $e->getMessage()
        ];
    }
}

/**
 * Parse cluster results from CSV file
 */
function parseClusterResults($csvFile, $students) {
    $results = [];
    $fp = fopen($csvFile, 'r');
    
    // Skip header
    fgetcsv($fp);
    
    $index = 0;
    while (($row = fgetcsv($fp)) !== false) {
        if (count($row) < 3) continue;
        
        $userId = isset($students[$index]) ? $students[$index]['user_id'] : null;
        $clusterNumber = (int)$row[1];
        $clusterLabel = $row[2];
        
        if ($userId) {
            $results[] = [
                'user_id' => $userId,
                'cluster' => $clusterNumber,
                'label' => $clusterLabel,
                'score' => 0, // Will be calculated
                'literacy_score' => isset($students[$index]) ? (float)$students[$index]['literacy_score'] : 0,
                'math_score' => isset($students[$index]) ? (float)$students[$index]['math_score'] : 0
            ];
        }
        
        $index++;
    }
    
    fclose($fp);
    return $results;
}

/**
 * Check if WEKA is available
 */
function checkWekaAvailability() {
    $checks = [
        'java_installed' => false,
        'weka_jar_exists' => false,
        'weka_class_exists' => false,
        'arff_dir_writable' => false
    ];
    
    // Check Java
    $output = [];
    exec(JAVA_BIN . ' -version 2>&1', $output, $returnVar);
    $checks['java_installed'] = ($returnVar === 0);
    
    // Check WEKA JAR
    $checks['weka_jar_exists'] = file_exists(WEKA_JAR_PATH);
    
    // Check compiled class
    $classFile = WEKA_CLASS_PATH . '/' . WEKA_CLASS_NAME . '.class';
    $checks['weka_class_exists'] = file_exists($classFile);
    
    // Check ARFF directory
    if (!file_exists(ARFF_DIR)) {
        @mkdir(ARFF_DIR, 0777, true);
    }
    $checks['arff_dir_writable'] = is_writable(ARFF_DIR);
    
    return $checks;
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
            // Check WEKA availability
            $checks = checkWekaAvailability();
            echo json_encode([
                'success' => true,
                'checks' => $checks,
                'all_ok' => array_reduce($checks, function($carry, $item) {
                    return $carry && $item;
                }, true)
            ]);
            break;
            
        case 'run':
            $category = $_GET['category'] ?? 'all';
            $numClusters = isset($_GET['clusters']) ? (int)$_GET['clusters'] : 3;
            
            $result = runWekaClustering($category, $numClusters);
            echo json_encode($result);
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}

?>

