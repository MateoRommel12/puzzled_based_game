/**
 * Clustering Management JavaScript
 * Handles clustering operations in admin dashboard
 */

class ClusteringManager {
    constructor() {
        this.serviceUrl = 'https://matts.pythonanywhere.com';
        this.apiUrl = 'api/clustering.php';
    }

    /**
     * Run clustering analysis
     */
    async runClustering() {
        const button = document.getElementById('runClusteringBtn');
        const statusDiv = document.getElementById('clusteringStatus');
        
        if (button) {
            button.disabled = true;
            button.textContent = 'Running Clustering...';
        }
        
        if (statusDiv) {
            statusDiv.innerHTML = '<div class="alert alert-info">Running clustering analysis...</div>';
        }

        try {
            const response = await fetch(`${this.apiUrl}?action=run`);
            const data = await response.json();

            if (data.success) {
                this.showSuccessMessage('Clustering completed successfully!', data.report);
                this.updateClusteringReport(data.report);
            } else {
                this.showErrorMessage('Clustering failed: ' + data.message);
            }
        } catch (error) {
            console.error('Clustering error:', error);
            this.showErrorMessage('Failed to run clustering: ' + error.message);
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = 'Run Student Clustering';
            }
        }
    }

    /**
     * Check clustering service status
     */
    async checkStatus() {
        try {
            const response = await fetch(`${this.apiUrl}?action=status`);
            const data = await response.json();

            const statusDiv = document.getElementById('clusteringStatus');
            if (statusDiv) {
                if (data.success) {
                    statusDiv.innerHTML = `
                        <div class="alert alert-success">
                            <strong>Service Status:</strong> ${data.service_status}<br>
                            <strong>Service URL:</strong> ${data.service_url}
                        </div>
                    `;
                } else {
                    statusDiv.innerHTML = `
                        <div class="alert alert-warning">
                            <strong>Service Status:</strong> ${data.message}
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error('Status check error:', error);
            const statusDiv = document.getElementById('clusteringStatus');
            if (statusDiv) {
                statusDiv.innerHTML = `
                    <div class="alert alert-danger">
                        <strong>Service Status:</strong> Unable to connect to clustering service
                    </div>
                `;
            }
        }
    }

    /**
     * Show success message
     */
    showSuccessMessage(message, report = null) {
        const statusDiv = document.getElementById('clusteringStatus');
        if (statusDiv) {
            let html = `<div class="alert alert-success"><strong>Success:</strong> ${message}</div>`;
            
            if (report) {
                html += `
                    <div class="alert alert-info">
                        <h5>Clustering Report</h5>
                        <p><strong>Analysis Date:</strong> ${report.analysis_date}</p>
                        <p><strong>Total Students:</strong> ${report.total_students}</p>
                        <p><strong>Number of Clusters:</strong> ${report.number_of_clusters}</p>
                        <div class="mt-3">
                            <h6>Cluster Details:</h6>
                            ${report.clusters.map(cluster => `
                                <div class="border p-2 mb-2">
                                    <strong>${cluster.label}</strong><br>
                                    Students: ${cluster.student_count} (${cluster.percentage}%)<br>
                                    Avg Performance: ${cluster.average_performance}%<br>
                                    Literacy Avg: ${cluster.literacy_average}%<br>
                                    Math Avg: ${cluster.math_average}%
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            
            statusDiv.innerHTML = html;
        }
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        const statusDiv = document.getElementById('clusteringStatus');
        if (statusDiv) {
            statusDiv.innerHTML = `<div class="alert alert-danger"><strong>Error:</strong> ${message}</div>`;
        }
    }

    /**
     * Update clustering report in the UI
     */
    updateClusteringReport(report) {
        // Update any existing clustering report display
        const reportContainer = document.getElementById('clusteringReport');
        if (reportContainer) {
            reportContainer.innerHTML = this.generateReportHTML(report);
        }
    }

    /**
     * Generate HTML for clustering report
     */
    generateReportHTML(report) {
        return `
            <div class="card">
                <div class="card-header">
                    <h5>Latest Clustering Report</h5>
                    <small class="text-muted">${report.analysis_date}</small>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <div class="text-center">
                                <h3 class="text-primary">${report.total_students}</h3>
                                <small>Total Students</small>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="text-center">
                                <h3 class="text-success">${report.number_of_clusters}</h3>
                                <small>Clusters Created</small>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="text-center">
                                <h3 class="text-info">${report.clusters.length}</h3>
                                <small>Active Clusters</small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        ${report.clusters.map(cluster => `
                            <div class="col-md-4 mb-3">
                                <div class="card border-${this.getClusterColor(cluster.cluster_number)}">
                                    <div class="card-body">
                                        <h6 class="card-title">${cluster.label}</h6>
                                        <p class="card-text">
                                            <strong>Students:</strong> ${cluster.student_count} (${cluster.percentage}%)<br>
                                            <strong>Performance:</strong> ${cluster.average_performance}%<br>
                                            <strong>Literacy:</strong> ${cluster.literacy_average}%<br>
                                            <strong>Math:</strong> ${cluster.math_average}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get color class for cluster
     */
    getClusterColor(clusterNumber) {
        const colors = ['primary', 'success', 'warning', 'info', 'secondary'];
        return colors[clusterNumber % colors.length];
    }

    /**
     * Initialize clustering interface
     */
    init() {
        // Check status on page load
        this.checkStatus();
        
        // Set up event listeners
        const runButton = document.getElementById('runClusteringBtn');
        if (runButton) {
            runButton.addEventListener('click', () => this.runClustering());
        }
        
        const statusButton = document.getElementById('checkStatusBtn');
        if (statusButton) {
            statusButton.addEventListener('click', () => this.checkStatus());
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.clusteringManager = new ClusteringManager();
    window.clusteringManager.init();
});

// Global functions for backward compatibility
function runClustering() {
    if (window.clusteringManager) {
        window.clusteringManager.runClustering();
    }
}

function checkClusteringStatus() {
    if (window.clusteringManager) {
        window.clusteringManager.checkStatus();
    }
}
