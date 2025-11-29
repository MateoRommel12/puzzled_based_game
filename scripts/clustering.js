// Clustering Integration with PythonAnywhere Service

// Configuration
const CLUSTERING_CONFIG = {
    serviceUrl: 'https://matts.pythonanywhere.com'
};

// Clustering Service Integration
class ClusteringService {
    constructor() {
        this.isRunning = false;
        this.apiUrl = this.getApiUrl();
    }
    
    // Get correct API URL based on current path
    getApiUrl() {
        const path = window.location.pathname;
        if (path.includes('/admin/')) {
            return '../api/clustering.php';
        } else {
            return 'api/clustering.php';
        }
    }
    
    // Get correct game session API URL
    getGameSessionApiUrl() {
        const path = window.location.pathname;
        if (path.includes('/admin/')) {
            return '../api/game-session.php';
        } else {
            return 'api/game-session.php';
        }
    }

    /**
     * Run clustering analysis via PythonAnywhere service
     */
    async runClustering() {
        if (this.isRunning) {
            console.log('Clustering already running...');
            return;
        }

        this.isRunning = true;
        this.updateClusteringButton(true);

        try {
            const response = await fetch(`${this.apiUrl}?action=run`);
            const data = await response.json();

            if (data.success) {
                this.showSuccessMessage('Clustering completed successfully!');
                this.displayClusteringReport(data.report);
                this.updateLastClusteringTime();
            } else {
                this.showErrorMessage('Clustering failed: ' + data.message);
            }
        } catch (error) {
            console.error('Clustering error:', error);
            this.showErrorMessage('Failed to run clustering: ' + error.message);
        } finally {
            this.isRunning = false;
            this.updateClusteringButton(false);
        }
    }

    /**
     * Check clustering service status
     */
    async checkServiceStatus() {
        try {
            const response = await fetch(`${this.apiUrl}?action=status`);
            const data = await response.json();
            
            this.updateServiceStatus(data);
            return data;
        } catch (error) {
            console.error('Status check error:', error);
            this.updateServiceStatus({ success: false, message: 'Service unavailable' });
        }
    }

    /**
     * Update clustering button state
     */
    updateClusteringButton(isRunning) {
        const button = document.querySelector('.run-clustering-btn');
        if (button) {
            button.disabled = isRunning;
            button.textContent = isRunning ? 'Running Clustering...' : 'Run Clustering Now';
        }
    }

    /**
     * Show success message
     */
    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    /**
     * Show message in UI
     */
    showMessage(message, type) {
        // Create or update message element
        let messageEl = document.getElementById('clusteringMessage');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'clusteringMessage';
            messageEl.className = 'clustering-message';
            
            const clusteringContent = document.getElementById('clusteringContent');
            if (clusteringContent) {
                clusteringContent.insertBefore(messageEl, clusteringContent.firstChild);
            }
        }

