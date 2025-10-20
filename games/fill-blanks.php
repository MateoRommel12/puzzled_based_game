<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fill in the Blanks - Learning Game</title>
    <link rel="stylesheet" href="../styles/main.css?v=3.0">
    <link rel="stylesheet" href="../styles/fill-blanks.css?v=3.0">
</head>
<body>
    <script src="../scripts/auth.js"></script>
    <script src="../scripts/auth-check.js"></script>

    <div class="container">
        <!-- Game Header -->
        <header class="game-header">
            <button class="back-button" onclick="goBackToDashboard()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Back to Dashboard</span>
            </button>
            <h1 class="game-title">📝 Fill in the Blanks</h1>
            <div class="game-stats-header">
                <div class="stat-box">
                    <span class="stat-label">Score</span>
                    <span class="stat-value" id="score">0</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">Time</span>
                    <span class="stat-value" id="timer">60</span>
                </div>
            </div>
        </header>

        <!-- Game Instructions -->
        <div class="instructions-card" id="instructionsCard">
            <div class="instructions-content">
                <h2>🎯 How to Play</h2>
                <p>Read the passage below and drag the correct words from the word bank to fill in the blanks.</p>
                <ul>
                    <li>📖 Read the passage carefully</li>
                    <li>🎯 Drag words from the word bank to the blank spaces</li>
                    <li>✅ Click "Check Answers" when you're done</li>
                    <li>⏰ You have <span id="timeLimit">60</span> seconds</li>
                </ul>
                <button class="start-game-btn" onclick="startGame()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5,3 19,12 5,21"/>
                    </svg>
                    Start Game
                </button>
            </div>
        </div>

        <!-- Game Play Area -->
        <div class="game-play-area" id="gamePlayArea" style="display: none;">
            <!-- Passage Display -->
            <div class="passage-container">
                <h3>📖 Read and Complete</h3>
                <div class="passage-text" id="passageText">
                    <!-- Passage will be loaded here -->
                </div>
                <div class="hint-container" id="hintContainer" style="display: none;">
                    <div class="hint-box">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                            <path d="M12 17h.01"/>
                        </svg>
                        <span id="hintText">Hint text will appear here</span>
                    </div>
                </div>
            </div>

            <!-- Word Bank -->
            <div class="word-bank-container">
                <h3>🎯 Word Bank</h3>
                <div class="word-bank" id="wordBank">
                    <!-- Word choices will be loaded here -->
                </div>
                <button class="hint-btn" onclick="showHint()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <path d="M12 17h.01"/>
                    </svg>
                    Show Hint
                </button>
            </div>

            <!-- Game Controls -->
            <div class="game-controls">
                <button class="control-btn secondary" onclick="resetGame()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23 4 23 10 17 10"/>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                    </svg>
                    Reset
                </button>
                <button class="control-btn primary" onclick="checkAnswers()" id="checkBtn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Check Answers
                </button>
            </div>
        </div>

        <!-- Game Over Screen -->
        <div class="game-over-screen" id="gameOverScreen" style="display: none;">
            <!-- Confetti Decoration -->
            <div class="confetti-emoji">🎊</div>
            
            <!-- Success Icon with Animation -->
            <div class="game-over-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9 12l2 2 4-4"/>
                </svg>
            </div>
            
            <!-- Title with Gradient -->
            <h2 class="game-over-title">Game Complete!</h2>
            <p class="game-over-message">Great job completing the fill-in-the-blanks exercise!</p>
            
            <!-- Final Score Display -->
            <div class="final-score-container">
                <div class="final-score-number" id="finalScore">0</div>
                <div class="final-score-label">FINAL SCORE</div>
            </div>
            
            <!-- Stats Grid -->
            <div class="final-stats">
                <div class="final-stat">
                    <span class="final-stat-label">Correct Answers</span>
                    <span class="final-stat-value"><span id="correctAnswers">0</span>/<span id="totalBlanks">0</span></span>
                </div>
                <div class="final-stat">
                    <span class="final-stat-label">Accuracy</span>
                    <span class="final-stat-value" id="accuracy">0%</span>
                </div>
                <div class="final-stat">
                    <span class="final-stat-label">Time Taken</span>
                    <span class="final-stat-value" id="timeTaken">0s</span>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="game-over-actions">
                <button class="action-button secondary" onclick="goBackToDashboard()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back to Dashboard
                </button>
                <button class="action-button primary" onclick="restartGame()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5,3 19,12 5,21"/>
                    </svg>
                    Play Again
                </button>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="../scripts/main.js?v=3.0"></script>
    <script src="../scripts/modal.js?v=3.0"></script>
    <script src="../scripts/fill-blanks.js?v=3.0"></script>
</body>
</html>
