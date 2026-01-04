<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Learning Games - Clustering Platform</title>
    <link rel="stylesheet" href="styles/main.css?v=<?php echo time(); ?>">
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="logo">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <rect width="40" height="40" rx="8" fill="url(#gradient)"/>
                    <path d="M20 10L28 16V24L20 30L12 24V16L20 10Z" fill="white" opacity="0.9"/>
                    <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40">
                            <stop offset="0%" stop-color="#3B82F6"/>
                            <stop offset="100%" stop-color="#8B5CF6"/>
                        </linearGradient>
                    </defs>
                </svg>
                <h1>Learning Games Hub</h1>
            </div>
            <div class="user-info">
                <div class="user-profile">
                    <div class="user-avatar">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <div class="user-details">
                        <span class="user-name" id="userName">Student</span>
                        <span class="user-stats-mini">
                            <span id="gamesPlayed">0</span> games | 
                            <span id="totalScore">0</span> pts
                        </span>
                    </div>
                </div>
                <div class="header-actions">
                    <button class="view-results-button" onclick="window.location.href='results.php'">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                        </svg>
                        <span>Results</span>
                    </button>
                    <button class="view-results-button" onclick="window.location.href='leader-board.php'">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                        </svg>
                        <span>Leaderboard</span>
                    </button>
                    <button class="logout-button" onclick="handleLogout()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </header>

        <main class="main-content">
            <section class="welcome-section">
                <h2 class="section-title">Welcome to Your Learning Journey</h2>
                <p class="section-description">Choose a game below to start learning and improving your skills!</p>
            </section>

            <section class="games-section">
                <div class="section-header">
                    <h3 class="category-title">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                        Literacy Games
                    </h3>
                    <span class="category-badge" id="literacyGamesCount">4 Games</span>
                </div>
                
                <div class="games-grid" id="literacyGamesGrid">
                    <div class="game-card" data-game="shopping-list" style="border: 2px solid rgba(16, 185, 129, 0.3);">
                        <span class="practice-badge">Practice Game</span>
                        <div class="game-icon literacy">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                        </div>
                        <div class="game-content">
                            <h4 class="game-title">Shopping List Helper</h4>
                            <p class="game-description">Fix spelling mistakes and categorize items. Learn real-world shopping literacy!</p>
                            <div class="game-stats">
                                <span class="plays">0 plays</span>
                            </div>
                        </div>
                        <button class="play-button" onclick="navigateToGame('games/shopping-list.php')">
                            <span>Play Now</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </button>
                    </div>

                    <div class="game-card" data-game="message-composer" style="border: 2px solid rgba(16, 185, 129, 0.3);">
                        <span class="practice-badge">Practice Game</span>
                        <div class="game-icon literacy">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </div>
                        <div class="game-content">
                            <h4 class="game-title">Message Composer</h4>
                            <p class="game-description">Fix grammar and write professional messages. Master communication skills!</p>
                            <div class="game-stats">
                                <span class="plays">0 plays</span>
                            </div>
                        </div>
                        <button class="play-button" onclick="navigateToGame('games/message-composer.php')">
                            <span>Play Now</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </button>
                    </div>

                    <div class="game-card" data-game="word-scramble" style="border: 2px solid rgba(59, 130, 246, 0.3);">
                        <span class="practice-badge">Practice Game</span>
                        <div class="game-icon literacy">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                <path d="M2 17l10 5 10-5"></path>
                                <path d="M2 12l10 5 10-5"></path>
                            </svg>
                        </div>
                        <div class="game-content">
                            <h4 class="game-title">Word Scramble</h4>
                            <p class="game-description">Unscramble letters to form words! Build vocabulary and spelling skills!</p>
                            <div class="game-stats">
                                <span class="plays">0 plays</span>
                            </div>
                        </div>
                        <button class="play-button" onclick="navigateToGame('games/word-scramble.php')">
                            <span>Play Now</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </button>
                    </div>

                    <div class="game-card" data-game="reading-comprehension" style="border: 2px solid rgba(139, 92, 246, 0.3);">
                        <span class="practice-badge">Practice Game</span>
                        <div class="game-icon literacy">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                            </svg>
                        </div>
                        <div class="game-content">
                            <h4 class="game-title">Reading Comprehension</h4>
                            <p class="game-description">Read passages and answer questions. Improve reading skills and understanding!</p>
                            <div class="game-stats">
                                <span class="plays">0 plays</span>
                            </div>
                        </div>
                        <button class="play-button" onclick="navigateToGame('games/reading-comprehension.php')">
                            <span>Play Now</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </section>
 
            <section class="games-section">
                <div class="section-header">
                    <h3 class="category-title">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                        </svg>
                        Math Games
                    </h3>
                    <span class="category-badge" id="mathGamesCount">4 Games</span>
                </div>
                
                <div class="games-grid" id="mathGamesGrid">
                    <div class="game-card" data-game="budget-manager" style="border: 2px solid rgba(16, 185, 129, 0.3);">
                        <span class="practice-badge">Practice Game</span>
                        <div class="game-icon math">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                <line x1="1" y1="10" x2="23" y2="10"></line>
                            </svg>
                        </div>
                        <div class="game-content">
                            <h4 class="game-title">Budget Manager</h4>
                            <p class="game-description">Manage money, calculate savings, and make smart spending decisions. Real-life budgeting!</p>
                            <div class="game-stats">
                                <span class="plays">0 plays</span>
                            </div>
                        </div>
                        <button class="play-button" onclick="navigateToGame('games/budget-manager.php')">
                            <span>Play Now</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </button>
                    </div>

                    <div class="game-card" data-game="recipe-calculator" style="border: 2px solid rgba(16, 185, 129, 0.3);">
                        <span class="practice-badge">Practice Game</span>
                        <div class="game-icon math">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                                <path d="M7 2v20"></path>
                                <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
                            </svg>
                        </div>
                        <div class="game-content">
                            <h4 class="game-title">Recipe Calculator</h4>
                            <p class="game-description">Scale recipes, work with fractions, and convert measurements. Kitchen math made easy!</p>
                            <div class="game-stats">
                                <span class="plays">0 plays</span>
                            </div>
                        </div>
                        <button class="play-button" onclick="navigateToGame('games/recipe-calculator.php')">
                            <span>Play Now</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </button>
                    </div>

                    <div class="game-card" data-game="number-puzzle" style="border: 2px solid rgba(245, 158, 11, 0.3);">
                        <span class="practice-badge">Practice Game</span>
                        <div class="game-icon math">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M12 6v6l4 2"></path>
                            </svg>
                        </div>
                        <div class="game-content">
                            <h4 class="game-title">Number Puzzle</h4>
                            <p class="game-description">Solve number sequences and mathematical puzzles. Challenge your logical thinking!</p>
                            <div class="game-stats">
                                <span class="plays">0 plays</span>
                            </div>
                        </div>
                        <button class="play-button" onclick="navigateToGame('games/number-puzzle.php')">
                            <span>Play Now</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </button>
                    </div>

                    <div class="game-card" data-game="math-challenge" style="border: 2px solid rgba(239, 68, 68, 0.3);">
                        <span class="practice-badge">Practice Game</span>
                        <div class="game-icon math">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 11H1l8-8 8 8h-8z"></path>
                                <path d="M15 13H7l8 8 8-8h-8z"></path>
                            </svg>
                        </div>
                        <div class="game-content">
                            <h4 class="game-title">Math Challenge</h4>
                            <p class="game-description">Fast-paced arithmetic problems with difficulty levels. Build speed and accuracy!</p>
                            <div class="game-stats">
                                <span class="plays">0 plays</span>
                            </div>
                        </div>
                        <button class="play-button" onclick="navigateToGame('games/math-challenge.php')">
                            <span>Play Now</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </section>

            <section class="progress-section">
                <h3 class="section-title">Your Progress</h3>
                <div class="progress-grid">
                    <div class="progress-card">
                        <div class="progress-icon">📚</div>
                        <div class="progress-content">
                            <h4>Literacy Skills</h4>
                            <div class="progress-bar">
                                <div class="progress-fill" id="literacyProgress" style="width: 0%"></div>
                            </div>
                            <span class="progress-text">0% Complete</span>
                        </div>
                    </div>
                    <div class="progress-card">
                        <div class="progress-icon">🔢</div>
                        <div class="progress-content">
                            <h4>Math Skills</h4>
                            <div class="progress-bar">
                                <div class="progress-fill" id="mathProgress" style="width: 0%"></div>
                            </div>
                            <span class="progress-text">0% Complete</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <footer class="footer">
            <p>&copy; 2025 Student Clustering Platform. Capstone Project: Clustering Students Based on Puzzle-Based Games</p>
        </footer>
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
