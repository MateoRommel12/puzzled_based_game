// Leaderboard Management System

class LeaderboardManager {
    constructor() {
        this.currentType = 'overall';
        this.refreshInterval = null;
        this.autoRefresh = true;
        this.refreshRate = 30000; // 30 seconds
    }

    /**
     * Initialize leaderboard system
     */
    init() {
        this.setupEventListeners();
        this.loadLeaderboard(this.currentType);
        this.startAutoRefresh();
    }

    /**
     * Setup event listeners for leaderboard controls
     */
    setupEventListeners() {
        // Leaderboard type buttons
        const typeButtons = document.querySelectorAll('.leaderboard-type-btn');
        typeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                this.switchLeaderboardType(type);
            });
        });

        // Auto-refresh toggle
        const autoRefreshToggle = document.getElementById('autoRefreshToggle');
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('change', (e) => {
                this.autoRefresh = e.target.checked;
                if (this.autoRefresh) {
                    this.startAutoRefresh();
                } else {
                    this.stopAutoRefresh();
                }
            });
        }

        // Manual refresh button
        const refreshBtn = document.getElementById('refreshLeaderboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadLeaderboard(this.currentType);
            });
        }
    }

    /**
     * Switch leaderboard type
     */
    switchLeaderboardType(type) {
        this.currentType = type;
        
        // Update active button
        document.querySelectorAll('.leaderboard-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
        
        // Update title
        this.updateLeaderboardTitle(type);
        
        // Load new data
        this.loadLeaderboard(type);
    }

    /**
     * Update leaderboard title based on type
     */
    updateLeaderboardTitle(type) {
        const titleElement = document.getElementById('leaderboardTitle');
        if (!titleElement) return;

        const titles = {
            'overall': '🏆 Overall Leaderboard',
            'literacy': '📚 Literacy Champions',
            'math': '🔢 Math Masters',
            'recent': '⚡ Recent Activity'
        };

        titleElement.textContent = titles[type] || '🏆 Leaderboard';
    }

    /**
     * Load leaderboard data
     */
    async loadLeaderboard(type = 'overall') {
        const container = document.getElementById('leaderboardContainer');
        if (!container) return;

        // Show loading state
        this.showLoadingState(container);

        try {
            const response = await fetch(`/ClusteringGame/api/leaderboard.php?action=${type}`);
            const result = await response.json();

            if (result.success) {
                this.displayLeaderboard(result.leaderboard, result.type, container);
                this.updateLastRefreshTime(result.updated_at);
            } else {
                this.showErrorState(container, result.message);
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.showErrorState(container, 'Failed to load leaderboard data');
        }
    }

    /**
     * Display leaderboard data
     */
    displayLeaderboard(students, type, container) {
        if (!students || students.length === 0) {
            container.innerHTML = `
                <div class="leaderboard-empty">
                    <div class="empty-icon">📊</div>
                    <h3>No Data Available</h3>
                    <p>No students have played games yet</p>
                </div>
            `;
            return;
        }

        const currentUserId = this.getCurrentUserId();
        
        container.innerHTML = `
            <div class="leaderboard-list">
                ${students.map((student, index) => this.createLeaderboardRow(student, index + 1, type, currentUserId)).join('')}
            </div>
        `;

        // Add current user highlight if not in top results
        if (currentUserId) {
            this.highlightCurrentUser(currentUserId, type);
        }
    }

    /**
     * Create leaderboard row HTML
     */
    createLeaderboardRow(student, position, type, currentUserId) {
        const isCurrentUser = student.user_id == currentUserId;
        const rowClass = isCurrentUser ? 'leaderboard-row current-user' : 'leaderboard-row';
        
        const rankIcon = this.getRankIcon(position);
        const scoreDisplay = this.getScoreDisplay(student, type);
        const performanceBadge = this.getPerformanceBadge(student.performance_level);
        
        return `
            <div class="${rowClass}" data-user-id="${student.user_id}">
                <div class="rank">
                    ${rankIcon}
                    <span class="rank-number">${position}</span>
                </div>
                <div class="student-info">
                    <div class="student-name">
                        ${this.escapeHtml(student.full_name)}
                        ${isCurrentUser ? '<span class="you-badge">YOU</span>' : ''}
                    </div>
                    <div class="student-details">
                        ${performanceBadge}
                        <span class="games-played">${student.games_played || 0} games</span>
                    </div>
                </div>
                <div class="score">
                    ${scoreDisplay}
                </div>
                <div class="activity">
                    ${this.getLastActivity(student.last_login)}
                </div>
            </div>
        `;
    }

    /**
     * Get rank icon based on position
     */
    getRankIcon(position) {
        if (position === 1) return '🥇';
        if (position === 2) return '🥈';
        if (position === 3) return '🥉';
        return '';
    }

    /**
     * Get score display based on leaderboard type
     */
    getScoreDisplay(student, type) {
        switch (type) {
            case 'literacy':
                return `<span class="score-value">${Math.round(student.score || 0)}%</span>`;
            case 'math':
                return `<span class="score-value">${Math.round(student.score || 0)}%</span>`;
            case 'recent':
                return `<span class="score-value">${student.score || 0}</span>`;
            default:
                return `<span class="score-value">${student.total_score || 0}</span>`;
        }
    }

    /**
     * Get performance level badge
     */
    getPerformanceBadge(level) {
        const badges = {
            'high': '<span class="perf-badge high">High</span>',
            'medium': '<span class="perf-badge medium">Medium</span>',
            'low': '<span class="perf-badge low">Low</span>'
        };
        return badges[level] || '<span class="perf-badge low">Low</span>';
    }

    /**
     * Get last activity display
     */
    getLastActivity(lastLogin) {
        if (!lastLogin) return '<span class="inactive">Never</span>';
        
        const now = new Date();
        const lastLoginDate = new Date(lastLogin);
        const diffTime = Math.abs(now - lastLoginDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '<span class="active">Today</span>';
        if (diffDays <= 7) return `<span class="active">${diffDays}d ago</span>`;
        return `<span class="inactive">${diffDays}d ago</span>`;
    }

    /**
     * Highlight current user if not in top results
     */
    async highlightCurrentUser(userId, type) {
        try {
            const response = await fetch(`/ClusteringGame/api/leaderboard.php?action=${type}&userId=${userId}`);
            const result = await response.json();
            
            if (result.success && result.userRank) {
                this.addCurrentUserRank(result.userRank, type);
            }
        } catch (error) {
            console.error('Error getting current user rank:', error);
        }
    }

    /**
     * Add current user rank display
     */
    addCurrentUserRank(userRank, type) {
        const container = document.getElementById('leaderboardContainer');
        const currentUserDiv = document.createElement('div');
        currentUserDiv.className = 'current-user-rank';
        
        const scoreDisplay = this.getScoreDisplay(userRank, type);
        const performanceBadge = this.getPerformanceBadge(userRank.performance_level);
        
        currentUserDiv.innerHTML = `
            <div class="rank-info">
                <span class="your-rank">Your Rank: #${userRank.rank}</span>
                <div class="your-score">${scoreDisplay}</div>
            </div>
        `;
        
        container.appendChild(currentUserDiv);
    }

    /**
     * Show loading state
     */
    showLoadingState(container) {
        container.innerHTML = `
            <div class="leaderboard-loading">
                <div class="loading-spinner"></div>
                <p>Loading leaderboard...</p>
            </div>
        `;
    }

    /**
     * Show error state
     */
    showErrorState(container, message) {
        container.innerHTML = `
            <div class="leaderboard-error">
                <div class="error-icon">⚠️</div>
                <h3>Error Loading Leaderboard</h3>
                <p>${this.escapeHtml(message)}</p>
                <button class="retry-btn" onclick="leaderboardManager.loadLeaderboard('${this.currentType}')">
                    Try Again
                </button>
            </div>
        `;
    }

    /**
     * Update last refresh time
     */
    updateLastRefreshTime(updatedAt) {
        const timeElement = document.getElementById('lastRefreshTime');
        if (timeElement) {
            const date = new Date(updatedAt);
            timeElement.textContent = `Updated ${date.toLocaleTimeString()}`;
        }
    }

    /**
     * Start auto-refresh
     */
    startAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        if (this.autoRefresh) {
            this.refreshInterval = setInterval(() => {
                this.loadLeaderboard(this.currentType);
            }, this.refreshRate);
        }
    }

    /**
     * Stop auto-refresh
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * Get current user ID
     */
    getCurrentUserId() {
        // Try to get from auth manager if available
        if (typeof authManager !== 'undefined') {
            const user = authManager.getCurrentUser();
            return user ? user.user_id : null;
        }
        
        // Try to get from session storage
        const userData = sessionStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                return user.user_id || null;
            } catch (e) {
                return null;
            }
        }
        
        return null;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Destroy leaderboard manager
     */
    destroy() {
        this.stopAutoRefresh();
    }
}

// Initialize global leaderboard manager
const leaderboardManager = new LeaderboardManager();

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('leaderboardContainer')) {
        leaderboardManager.init();
    }
});
