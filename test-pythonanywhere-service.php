<?php
/**
 * Simple PythonAnywhere Service Test
 * Test the PythonAnywhere clustering service directly
 */

echo "<h1>PythonAnywhere Service Test</h1>";

// Test 1: Health Check
echo "<h2>1. Health Check</h2>";
$healthUrl = 'https://matts.pythonanywhere.com/health';
$healthResponse = file_get_contents($healthUrl);
echo "<p><strong>Health Response:</strong></p>";
echo "<pre style='background: #f5f5f5; padding: 10px; border-radius: 5px;'>";
echo htmlspecialchars($healthResponse);
echo "</pre>";

// Test 2: Clustering Endpoint
echo "<h2>2. Clustering Endpoint Test</h2>";
$clusterUrl = 'https://matts.pythonanywhere.com/cluster';
$data = json_encode(['trigger' => 'test']);

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => $data,
        'timeout' => 30
    ]
]);

$clusterResponse = file_get_contents($clusterUrl, false, $context);
echo "<p><strong>Clustering Response:</strong></p>";
echo "<pre style='background: #f5f5f5; padding: 10px; border-radius: 5px;'>";
echo htmlspecialchars($clusterResponse);
echo "</pre>";

// Test 3: Parse Response
echo "<h2>3. Response Analysis</h2>";
$parsedResponse = json_decode($clusterResponse, true);
if ($parsedResponse) {
    echo "<p style='color: green;'>✅ Response is valid JSON</p>";
    echo "<p><strong>Success:</strong> " . ($parsedResponse['success'] ? 'true' : 'false') . "</p>";
    if (isset($parsedResponse['message'])) {
        echo "<p><strong>Message:</strong> " . $parsedResponse['message'] . "</p>";
    }
    if (isset($parsedResponse['error'])) {
        echo "<p style='color: red;'><strong>Error:</strong> " . $parsedResponse['error'] . "</p>";
    }
} else {
    echo "<p style='color: red;'>❌ Response is not valid JSON</p>";
}

echo "<h2>Test Complete!</h2>";
echo "<p><a href='test-clustering-integration.php'>Back to Full Integration Test</a></p>";
?>
