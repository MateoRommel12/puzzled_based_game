<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leaderboard</title>
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/leaderboard.css">
</head>
<body>
<div class="container">
<div class="container">
        <header class="game-header">
            <button class="back-button" onclick="window.location.href='index.php'">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Back to Dashboard</span>
            </button>
            <h1 class="game-title">Leaderboard</h1>
        </header>
        <main class="main-content">
        <section class="leaderboard-section">
                <div class="leaderboard-header">
                    <h3 class="leaderboard-title" id="leaderboardTitle">🏆 Overall Leaderboard</h3>
                    <div class="leaderboard-controls">
                        <div class="leaderboard-type-buttons">
                            <button class="leaderboard-type-btn active" data-type="overall">Overall</button>
                            <button class="leaderboard-type-btn" data-type="literacy">Literacy</button>
                            <button class="leaderboard-type-btn" data-type="math">Math</button>
                            <button class="leaderboard-type-btn" data-type="recent">Recent</button>
                        </div>
                        <div class="leaderboard-actions">
                            <button class="refresh-btn" id="refreshLeaderboard" title="Refresh Leaderboard">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="23 4 23 10 17 10"></polyline>
                                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                                </svg>
                                Refresh
                            </button>
                            <div class="auto-refresh-toggle">
                                <input type="checkbox" id="autoRefreshToggle" checked>
                                <label for="autoRefreshToggle">Auto-refresh</label>
                            </div>
                            <span class="last-refresh" id="lastRefreshTime">Loading...</span>
                        </div>
                    </div>
                </div>
                <div id="leaderboardContainer">
                    <div class="leaderboard-loading">
                        <div class="loading-spinner"></div>
                        <p>Loading leaderboard...</p>
                    </div>
                </div>
            </section>
        </main>
    </div>     
    <link rel="stylesheet" href="styles/modal.css">
    <link rel="stylesheet" href="styles/leaderboard.css">
    <link rel="stylesheet" href="styles/profile.css">
    <script src="scripts/modal.js"></script>
    <script src="scripts/auth.js?v=2.0"></script>
    <script src="scripts/auth-check.js?v=2.0"></script>
    <script src="scripts/main.js?v=2.0"></script>
    <script src="scripts/leaderboard.js"></script>
    <script src="scripts/profile.js"></script>
</body>
</html>