<?php
/**
 * WEKA Setup Script
 * This script helps verify and set up WEKA integration
 */

require_once __DIR__ . '/../config/database.php';

// Configuration
$wekaDir = __DIR__;
$wekaJar = $wekaDir . '/weka.jar';
$javaClass = $wekaDir . '/StudentClustering.java';
$compiledClass = $wekaDir . '/StudentClustering.class';

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WEKA Setup - Clustering Game</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 10px;
        }
        .check-item {
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .check-item.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .check-item.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .check-item.warning {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }
        .status-icon {
            font-size: 24px;
            margin-right: 10px;
        }
        .instructions {
            background: #e7f3ff;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #2196F3;
        }
        .instructions h3 {
            margin-top: 0;
            color: #1976D2;
        }
        .instructions code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 5px;
        }
        .button:hover {
            background: #45a049;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 WEKA Integration Setup</h1>
        
        <?php
        $allOk = true;
        $checks = [];
        
        // Check 1: Java Installation
        $output = [];
        $returnVar = 0;
        exec('java -version 2>&1', $output, $returnVar);
        $javaInstalled = ($returnVar === 0);
        $checks['java'] = $javaInstalled;
        if (!$javaInstalled) $allOk = false;
        
        // Check 2: WEKA JAR File
        $wekaJarExists = file_exists($wekaJar);
        $checks['weka_jar'] = $wekaJarExists;
        if (!$wekaJarExists) $allOk = false;
        
        // Check 3: Java Source File
        $javaSourceExists = file_exists($javaClass);
        $checks['java_source'] = $javaSourceExists;
        if (!$javaSourceExists) $allOk = false;
        
        // Check 4: Compiled Class
        $compiledExists = file_exists($compiledClass);
        $checks['compiled'] = $compiledExists;
        
        // Check 5: ARFF Directory
        $arffDir = $wekaDir . '/arff';
        if (!file_exists($arffDir)) {
            @mkdir($arffDir, 0777, true);
        }
        $arffWritable = is_writable($arffDir);
        $checks['arff_dir'] = $arffWritable;
        if (!$arffWritable) $allOk = false;
        
        // Display checks
        foreach ($checks as $check => $status) {
            $label = [
                'java' => 'Java JDK Installed',
                'weka_jar' => 'WEKA JAR File',
                'java_source' => 'Java Source File',
                'compiled' => 'Compiled Java Class',
                'arff_dir' => 'ARFF Directory Writable'
            ][$check];
            
            $class = $status ? 'success' : ($check === 'compiled' ? 'warning' : 'error');
            $icon = $status ? '✅' : ($check === 'compiled' ? '⚠️' : '❌');
            
            echo "<div class='check-item $class'>";
            echo "<div><span class='status-icon'>$icon</span><strong>$label</strong></div>";
            echo "<div>" . ($status ? 'OK' : 'NOT FOUND') . "</div>";
            echo "</div>";
        }
        
        // Show Java version if installed
        if ($javaInstalled && !empty($output)) {
            echo "<div class='check-item success'>";
            echo "<div><strong>Java Version:</strong></div>";
            echo "<div>" . htmlspecialchars($output[0]) . "</div>";
            echo "</div>";
        }
        ?>
        
        <?php if (!$allOk): ?>
        <div class="instructions">
            <h3>📋 Setup Instructions</h3>
            
            <?php if (!$checks['java']): ?>
            <p><strong>1. Install Java JDK:</strong></p>
            <ul>
                <li>Download from: <a href="https://www.oracle.com/java/technologies/downloads/" target="_blank">Oracle Java Downloads</a></li>
                <li>Install and verify: <code>java -version</code></li>
            </ul>
            <?php endif; ?>
            
            <?php if (!$checks['weka_jar']): ?>
            <p><strong>2. Download WEKA:</strong></p>
            <ul>
                <li>Download from: <a href="https://www.cs.waikato.ac.nz/ml/weka/downloading.html" target="_blank">WEKA Downloads</a></li>
                <li>Extract <code>weka.jar</code> and place it in: <code><?php echo htmlspecialchars($wekaDir); ?></code></li>
            </ul>
            <?php endif; ?>
            
            <?php if (!$checks['compiled'] && $checks['java'] && $checks['weka_jar'] && $checks['java_source']): ?>
            <p><strong>3. Compile Java Class:</strong></p>
            <p>Open terminal/command prompt and run:</p>
            <p><strong>Windows:</strong></p>
            <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto;">cd <?php echo htmlspecialchars($wekaDir); ?>
javac -cp "weka.jar;." StudentClustering.java</pre>
            <p><strong>Linux/Mac:</strong></p>
            <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto;">cd <?php echo htmlspecialchars($wekaDir); ?>
javac -cp "weka.jar:." StudentClustering.java</pre>
            <?php endif; ?>
        </div>
        <?php else: ?>
        <div class="check-item success">
            <div><span class="status-icon">🎉</span><strong>All checks passed!</strong></div>
            <div>WEKA is ready to use</div>
        </div>
        <?php endif; ?>
        
        <div style="margin-top: 30px; text-align: center;">
            <a href="../admin/admin-dashboard.php" class="button">Go to Admin Dashboard</a>
            <a href="?refresh=1" class="button">Refresh Checks</a>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px;">
            <h3>Usage:</h3>
            <p>To use WEKA clustering, add <code>?use_weka=true</code> to the clustering API call:</p>
            <code>/api/clustering.php?action=run&category=all&use_weka=true</code>
        </div>
    </div>
</body>
</html>

