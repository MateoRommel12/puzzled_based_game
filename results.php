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
            <h1 class="game-title">Your Results & Analytics</h1>
            <button class="reset-button" onclick="resetAllData()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
                <span>Reset Data</span>
            </button>
        </header>

        <main class="results-container">
            <section class="stats-overview">
                <h2 class="section-title">Overall Performance</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <span class="stat-label">Total Score</span>
                            <span class="stat-value" id="totalScore">0</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <span class="stat-label">Games Played</span>
                            <span class="stat-value" id="gamesPlayed">0</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <span class="stat-label">Literacy Progress</span>
                            <span class="stat-value" id="literacyProgress">0%</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <span class="stat-label">Math Progress</span>
                            <span class="stat-value" id="mathProgress">0%</span>
                        </div>
                    </div>
                </div>
            </section>

            <section class="game-performance">
                <h2 class="section-title">Game Performance</h2>
                <div class="performance-grid">
                    <div class="performance-card">
                        <div class="performance-header">
                            <div class="game-icon literacy">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 class="game-name">Word Scramble</h3>
                                <span class="game-category">Literacy</span>
                            </div>
                        </div>
                        <div class="performance-stats">
                            <div class="perf-stat">
                                <span class="perf-label">Plays</span>
                                <span class="perf-value" id="wordScramblePlays">0</span>
                            </div>
                            <div class="perf-stat">
                                <span class="perf-label">Best Score</span>
                                <span class="perf-value" id="wordScrambleBest">0</span>
                            </div>
                            <div class="perf-stat">
                                <span class="perf-label">Total Score</span>
                                <span class="perf-value" id="wordScrambleTotal">0</span>
                            </div>
                        </div>
                    </div>
 
                    <div class="performance-card">
                        <div class="performance-header">
                            <div class="game-icon literacy">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 class="game-name">Reading Comprehension</h3>
                                <span class="game-category">Literacy</span>
                            </div>
                        </div>
                        <div class="performance-stats">
                            <div class="perf-stat">
                                <span class="perf-label">Plays</span>
                                <span class="perf-value" id="readingPlays">0</span>
                            </div>
                            <div class="perf-stat">
                                <span class="perf-label">Best Score</span>
                                <span class="perf-value" id="readingBest">0</span>
                            </div>
                            <div class="perf-stat">
                                <span class="perf-label">Total Score</span>
                                <span class="perf-value" id="readingTotal">0</span>
                            </div>
                        </div>
                    </div>
 
                    <div class="performance-card">
                        <div class="performance-header">
                            <div class="game-icon math">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="14" width="7" height="7"></rect>
                                    <rect x="3" y="14" width="7" height="7"></rect>
                                </svg>
                            </div>
                            <div>
                                <h3 class="game-name">Number Puzzle</h3>
                                <span class="game-category">Math</span>
                            </div>
                        </div>
                        <div class="performance-stats">
                            <div class="perf-stat">
                                <span class="perf-label">Plays</span>
                                <span class="perf-value" id="numberPuzzlePlays">0</span>
                            </div>
                            <div class="perf-stat">
                                <span class="perf-label">Best Score</span>
                                <span class="perf-value" id="numberPuzzleBest">0</span>
                            </div>
                            <div class="perf-stat">
                                <span class="perf-label">Total Score</span>
                                <span class="perf-value" id="numberPuzzleTotal">0</span>
                            </div>
                        </div>
                    </div>

                    <div class="performance-card">
                        <div class="performance-header">
                            <div class="game-icon math">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="20" x2="18" y2="10"></line>
                                    <line x1="12" y1="20" x2="12" y2="4"></line>
                                    <line x1="6" y1="20" x2="6" y2="14"></line>
                                </svg>
                            </div>
                            <div>
                                <h3 class="game-name">Math Challenge</h3>
                                <span class="game-category">Math</span>
                            </div>
                        </div>
                        <div class="performance-stats">
                            <div class="perf-stat">
                                <span class="perf-label">Plays</span>
                                <span class="perf-value" id="mathChallengePlays">0</span>
                            </div>
                            <div class="perf-stat">
                                <span class="perf-label">Best Score</span>
                                <span class="perf-value" id="mathChallengeBest">0</span>
                            </div>
                            <div class="perf-stat">
                                <span class="perf-label">Total Score</span>
                                <span class="perf-value" id="mathChallengeTotal">0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
 
            <section class="achievements-section">
                <h2 class="section-title">Achievements</h2>
                <div class="achievements-grid" id="achievementsGrid">
                     Achievements will be dynamically generated 
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
