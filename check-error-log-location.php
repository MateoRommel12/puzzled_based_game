<?php
// Find PHP error log location
echo "PHP Error Log Location: " . ini_get('error_log') . "<br>";
echo "Current Script Location: " . __FILE__ . "<br>";
echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "<br>";
echo "Script Name: " . $_SERVER['SCRIPT_NAME'] . "<br>";

// Try to create a test log entry
error_log("This is a test error log entry from ClusteringGame");

echo "<br>Test error logged! Check the above path for 'error_log' file.";
?>