        messageEl.className = `clustering-message clustering-message-${type}`;
        messageEl.textContent = message;
        messageEl.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }

    /**
     * Display clustering report
     */
    displayClusteringReport(report) {
        const content = document.getElementById('clusteringContent');
        if (!content) return;

        const reportHTML = `
            <div class="clustering-report">
                <div class="report-header">
                    <h3>Clustering Analysis Report</h3>
                    <p class="report-date">Analysis Date: ${report.analysis_date}</p>
                </div>
                
                <div class="report-summary">
                    <div class="summary-item">
                        <span class="summary-label">Total Students:</span>
                        <span class="summary-value">${report.total_students}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Clusters Created:</span>
                        <span class="summary-value">${report.number_of_clusters}</span>
                    </div>
                </div>

                <div class="clusters-grid">
                    ${report.clusters.map(cluster => `
                        <div class="cluster-card cluster-${cluster.cluster_number}">
                            <div class="cluster-header">
                                <h4>${cluster.label}</h4>
                                <span class="cluster-count">${cluster.student_count} students (${cluster.percentage}%)</span>
                            </div>
                            <div class="cluster-stats">
                                <div class="stat">
                                    <span class="stat-label">Avg Performance:</span>
                                    <span class="stat-value">${cluster.average_performance}%</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Literacy Avg:</span>
                                    <span class="stat-value">${cluster.literacy_average}%</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Math Avg:</span>
                                    <span class="stat-value">${cluster.math_average}%</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Accuracy Avg:</span>
                                    <span class="stat-value">${cluster.accuracy_average}%</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        content.innerHTML = reportHTML;
    }

    /**
     * Update service status display
     */
    updateServiceStatus(status) {
        const statusElement = document.getElementById('serviceStatus');
        if (statusElement) {
            if (status.success) {
                statusElement.innerHTML = `
                    <div class="status-indicator online"></div>
                    Service Online - ${status.service_status}
                `;
            } else {
                statusElement.innerHTML = `
                    <div class="status-indicator offline"></div>
                    Service Offline - ${status.message}
                `;
            }
        }
    }

    /**
     * Update last clustering time
     */
    updateLastClusteringTime() {
        const timeElement = document.getElementById('lastClusteringTime');
        if (timeElement) {
            timeElement.textContent = new Date().toLocaleString();
        }
    }

    /**
     * Load clustering data
     */
    async loadClusteringData() {
        try {
            // Load latest clustering results from database
            const response = await fetch(`${this.apiUrl}?action=status`);
            const data = await response.json();
            
            if (data.success) {
                this.updateServiceStatus(data);
            }
            
        } catch (error) {
            console.error('Error loading clustering data:', error);
        }
    }

    /**
     * Update new games count
     */
    async updateNewGamesCount() {
        try {
            const response = await fetch(this.getGameSessionApiUrl() + '?action=get-stats');
            const data = await response.json();
            
            if (data.success) {
                const countElement = document.getElementById('newGamesCount');
                if (countElement) {
                    // This would need to be calculated based on last clustering time
                    countElement.textContent = '0'; // Placeholder
                }
            }
        } catch (error) {
            console.error('Error updating games count:', error);
        }
    }
}

// Initialize clustering service
const clusteringService = new ClusteringService();

// Global functions for backward compatibility
function runManualClustering() {
    clusteringService.runClustering();
}

function loadClusteringData() {
    clusteringService.loadClusteringData();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check service status on load
    clusteringService.checkServiceStatus();
    
    // Load initial data
    clusteringService.loadClusteringData();
});

// Legacy K-means Clustering Algorithm for Student Performance (kept for reference)

class StudentClustering {
  constructor(students, k = 3) {
    this.students = students
    this.k = k // Number of clusters (Low, Medium, High performers)
    this.clusters = []
    this.centroids = []
  }

  // Normalize data to 0-1 range
  normalize(value, min, max) {
    if (max === min) return 0
    return (value - min) / (max - min)
  }

  // Calculate Euclidean distance
  distance(point1, point2) {
    return Math.sqrt(
      Math.pow(point1.literacy - point2.literacy, 2) +
        Math.pow(point1.math - point2.math, 2) +
        Math.pow(point1.score - point2.score, 2) +
        Math.pow(point1.games - point2.games, 2),
    )
  }

  // Prepare student data for clustering
  prepareData() {
    const scores = this.students.map((s) => s.totalScore)
    const games = this.students.map((s) => s.gamesPlayed)

    const minScore = Math.min(...scores)
    const maxScore = Math.max(...scores)
    const minGames = Math.min(...games)
    const maxGames = Math.max(...games)

    return this.students.map((student) => ({
      student: student,
      literacy: student.literacyProgress / 100,
      math: student.mathProgress / 100,
      score: this.normalize(student.totalScore, minScore, maxScore),
      games: this.normalize(student.gamesPlayed, minGames, maxGames),
    }))
  }

