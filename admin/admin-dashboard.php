<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Student Clustering System</title>
    <link rel="stylesheet" href="../styles/main.css">
    <link rel="stylesheet" href="../styles/admin.css">
    <link rel="stylesheet" href="../styles/modal.css">
    <link rel="stylesheet" href="../styles/leaderboard.css">
    <link rel="stylesheet" href="../styles/student-management.css">
</head>
<body>
    <script src="../scripts/modal.js"></script>
    <script src="../scripts/admin-auth.js"></script>
    <script src="../scripts/admin-auth-check.js"></script>
    <script src="../scripts/admin-check.js"></script>
    <script src="../scripts/clustering.js"></script>

    <div class="admin-container">
        <header class="admin-header">
            <div class="admin-header-content">
                <h1>Admin Dashboard</h1>
                <div class="admin-user-info">
                    <span id="adminUsername">Admin</span>
                    <button onclick="adminLogout()" class="logout-btn">Logout</button>
                </div>
            </div>
        </header>

        <nav class="admin-nav">
            <button class="nav-tab active" data-tab="overview">Overview</button>
            <button class="nav-tab" data-tab="students">Students</button>
            <button class="nav-tab" data-tab="student-management">Manage Students</button>
            <button class="nav-tab" data-tab="games">Custom Games</button>
            <button class="nav-tab" data-tab="leaderboard">Leaderboard</button>
            <button class="nav-tab" data-tab="clustering">Clustering</button>
        </nav>

        <div id="overview" class="tab-content active">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-info">
                        <div class="stat-label">Total Students</div>
                        <div class="stat-value" id="totalStudents">0</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">🎮</div>
                    <div class="stat-info">
                        <div class="stat-label">Total Games Played</div>
                        <div class="stat-value" id="totalGamesPlayed">0</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-info">
                        <div class="stat-label">Average Score</div>
                        <div class="stat-value" id="averageScore">0</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-info">
                        <div class="stat-label">Active Today</div>
                        <div class="stat-value" id="activeToday">0</div>
                    </div>
                </div>
            </div>

            <div class="charts-grid">
                <div class="chart-card">
                    <h3>Game Popularity</h3>
                    <div id="gamePopularityChart" class="chart-container"></div>
                </div>

                <div class="chart-card">
                    <h3>Performance Distribution</h3>
                    <div id="performanceChart" class="chart-container"></div>
                </div>
            </div>
        </div>

        <div id="students" class="tab-content">
            <div class="table-controls">
                <input type="text" id="searchStudent" placeholder="Search students..." class="search-input">
                <select id="filterPerformance" class="filter-select">
                    <option value="all">All Performance Levels</option>
                    <option value="high">High Performers</option>
                    <option value="medium">Medium Performers</option>
                    <option value="low">Low Performers</option>
                </select>
            </div>

            <div class="table-container">
                <table class="students-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Email</th>
                            <th>Total Score</th>
                            <th>Games Played</th>
                            <th>Literacy Progress</th>
                            <th>Math Progress</th>
                            <th>Performance Level</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="studentsTableBody">
                    </tbody>
                </table>
            </div>
        </div>

        <div id="games" class="tab-content">
            <!-- Custom Games Management -->
            <div class="games-management-header">
                <div>
                    <h2 style="color: #60a5fa; margin-bottom: 0.5rem;">🎮 Custom Learning Games</h2>
                    <p style="color: #a0a0a0;">Create and manage custom educational games for students</p>
                </div>
                <button class="create-game-btn" onclick="window.location.href='add-game.php'">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Create New Game
                </button>
            </div>

            <!-- Games Grid -->
            <div id="customGamesList" class="custom-games-grid">
                <!-- Games will be loaded here -->
                <div class="loading-state">
                    <p>Loading custom games...</p>
                </div>
            </div>
        </div>

        <div id="student-management" class="tab-content">
            <div class="student-management-section">
                <div class="student-management-header">
                    <h3 class="student-management-title">👥 Student Management</h3>
                    <div class="student-management-controls">
                        <div class="search-container">
                            <input type="text" id="studentSearch" placeholder="Search students by name or email...">
                        </div>
                        <div class="filter-container">
                            <select id="statusFilter">
                                <option value="all">All Students</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                        </div>
                        <button class="add-student-btn" id="addStudentBtn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add Student
                        </button>
                    </div>
                </div>

                <div class="stats-cards">
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-info">
                            <div class="stat-label">Active Students</div>
                            <div class="stat-value" id="activeStudentsCount">0</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">❌</div>
                        <div class="stat-info">
                            <div class="stat-label">Inactive Students</div>
                            <div class="stat-value" id="inactiveStudentsCount">0</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🎮</div>
                        <div class="stat-info">
                            <div class="stat-label">Total Games Played</div>
                            <div class="stat-value" id="totalGamesCount">0</div>
                        </div>
                    </div>
                </div>

                <div class="students-table-container">
                    <table class="students-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Status</th>
                                <th>Score</th>
                                <th>Games</th>
                                <th>Literacy</th>
                                <th>Math</th>
                                <th>Performance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="studentManagementTableBody">
                            <tr>
                                <td colspan="8" class="loading-state">
                                    <div class="loading-spinner"></div>
                                    <p>Loading students...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div id="paginationContainer"></div>
            </div>
        </div>

        <div id="leaderboard" class="tab-content">
            <div class="leaderboard-section">
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
            </div>
        </div>

        <div id="clustering" class="tab-content">
            <!-- Clustering Header -->
            <div class="clustering-header">
                <div class="clustering-title">
                    <h2>Student Clustering</h2>
                    <p class="subtitle">Machine learning analysis of student performance patterns</p>
                </div>
                <div class="clustering-controls">
                    <button class="run-clustering-btn" onclick="runManualClustering()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="5,3 19,12 5,21"></polygon>
                        </svg>
                        Run Clustering Now
                    </button>
                    <button class="refresh-btn" onclick="loadClusteringData()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        Refresh Data
                    </button>
                </div>
            </div>

            <!-- Clustering Status -->
            <div class="clustering-status">
                <div class="status-card">
                    <div class="status-icon">📊</div>
                    <div class="status-info">
                        <div class="status-label">Last Clustering</div>
                        <div class="status-value" id="lastClusteringTime">Loading...</div>
                    </div>
                </div>
                <div class="status-card">
                    <div class="status-icon">🎮</div>
                    <div class="status-info">
                        <div class="status-label">New Games Since Last Run</div>
                        <div class="status-value" id="newGamesCount">Loading...</div>
                    </div>
                </div>
            </div>
            <!-- Main Clustering Content -->
            <div id="clusteringContent" class="clustering-main">
                <!-- Content will be loaded dynamically -->
                <div class="clustering-placeholder">
                    <div class="placeholder-icon">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="12" cy="12" r="3"></circle>
                            <circle cx="19" cy="5" r="2"></circle>
                            <circle cx="5" cy="5" r="2"></circle>
                            <circle cx="19" cy="19" r="2"></circle>
                            <circle cx="5" cy="19" r="2"></circle>
                            <line x1="12" y1="9" x2="12" y2="6"></line>
                            <line x1="14.5" y1="10.5" x2="17" y2="7"></line>
                            <line x1="9.5" y1="10.5" x2="7" y2="7"></line>
                            <line x1="14.5" y1="13.5" x2="17" y2="17"></line>
                            <line x1="9.5" y1="13.5" x2="7" y2="17"></line>
                        </svg>
                    </div>
                    <h3>Loading Clustering Analysis...</h3>
                    <p>Please wait while we fetch the latest clustering data</p>
                </div>
            </div>
        </div>
    </div>

    <script src="../scripts/admin-dashboard.js"></script>
    <script src="../scripts/leaderboard.js"></script>
    <script src="../scripts/student-management.js"></script>
</body>
</html>
