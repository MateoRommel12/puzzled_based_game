<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Results & Analytics - Learning Games</title>
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/results.css">
</head>
<body>
    <div class="container">
        <header class="game-header">
            <button class="back-button" onclick="window.location.href='index.php'">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Back to Dashboard</span>
            </button>
            <h1 class="game-title">Statistics</h1>
        </header>

        <main class="results-container">
            <section class="stats-overview">
                <h2 class="section-title">Your Statistics</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">🎮</div>
                        <div class="stat-info">
                            <div class="stat-label">Games Played</div>
                            <div class="stat-value" id="gamesPlayed">0</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-info">
                            <div class="stat-label">Total Score</div>
                            <div class="stat-value" id="totalScore">0</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">📚</div>
                        <div class="stat-info">
                            <div class="stat-label">Literacy Progress</div>
                            <div class="stat-value" id="literacyProgress">0%</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">🔢</div>
                        <div class="stat-info">
                            <div class="stat-label">Math Progress</div>
                            <div class="stat-value" id="mathProgress">0%</div>
                        </div>
                    </div>
                </div>
                
                <div class="performance-level">
                    <div class="performance-header">
                        <div class="performance-icon-wrapper">
                            <svg class="performance-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                <path d="M2 17l10 5 10-5"></path>
                                <path d="M2 12l10 5 10-5"></path>
                            </svg>
                        </div>
                        <div class="performance-content">
                            <h3>Your Performance Level</h3>
                            <p class="performance-description" id="performanceDescription">Keep practicing to improve your skills!</p>
                        </div>
                    </div>
                    <div class="performance-badge-wrapper">
                        <div class="performance-badge" id="performanceLevel">
                            <span class="badge-icon" id="badgeIcon">🎯</span>
                            <span class="badge-text" id="performanceLabel">Needs Support</span>
                        </div>
                    </div>
                    <div class="performance-progress-bar">
                        <div class="progress-fill" id="performanceProgressFill"></div>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <link rel="stylesheet" href="styles/modal.css">
    <script src="scripts/modal.js"></script>
    <script src="scripts/main.js"></script>
    <script src="scripts/results.js"></script>
</body>
</html>