  // Initialize centroids randomly
  initializeCentroids(data) {
    const centroids = []
    const used = new Set()

    while (centroids.length < this.k && centroids.length < data.length) {
      const index = Math.floor(Math.random() * data.length)
      if (!used.has(index)) {
        used.add(index)
        centroids.push({
          literacy: data[index].literacy,
          math: data[index].math,
          score: data[index].score,
          games: data[index].games,
        })
      }
    }

    return centroids
  }

  // Assign students to nearest centroid
  assignClusters(data) {
    return data.map((point) => {
      let minDist = Number.POSITIVE_INFINITY
      let cluster = 0

      this.centroids.forEach((centroid, i) => {
        const dist = this.distance(point, centroid)
        if (dist < minDist) {
          minDist = dist
          cluster = i
        }
      })

      return { ...point, cluster }
    })
  }

  // Update centroids based on cluster assignments
  updateCentroids(data) {
    const newCentroids = []

    for (let i = 0; i < this.k; i++) {
      const clusterPoints = data.filter((p) => p.cluster === i)

      if (clusterPoints.length > 0) {
        newCentroids.push({
          literacy: clusterPoints.reduce((sum, p) => sum + p.literacy, 0) / clusterPoints.length,
          math: clusterPoints.reduce((sum, p) => sum + p.math, 0) / clusterPoints.length,
          score: clusterPoints.reduce((sum, p) => sum + p.score, 0) / clusterPoints.length,
          games: clusterPoints.reduce((sum, p) => sum + p.games, 0) / clusterPoints.length,
        })
      } else {
        newCentroids.push(this.centroids[i])
      }
    }

    return newCentroids
  }

  // Run K-means clustering
  cluster(maxIterations = 100) {
    if (this.students.length === 0) {
      return []
    }

    const data = this.prepareData()
    this.centroids = this.initializeCentroids(data)

    let iteration = 0
    let converged = false

    while (iteration < maxIterations && !converged) {
      const clusteredData = this.assignClusters(data)
      const newCentroids = this.updateCentroids(clusteredData)

      // Check for convergence
      converged = this.centroids.every((centroid, i) => {
        return this.distance(centroid, newCentroids[i]) < 0.001
      })

      this.centroids = newCentroids
      iteration++
    }

    // Final assignment
    const result = this.assignClusters(data)

    // Sort clusters by average performance (0 = low, 1 = medium, 2 = high)
    const clusterStats = this.calculateClusterStats(result)
    const sortedClusters = clusterStats
      .map((stat, index) => ({ index, avgPerformance: stat.avgPerformance }))
      .sort((a, b) => a.avgPerformance - b.avgPerformance)

    // Remap cluster indices
    const clusterMap = {}
    sortedClusters.forEach((cluster, newIndex) => {
      clusterMap[cluster.index] = newIndex
    })

    return result.map((point) => ({
      ...point,
      cluster: clusterMap[point.cluster],
    }))
  }

  // Calculate statistics for each cluster
  calculateClusterStats(data) {
    const stats = []

    for (let i = 0; i < this.k; i++) {
      const clusterPoints = data.filter((p) => p.cluster === i)

      if (clusterPoints.length > 0) {
        const avgLiteracy = clusterPoints.reduce((sum, p) => sum + p.literacy, 0) / clusterPoints.length
        const avgMath = clusterPoints.reduce((sum, p) => sum + p.math, 0) / clusterPoints.length
        const avgScore = clusterPoints.reduce((sum, p) => sum + p.score, 0) / clusterPoints.length
        const avgGames = clusterPoints.reduce((sum, p) => sum + p.games, 0) / clusterPoints.length

        stats.push({
          cluster: i,
          count: clusterPoints.length,
          avgLiteracy: avgLiteracy * 100,
          avgMath: avgMath * 100,
          avgScore: avgScore,
          avgGames: avgGames,
          avgPerformance: (avgLiteracy + avgMath) / 2,
        })
      }
    }

    return stats
  }
}

// Export for use in admin dashboard
if (typeof module !== "undefined" && module.exports) {
  module.exports = StudentClustering
}
