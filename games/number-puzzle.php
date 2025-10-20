<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Number Puzzle - Learning Games</title>
    <link rel="stylesheet" href="../styles/main.css">
    <link rel="stylesheet" href="../styles/number-puzzle.css?v=1.0">
</head>
<body>
    <div class="container">
        <header class="game-header">
            <button class="back-button" onclick="window.location.href='../index.php'">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Back to Dashboard</span>
            </button>
            <h1 class="game-title">🔢 Number Puzzle</h1>
            <div class="game-stats-header">
                <div class="stat-box">
                    <span class="stat-label">Score</span>
                    <span class="stat-value" id="score">0</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">Level</span>
                    <span class="stat-value" id="level">1</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">Time</span>
                    <span class="stat-value" id="gameTimer">0:00</span>
                </div>
            </div>
        </header>

        <main class="game-container">
            <!-- Instructions Card -->
            <div class="instructions-card" id="instructionsCard">
                <div class="instructions-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6l4 2"></path>
                    </svg>
                </div>
                <h2>How to Play</h2>
                <ul class="instructions-list">
                    <li>Solve mathematical puzzles and number sequences</li>
                    <li>Find patterns in numbers and complete sequences</li>
                    <li>Solve arithmetic puzzles with missing numbers</li>
                    <li>Use logic and math skills to find answers</li>
                    <li>Earn points for correct solutions!</li>
                </ul>
                <button class="start-button" onclick="startGame()">Start Solving</button>
            </div>

            <!-- Game Play Area -->
            <div class="game-play-area" id="gamePlayArea" style="display: none;">
                <div class="task-card" id="taskCard">
                    <div class="task-header">
                        <span class="task-type" id="taskType">Number Puzzle</span>
                        <span class="task-number">Puzzle <span id="taskNumber">1</span>/15</span>
                    </div>
                    <div class="task-content" id="taskContent">
                        <!-- Task content will be loaded here -->
                    </div>
                </div>

                <div class="feedback-message" id="feedbackMessage" style="display: none;"></div>

                <div class="progress-section">
                    <div class="progress-label">
                        <span>Progress</span>
                        <span id="progressText">0/15</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill" style="width: 0%"></div>
                    </div>
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
                <p class="game-over-message">Congratulations! You've solved all the number puzzles!</p>
                
                <!-- Final Score Display -->
                <div class="final-score-container">
                    <div class="final-score-number" id="finalScore">0</div>
                    <div class="final-score-label">FINAL SCORE</div>
                </div>
                
                <!-- Stats Grid -->
                <div class="final-stats">
                    <div class="final-stat">
                        <span class="final-stat-label">Puzzles Solved</span>
                        <span class="final-stat-value"><span id="puzzlesCompleted">0</span>/15</span>
                    </div>
                    <div class="final-stat">
                        <span class="final-stat-label">Accuracy</span>
                        <span class="final-stat-value" id="accuracy">0%</span>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="game-over-actions">
                    <button class="action-button secondary" onclick="window.location.href='../index.php'">
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
        </main>
    </div>

    <script src="../scripts/auth.js?v=2.0"></script>
    <script src="../scripts/auth-check.js?v=2.0"></script>
    <script src="../scripts/main.js?v=2.0"></script>
    <script src="../scripts/number-puzzle.js?v=1.0"></script>
</body>
</html>
