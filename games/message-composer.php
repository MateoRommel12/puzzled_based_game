<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Message Composer - Learning Games</title>
    <link rel="stylesheet" href="../styles/main.css">
    <link rel="stylesheet" href="../styles/message-composer.css?v=3.0">
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
            <h1 class="game-title">💬 Message Composer</h1>
            <div class="game-stats-header">
                <div class="stat-box">
                    <span class="stat-label">Score</span>
                    <span class="stat-value" id="score">0</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">Messages</span>
                    <span class="stat-value" id="messagesCompleted">0</span>
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
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </div>
                <h2>How to Play</h2>
                <ul class="instructions-list">
                    <li>Fix grammar and spelling in messages</li>
                    <li>Choose the correct punctuation</li>
                    <li>Write professional emails</li>
                    <li>Learn proper communication skills</li>
                    <li>Master text and email etiquette!</li>
                </ul>
                <button class="start-button" onclick="startGame()">Start Composing</button>
            </div>

            <!-- Game Play Area -->
            <div class="game-play-area" id="gamePlayArea" style="display: none;">
                <div class="message-card" id="messageCard">
                    <div class="message-header">
                        <span class="message-type" id="messageType">Text Message</span>
                        <span class="message-number">Message <span id="messageNumber">1</span>/12</span>
                    </div>
                    <div class="message-content" id="messageContent">
                        <!-- Message content will be loaded here -->
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
                <p class="game-over-message">Congratulations! You're a communication master!</p>
                
                <!-- Final Score Display -->
                <div class="final-score-container">
                    <div class="final-score-number" id="finalScore">0</div>
                    <div class="final-score-label">FINAL SCORE</div>
                </div>
                
                <!-- Stats Grid -->
                <div class="final-stats">
                    <div class="final-stat">
                        <span class="final-stat-label">Correct Answers</span>
                        <span class="final-stat-value"><span id="messagesFixed">0</span>/12</span>
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

    <link rel="stylesheet" href="../styles/modal.css">
    <script src="../scripts/modal.js"></script>
    <script src="../scripts/auth.js?v=2.0"></script>
    <script src="../scripts/auth-check.js?v=2.0"></script>
    <script src="../scripts/main.js?v=2.0"></script>
    <script src="../scripts/message-composer.js?v=2.0"></script>
</body>
</html>

