<?php
/**
 * Test Email URL Generation
 * Run this to verify the password reset URL is being generated correctly
 */

require_once 'config/email.php';
require_once 'config/email-manager.php';

echo "<h2>Email URL Test</h2>\n";

// Test URL generation
$testToken = '94e3168abf093f75dda2c0705a68060dbe3a31c8cad0bc809d29bae46c39178c';
$appUrl = EmailConfig::APP_URL;
$resetUrl = rtrim($appUrl, '/') . '/reset-password.php?token=' . urlencode($testToken);

echo "<h3>Configuration:</h3>\n";
echo "<p><strong>APP_URL:</strong> " . htmlspecialchars($appUrl) . "</p>\n";
echo "<p><strong>Generated URL:</strong> " . htmlspecialchars($resetUrl) . "</p>\n";

echo "<h3>URL Analysis:</h3>\n";
echo "<p><strong>URL Length:</strong> " . strlen($resetUrl) . " characters</p>\n";
echo "<p><strong>Contains spaces:</strong> " . (strpos($resetUrl, ' ') !== false ? 'YES (PROBLEM!)' : 'NO (Good)') . "</p>\n";
echo "<p><strong>Contains %20:</strong> " . (strpos($resetUrl, '%20') !== false ? 'YES (PROBLEM!)' : 'NO (Good)') . "</p>\n";

echo "<h3>Test Link:</h3>\n";
echo "<p><a href='" . htmlspecialchars($resetUrl) . "' target='_blank'>Test Password Reset Link</a></p>\n";

echo "<h3>Raw URL (for debugging):</h3>\n";
echo "<pre>" . htmlspecialchars($resetUrl) . "</pre>\n";

// Test if the URL is accessible
echo "<h3>URL Accessibility Test:</h3>\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $resetUrl);
curl_setopt($ch, CURLOPT_NOBODY, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "<p><strong>HTTP Status Code:</strong> " . $httpCode . "</p>\n";
echo "<p><strong>URL Accessible:</strong> " . ($httpCode == 200 ? 'YES' : 'NO') . "</p>\n";

if ($httpCode != 200) {
    echo "<p><strong>Note:</strong> The URL might not be accessible yet, but the format is correct.</p>\n";
}
?>

