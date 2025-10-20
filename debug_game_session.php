<?php
/**
 * Debug script to see what data is being sent when saving game sessions
 * This will help us understand why fill-in-the-blanks math games are not being categorized correctly
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Game Session Data Debug</h2>\n";

// Simulate the data that would be sent from a fill-in-the-blanks math game
$sampleData = [
    'gameType' => 'fill_blanks',
    'score' => 100,
    'difficulty' => 'medium',
    'timeTaken' => 120,
    'questionsAnswered' => 10,
    'correctAnswers' => 8,
    'streakCount' => 3,
    'hintsUsed' => 1,
    'gameCategory' => 'math',  // This should be sent from the frontend
    'subject' => 'mathematics', // Alternative field name
    'sessionData' => [
        'gameName' => 'Fill in the Blanks - Math',
        'category' => 'math'
    ]
];

echo "<h3>Sample Data Being Sent:</h3>\n";
echo "<pre>" . htmlspecialchars(json_encode($sampleData, JSON_PRETTY_PRINT)) . "</pre>\n";

// Test the categorization logic
echo "<h3>Testing Categorization Logic:</h3>\n";

$gameType = $sampleData['gameType'];
echo "<p>Original gameType: " . htmlspecialchars($gameType) . "</p>\n";

// Apply the same logic as in the API
if ($gameType === 'fill_blanks' || preg_match('/^custom_\d+$/', $gameType)) {
    $gameCategory = $sampleData['gameCategory'] ?? $sampleData['subject'] ?? '';
    echo "<p>Game category found: " . htmlspecialchars($gameCategory) . "</p>\n";
    
    if ($gameCategory === 'math' || $gameCategory === 'mathematics') {
        $gameType = 'fill_blanks_math';
        echo "<p>✅ Categorized as: " . htmlspecialchars($gameType) . " (MATH)</p>\n";
    } elseif ($gameCategory === 'literacy' || $gameCategory === 'reading' || $gameCategory === 'english') {
        $gameType = 'fill_blanks_literacy';
        echo "<p>✅ Categorized as: " . htmlspecialchars($gameType) . " (LITERACY)</p>\n";
    } else {
        $gameType = 'custom_game';
        echo "<p>❌ Categorized as: " . htmlspecialchars($gameType) . " (GENERIC)</p>\n";
    }
} else {
    echo "<p>Game type unchanged: " . htmlspecialchars($gameType) . "</p>\n";
}

echo "<h3>Questions to Check:</h3>\n";
echo "<ol>\n";
echo "<li>Is your fill-in-the-blanks game sending 'gameCategory': 'math' in the data?</li>\n";
echo "<li>Is your fill-in-the-blanks game sending 'subject': 'mathematics' in the data?</li>\n";
echo "<li>Are you using the correct gameType ('fill_blanks') when saving the session?</li>\n";
echo "</ol>\n";

echo "<h3>To Fix This Issue:</h3>\n";
echo "<ol>\n";
echo "<li>Check your fill-in-the-blanks game JavaScript code</li>\n";
echo "<li>Make sure it's sending gameCategory: 'math' or subject: 'mathematics'</li>\n";
echo "<li>Make sure it's using gameType: 'fill_blanks' when calling the API</li>\n";
echo "</ol>\n";
?>
