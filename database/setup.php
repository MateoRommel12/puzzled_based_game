<?php
/**
 * Database Setup Script
 * Run this file once to create the database and tables
 */

// Database connection parameters
$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'clustering_game_db';

echo "<!DOCTYPE html>
<html>
<head>
    <title>Database Setup</title>
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
            color: #3B82F6;
            border-bottom: 3px solid #3B82F6;
            padding-bottom: 10px;
        }
        .success {
            color: #10B981;
            background: #D1FAE5;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        .error {
            color: #EF4444;
            background: #FEE2E2;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        .info {
            color: #3B82F6;
            background: #DBEAFE;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        .step {
            margin: 15px 0;
            padding: 10px;
            border-left: 4px solid #3B82F6;
            background: #F3F4F6;
        }
        code {
            background: #1F2937;
            color: #10B981;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class='container'>
        <h1>🚀 Clustering Game Database Setup</h1>";

try {
    // Step 1: Connect to MySQL server (without database)
    echo "<div class='step'><strong>Step 1:</strong> Connecting to MySQL server...</div>";
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "<div class='success'>✓ Connected to MySQL server successfully!</div>";
    
    // Step 2: Create database if it doesn't exist
    echo "<div class='step'><strong>Step 2:</strong> Creating database <code>$dbname</code>...</div>";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci");
    echo "<div class='success'>✓ Database created or already exists!</div>";
    
    // Step 3: Select the database
    echo "<div class='step'><strong>Step 3:</strong> Selecting database...</div>";
    $pdo->exec("USE `$dbname`");
    echo "<div class='success'>✓ Database selected!</div>";
    
    // Step 4: Read and execute schema file
    echo "<div class='step'><strong>Step 4:</strong> Executing schema file...</div>";
    $schemaFile = __DIR__ . '/schema.sql';
    
    if (!file_exists($schemaFile)) {
        throw new Exception("Schema file not found: $schemaFile");
    }
    
    $sql = file_get_contents($schemaFile);
    
    // Split SQL into individual statements
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            return !empty($stmt) && 
                   !preg_match('/^\s*--/', $stmt) && 
                   !preg_match('/^DELIMITER/', $stmt);
        }
    );
    
    $successCount = 0;
    $errorCount = 0;
    
    foreach ($statements as $statement) {
        try {
            $pdo->exec($statement);
            $successCount++;
        } catch (PDOException $e) {
            // Some statements may fail if objects already exist - that's okay
            if (strpos($e->getMessage(), 'already exists') === false) {
                $errorCount++;
                echo "<div class='info'>⚠ Skipped: " . substr($statement, 0, 50) . "...</div>";
            }
        }
    }
    
    echo "<div class='success'>✓ Schema executed successfully! ($successCount statements processed)</div>";
    
    // Step 4.5: Run migration for new game types if needed
    echo "<div class='step'><strong>Step 4.5:</strong> Applying game types migration...</div>";
    $migrationFile = __DIR__ . '/add-new-game-types.sql';
    
    if (file_exists($migrationFile)) {
        try {
            $migrationSql = file_get_contents($migrationFile);
            
            // Split SQL into individual statements
            $migrationStatements = array_filter(
                array_map('trim', explode(';', $migrationSql)),
                function($stmt) {
                    return !empty($stmt) && 
                           !preg_match('/^\s*--/', $stmt) && 
                           !preg_match('/^DELIMITER/', $stmt);
                }
            );
            
            $migrationSuccess = 0;
            foreach ($migrationStatements as $statement) {
                try {
                    $pdo->exec($statement);
                    $migrationSuccess++;
                } catch (PDOException $e) {
                    // Migration may fail if already applied - that's okay
                    if (strpos($e->getMessage(), 'already exists') === false) {
                        echo "<div class='info'>⚠ Migration note: " . substr($e->getMessage(), 0, 100) . "...</div>";
                    }
                }
            }
            
            echo "<div class='success'>✓ Migration applied successfully! ($migrationSuccess statements processed)</div>";
        } catch (Exception $e) {
            echo "<div class='info'>⚠ Migration skipped or already applied</div>";
        }
    } else {
        echo "<div class='info'>⚠ No migration file found - schema is up to date</div>";
    }
    
    // Step 4.6: Fix collation issues
    echo "<div class='step'><strong>Step 4.6:</strong> Fixing database collation...</div>";
    $collationFile = __DIR__ . '/fix-collation.sql';
    
    if (file_exists($collationFile)) {
        try {
            $collationSql = file_get_contents($collationFile);
            
            // Split SQL into individual statements
            $collationStatements = array_filter(
                array_map('trim', explode(';', $collationSql)),
                function($stmt) {
                    return !empty($stmt) && 
                           !preg_match('/^\s*--/', $stmt) &&
                           !preg_match('/^SELECT/', $stmt); // Skip SELECT verification query
                }
            );
            
            $collationSuccess = 0;
            foreach ($collationStatements as $statement) {
                try {
                    $pdo->exec($statement);
                    $collationSuccess++;
                } catch (PDOException $e) {
                    // Some collation fixes may already be applied - that's okay
                    echo "<div class='info'>⚠ Collation note: " . substr($e->getMessage(), 0, 100) . "...</div>";
                }
            }
            
            echo "<div class='success'>✓ Collation fixed successfully! ($collationSuccess statements processed)</div>";
        } catch (Exception $e) {
            echo "<div class='info'>⚠ Collation fix skipped or already applied</div>";
        }
    } else {
        echo "<div class='info'>⚠ No collation fix file found</div>";
    }
    
    // Step 5: Verify tables
    echo "<div class='step'><strong>Step 5:</strong> Verifying database structure...</div>";
    $result = $pdo->query("SHOW TABLES");
    $tables = $result->fetchAll(PDO::FETCH_COLUMN);
    
    echo "<div class='success'>✓ Found " . count($tables) . " tables:</div>";
    echo "<ul>";
    foreach ($tables as $table) {
        echo "<li>$table</li>";
    }
    echo "</ul>";
    
    // Step 6: Display summary
    echo "<div class='step'><strong>Step 6:</strong> Setup Summary</div>";
    echo "<div class='success'>";
    echo "<h3>🎉 Database Setup Complete!</h3>";
    echo "<p><strong>Database Name:</strong> <code>$dbname</code></p>";
    echo "<p><strong>Host:</strong> <code>$host</code></p>";
    echo "<p><strong>Tables Created:</strong> " . count($tables) . "</p>";
    echo "<h4>Default Admin Credentials:</h4>";
    echo "<p><strong>Username:</strong> <code>admin</code></p>";
    echo "<p><strong>Password:</strong> <code>admin123</code></p>";
    echo "<h4>Sample User Credentials:</h4>";
    echo "<p><strong>Email:</strong> <code>john.doe@example.com</code></p>";
    echo "<p><strong>Password:</strong> <code>password</code></p>";
    echo "</div>";
    
    echo "<div class='info'>";
    echo "<h4>📝 Next Steps:</h4>";
    echo "<ol>";
    echo "<li>Update <code>config/database.php</code> with your database credentials if needed</li>";
    echo "<li>Delete or secure this <code>setup.php</code> file after setup</li>";
    echo "<li>Test the application by logging in</li>";
    echo "<li>Change default passwords in production</li>";
    echo "</ol>";
    echo "</div>";
    
} catch (PDOException $e) {
    echo "<div class='error'>";
    echo "<h3>❌ Database Error</h3>";
    echo "<p><strong>Error:</strong> " . $e->getMessage() . "</p>";
    echo "<p><strong>Code:</strong> " . $e->getCode() . "</p>";
    echo "</div>";
} catch (Exception $e) {
    echo "<div class='error'>";
    echo "<h3>❌ Setup Error</h3>";
    echo "<p><strong>Error:</strong> " . $e->getMessage() . "</p>";
    echo "</div>";
}

echo "</div></body></html>";
?>

