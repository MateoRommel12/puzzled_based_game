<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Custom Game - Learning Games</title>
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/custom-game-player.css">
</head>
<body>
    <script src="scripts/auth.js"></script>
    <script src="scripts/auth-check.js"></script>

    <div class="container">
        <!-- Game Header -->
        <header class="game-header">
            <button class="back-button" onclick="window.location.href='index.php'">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Back to Dashboard</span>
            </button>
            <h1 class="game-title">
                <span id="gameHeaderIcon">🎮</span>
                <span id="gameHeaderName">Custom Game</span>
            </h1>
            <div class="game-stats-header">
                <div class="stat-box">
                    <span class="stat-label">Score</span>
                    <span class="stat-value" id="headerScore">0</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">Question</span>
                    <span class="stat-value"><span id="headerCurrent">0</span>/<span id="headerTotal">0</span></span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">Time</span>
                    <span class="stat-value" id="headerTime">0:00</span>
                </div>
            </div>
        </header>

        <main class="game-container">

        <!-- Instructions Screen -->
        <div id="instructionsCard" class="instructions-card">
            <div class="instructions-header">
                <div id="instructionsIcon" class="game-icon-display" style="font-size: 4rem;">🎮</div>
                <h2 id="instructionsTitle">How to Play</h2>
            </div>
            
            <div class="instructions-content">
                <h3>📖 Instructions</h3>
                <ul id="instructionsList">
                    <li>Loading instructions...</li>
                </ul>
                
                <div class="game-info-grid">
                    <div class="info-item">
                        <span class="info-icon">❓</span>
                        <div>
                            <div class="info-label">Questions</div>
                            <div class="info-value" id="infoQuestions">-</div>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="info-icon">⏱️</span>
                        <div>
                            <div class="info-label">Time Limit</div>
                            <div class="info-value" id="infoTimeLimit">-</div>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="info-icon">📊</span>
                        <div>
                            <div class="info-label">Difficulty</div>
                            <div class="info-value" id="infoDifficulty">-</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="instructions-actions">
                <button onclick="window.location.href='index.php'" class="btn-secondary">
                    ← Back to Dashboard
                </button>
                <button onclick="startCustomGame()" class="btn-primary">
                    Start Game →
                </button>
            </div>
        </div>

        <!-- Game Play Area -->
        <div id="gamePlayArea" class="game-play-area" style="display: none;">
            <!-- Progress Bar -->
            <div class="progress-container">
                <div class="progress-text" id="progressText">0/0</div>
                <div class="progress-bar">
                    <div id="progressFill" class="progress-fill" style="width: 0%"></div>
                </div>
            </div>

            <!-- Question Card -->
            <div class="card">
                <div class="question-header">
                    <h3>Question <span id="currentQuestionNum">1</span> of <span id="totalQuestionsNum">0</span></h3>
                </div>
                
                <div class="question-content">
                    <p id="questionText" class="question-text">Loading question...</p>
                    
                    <div id="answersContainer" class="answers-container">
                        <!-- Answers will be loaded here dynamically -->
                    </div>

                    <div id="feedbackMessage" class="feedback-message" style="display: none;">
                        <!-- Feedback will be shown here -->
                    </div>
                </div>
            </div>
        </div>

        </main>
    </div>

    <!-- Game Over Screen (outside container for overlay effect) -->
    <div id="gameOverScreen" class="results-overlay" style="display: none;">
        <div class="results-card">
            <div class="results-icon">🎉</div>
            <h2>Game Complete!</h2>
            <p>Congratulations! You've finished the game!</p>
            
            <div class="score-display">
                <div class="final-score" id="finalScore">0</div>
                <div class="score-label">Final Score</div>
            </div>
            
            <div class="results-stats">
                <div class="result-stat">
                    <span class="result-label">Correct Answers</span>
                    <span class="result-value" id="correctCount">0/0</span>
                </div>
                <div class="result-stat">
                    <span class="result-label">Accuracy</span>
                    <span class="result-value" id="accuracy">0%</span>
                </div>
            </div>
            
            <div class="results-actions">
                <button onclick="window.location.href='index.php'" class="btn-secondary">
                    ← Back to Dashboard
                </button>
                <button onclick="location.reload()" class="btn-primary">
                    Play Again 🔄
                </button>
            </div>
        </div>
    </div>

    <script src="scripts/custom-game-player.js"></script>
</body>
</html>

