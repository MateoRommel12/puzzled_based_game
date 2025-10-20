<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Budget Manager - Learning Games</title>
    <link rel="stylesheet" href="../styles/main.css">
    <link rel="stylesheet" href="../styles/budget-manager.css?v=3.0">
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
            <h1 class="game-title">💰 Budget Manager</h1>
            <div class="game-stats-header">
                <div class="stat-box">
                    <span class="stat-label">Wallet</span>
                    <span class="stat-value" id="wallet">$0</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">Score</span>
                    <span class="stat-value" id="score">0</span>
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
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                </div>
                <h2>How to Play</h2>
                <ul class="instructions-list">
                    <li>Manage your weekly allowance wisely</li>
                    <li>Calculate savings and expenses</li>
                    <li>Make smart spending decisions</li>
                    <li>Learn to budget like a pro!</li>
                    <li>Track discounts and deals</li>
                </ul>
                <button class="start-button" onclick="startGame()">Start Budgeting</button>
            </div>

            <!-- Game Play Area -->
            <div class="game-play-area" id="gamePlayArea" style="display: none;">
                <div class="budget-card" id="budgetCard">
                    <div class="budget-header">
                        <span class="budget-type" id="budgetType">💵 Spending Decision</span>
                        <span class="scenario-number">Challenge <span id="scenarioNumber">1</span>/12</span>
                    </div>
                    <div class="budget-content" id="budgetContent">
                        <!-- Budget content will be loaded here -->
                    </div>
                </div>

                <div class="feedback-message" id="feedbackMessage" style="display: none;"></div>

                <div class="progress-section">
                    <div class="progress-label">
                        <span>Progress</span>
                        <span id="progressText">0/12</span>
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
                <p class="game-over-message">Congratulations! You're a budget master!</p>
                
                <!-- Final Score Display -->
                <div class="final-score-container">
                    <div class="final-score-number" id="finalScore">0</div>
                    <div class="final-score-label">FINAL SCORE</div>
                </div>
                
                <!-- Stats Grid -->
                <div class="final-stats">
                    <div class="final-stat">
                        <span class="final-stat-label">Money Saved</span>
                        <span class="final-stat-value" id="moneySaved">$0</span>
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
    <script src="../scripts/budget-manager.js?v=2.0"></script>
</body>
</html>

