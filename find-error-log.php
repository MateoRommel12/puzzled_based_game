<?php
// Check multiple locations for error log
$possible_locations = [
    'error_log',
    '/home/u12345678/error_log', // Replace with your actual username
    '../error_log',
    '../../error_log',
    './logs/error_log'
];

foreach ($possible_locations as $location) {
    if (file_exists($location)) {
        echo "Found error log at: " . $location . "<br>";
        echo "Last 20 lines:<br><pre>";
        $lines = file($location);
        echo implode('', array_slice($lines, -20));
        echo "</pre>";
    }
}

// Also show where PHP thinks it's logging
echo "<br><br>PHP reports error log at: " . ini_get('error_log');
?>
