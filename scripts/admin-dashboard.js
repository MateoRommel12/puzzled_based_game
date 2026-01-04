// Admin Dashboard Logic - Backend Integration

// Always use absolute path from site root
const DASHBOARD_API_URL = "/ClusteringGame/api/admin-dashboard.php"

// Initialize admin info
document.addEventListener("DOMContentLoaded", () => {
  const admin = adminAuthManager.getCurrentAdmin()
  if (admin) {
    document.getElementById("adminUsername").textContent = admin.username || admin.name || "Admin"
  }

  loadDashboardData()
  setupTabNavigation()
  setupTableControls()
  loadCustomGames()
  loadClusteringStatus()
})

// Tab Navigation
function setupTabNavigation() {
  const tabs = document.querySelectorAll(".nav-tab")
  const contents = document.querySelectorAll(".tab-content")

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTab = tab.dataset.tab

      tabs.forEach((t) => t.classList.remove("active"))
      contents.forEach((c) => c.classList.remove("active"))

      tab.classList.add("active")
      document.getElementById(targetTab).classList.add("active")

      if (targetTab === "clustering") {
        loadClusteringData()
      } else if (targetTab === "students") {
        loadStudentsTable()
      } else if (targetTab === "leaderboard") {
        // Initialize leaderboard if not already done
        if (typeof leaderboardManager !== 'undefined' && !leaderboardManager.refreshInterval) {
          leaderboardManager.init()
        }
      } else if (targetTab === "student-management") {
        // Initialize student management if not already done
        if (typeof studentManager !== 'undefined') {
          studentManager.init()
        }
      }
    })
  })
}

// Load Dashboard Data
async function loadDashboardData() {
  try {
    const response = await fetch(`${DASHBOARD_API_URL}?action=overview`)
    const result = await response.json()

    if (result.success) {
  // Update overview stats
      document.getElementById("totalStudents").textContent = result.overview.totalStudents
      document.getElementById("totalGamesPlayed").textContent = result.overview.totalGames
      document.getElementById("averageScore").textContent = result.overview.averageScore
      document.getElementById("activeToday").textContent = result.overview.activeToday

  // Create charts
      createCustomGamesChart(result.customGames)
      createPerformanceChart(result.performanceDistribution)
    }
  } catch (error) {
    console.error("Error loading dashboard data:", error)
  }
}

// Load Students Table
async function loadStudentsTable(searchTerm = "", filterLevel = "all") {
  try {
    let url = `${DASHBOARD_API_URL}?action=students`
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`
    if (filterLevel !== "all") url += `&filter=${filterLevel}`

    const response = await fetch(url)
    const result = await response.json()

    if (result.success) {
  const tbody = document.getElementById("studentsTableBody")
  tbody.innerHTML = ""

      if (result.students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:20px;">No students found</td></tr>'
        return
      }

      result.students.forEach((student) => {
    const row = document.createElement("tr")

        const performanceClass =
          student.performance_level === "high"
            ? "high-perf"
            : student.performance_level === "medium"
            ? "medium-perf"
            : "low-perf"

    // Format time consumed (seconds to readable format)
    const totalSeconds = parseInt(student.total_time_consumed || 0)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    let timeFormatted = ''
    if (hours > 0) {
      timeFormatted = `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      timeFormatted = `${minutes}m ${seconds}s`
    } else {
      timeFormatted = `${seconds}s`
    }

    row.innerHTML = `
          <td>${escapeHtml(student.full_name)}</td>
          <td>${escapeHtml(student.email)}</td>
          <td>${student.total_score || 0}</td>
          <td>${student.games_played || 0}</td>
          <td>${Math.round(student.literacy_progress || 0)}%</td>
          <td>${Math.round(student.math_progress || 0)}%</td>
          <td>${student.total_hints_used || 0}</td>
          <td>${timeFormatted}</td>
          <td><span class="perf-badge ${performanceClass}">${
          student.performance_level || "low"
        }</span></td>
        `

    tbody.appendChild(row)
  })
}
  } catch (error) {
    console.error("Error loading students:", error)
  }
}


// Load Clustering Data
async function loadClusteringData() {
  try {
    const content = document.getElementById("clusteringContent")
    
    // Show loading state
    content.innerHTML = `
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
        <p>Please wait while we fetch the latest data</p>
      </div>
    `

    const response = await fetch(`${DASHBOARD_API_URL}?action=clustering`)
    const result = await response.json()

    if (result.success) {
      content.innerHTML = ""

      if (!result.clusters || result.clusters.length === 0) {
        content.innerHTML = `
          <div class="clustering-placeholder">
            <div class="placeholder-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3>No Clustering Data Available</h3>
          </div>
        `
        return
      }

      // Cluster emoji mapping
      const clusterEmojis = {
        'High Achievers': '🏆',
        'Average Performers': '📚',
        'Needs Support': '🎯'
      }

      // Display students in clusters - Table format (matching Students tab style)
      const studentsInClusters = document.createElement("div")
      studentsInClusters.className = "cluster-students"
      
      // Create table container matching Students tab structure
      const tableContainer = document.createElement("div")
      tableContainer.className = "table-container"
      
      const table = document.createElement("table")
      table.className = "students-table"
      
      // Table header
      const thead = document.createElement("thead")
      thead.innerHTML = `
        <tr>
          <th>Student Name</th>
          <th>Cluster</th>
          <th>Literacy Score</th>
          <th>Math Score</th>
          <th>Overall Score</th>
        </tr>
      `
      table.appendChild(thead)
      
      // Table body
      const tbody = document.createElement("tbody")
      
      // Sort students by cluster number, then by name
      const sortedStudents = [...result.students].sort((a, b) => {
        if (a.cluster_number !== b.cluster_number) {
          return a.cluster_number - b.cluster_number
        }
        return a.full_name.localeCompare(b.full_name)
      })
      
      sortedStudents.forEach((student) => {
        // Convert to numbers and calculate overall score
        const literacyScore = parseFloat(student.literacy_score) || 0;
        const mathScore = parseFloat(student.math_score) || 0;
        const overallScore = (literacyScore + mathScore) / 2;
        const emoji = clusterEmojis[student.cluster_label] || '📊'
        
        const row = document.createElement("tr")
        row.innerHTML = `
          <td>${escapeHtml(student.full_name)}</td>
          <td>
            <span class="cluster-badge">${emoji} ${escapeHtml(student.cluster_label)}</span>
          </td>
          <td>${Math.round(literacyScore)}%</td>
          <td>${Math.round(mathScore)}%</td>
          <td>${Math.round(overallScore)}%</td>
        `
        tbody.appendChild(row)
      })
      
      table.appendChild(tbody)
      tableContainer.appendChild(table)
      
      studentsInClusters.innerHTML = "<h3>📋 Student Distribution</h3>"
      studentsInClusters.appendChild(tableContainer)

      content.appendChild(studentsInClusters)
    }
  } catch (error) {
    console.error("Error loading clustering data:", error)
    const content = document.getElementById("clusteringContent")
    content.innerHTML = `
      <div class="clustering-placeholder">
        <div class="placeholder-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3>Error Loading Data</h3>
        <p>Please check your database connection and try again</p>
      </div>
    `
  }
}

// View Student Details
async function viewStudentDetails(userId) {
  try {
    const response = await fetch(`${DASHBOARD_API_URL}?action=student-details&userId=${userId}`)
    const result = await response.json()

    if (result.success) {
      alert(`
Student: ${result.student.full_name}
Email: ${result.student.email}
Total Score: ${result.student.total_score}
Games Played: ${result.student.games_played}
Literacy Progress: ${Math.round(result.student.literacy_progress)}%
Math Progress: ${Math.round(result.student.math_progress)}%
Performance Level: ${result.student.performance_level}
      `)
    }
  } catch (error) {
    console.error("Error loading student details:", error)
  }
}

// Setup Table Controls
function setupTableControls() {
  const searchInput = document.getElementById("searchStudent")
  const filterSelect = document.getElementById("filterPerformance")

  if (searchInput) {
    let searchTimeout
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        loadStudentsTable(e.target.value, filterSelect?.value || "all")
      }, 300)
    })
  }

  if (filterSelect) {
    filterSelect.addEventListener("change", (e) => {
      loadStudentsTable(searchInput?.value || "", e.target.value)
    })
  }
}

// Create Custom Games Chart
function createCustomGamesChart(data) {
  const container = document.getElementById("customGamesChart")
  if (!container) return

  container.innerHTML = ""

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: rgba(255, 255, 255, 0.7);">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🎮</div>
        <p style="margin: 0;">No custom games created yet</p>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">Create your first game in the Custom Games tab</p>
      </div>
    `
    return
  }

  // Display custom games in a list
  data.forEach((game) => {
    const gameCard = document.createElement("div")
    gameCard.style.cssText = `
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      transition: all 0.3s ease;
    `
    gameCard.onmouseenter = () => {
      gameCard.style.background = "rgba(255, 255, 255, 0.08)"
      gameCard.style.transform = "translateY(-2px)"
    }
    gameCard.onmouseleave = () => {
      gameCard.style.background = "rgba(255, 255, 255, 0.05)"
      gameCard.style.transform = "translateY(0)"
    }

    const typeBadge = game.game_type === 'literacy' 
      ? '<span style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Literacy</span>'
      : '<span style="background: rgba(139, 92, 246, 0.2); color: #8b5cf6; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Math</span>'

    const difficultyColors = {
      'easy': '#10b981',
      'medium': '#f59e0b',
      'hard': '#ef4444'
    }
    const difficultyColor = difficultyColors[game.difficulty] || '#999'

    gameCard.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="font-size: 2rem; line-height: 1;">${game.icon_emoji || '🎮'}</div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <h4 style="margin: 0; color: #fff; font-size: 1rem; font-weight: 600;">${escapeHtml(game.game_name)}</h4>
            ${typeBadge}
            <span style="background: rgba(255, 255, 255, 0.1); color: ${difficultyColor}; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize;">${game.difficulty}</span>
          </div>
          ${game.description ? `<p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.7); font-size: 0.85rem;">${escapeHtml(game.description)}</p>` : ''}
          <div style="display: flex; gap: 16px; color: rgba(255, 255, 255, 0.6); font-size: 0.8rem;">
            <span>📝 ${game.total_questions || 0} questions</span>
            <span>👥 ${game.play_count || 0} plays</span>
            <span>📅 ${new Date(game.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    `
    container.appendChild(gameCard)
  })
}

// Create Performance Distribution Chart
function createPerformanceChart(data) {
  const container = document.getElementById("performanceChart")
  if (!container || !data) return

  container.innerHTML = ""

  const labels = {
    low: "Needs Support",
    medium: "Average Performers",
    high: "High Achievers",
  }

  const colors = {
    low: "#EF4444",
    medium: "#F59E0B",
    high: "#10B981",
  }

  const total = data.reduce((sum, d) => sum + (d.count || 0), 0)

  data.forEach((perf) => {
    const percentage = total > 0 ? Math.round((perf.count / total) * 100) : 0

    const card = document.createElement("div")
    card.style.cssText = "margin: 10px 0; padding: 15px; background: #f9fafb; border-radius: 8px;"

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-weight: bold;">${labels[perf.performance_level] || perf.performance_level}</span>
        <span>${perf.count} students (${percentage}%)</span>
                </div>
      <div style="background: #e0e0e0; border-radius: 4px; overflow: hidden; height: 20px;">
        <div style="background: ${colors[perf.performance_level] || '#999'}; height: 100%; width: ${percentage}%;"></div>
            </div>
        `
    container.appendChild(card)
  })
}

// Utility: Escape HTML
function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// Load Custom Games
async function loadCustomGames() {
  try {
    const response = await fetch("../api/custom-games.php")
    const result = await response.json()

    const gamesList = document.getElementById("customGamesList")
    
    if (result.success && result.games && result.games.length > 0) {
      gamesList.innerHTML = ""
      
      result.games.forEach(game => {
        const gameCard = document.createElement("div")
        gameCard.className = "game-card-custom"
        
        const typeBadge = game.game_type === 'literacy' ? 'badge-literacy' : 'badge-math'
        const difficultyBadge = `badge-${game.difficulty}`
        
        gameCard.innerHTML = `
          <div class="game-card-header">
            <div class="game-icon-large">${game.icon_emoji || '🎮'}</div>
          </div>
          <h3 class="game-card-title">${escapeHtml(game.game_name)}</h3>
          <p class="game-card-description">${escapeHtml(game.description || 'No description')}</p>
          <div class="game-card-meta">
            <span class="game-badge ${typeBadge}">${game.game_type}</span>
            <span class="game-badge ${difficultyBadge}">${game.difficulty}</span>
            <span class="game-badge" style="background: rgba(255,255,255,0.1); color: #fff;">
              ${game.total_questions} questions
            </span>
          </div>
          <div class="game-card-stats">
            <span>👥 ${game.play_count || 0} plays</span>
            <span>📅 ${new Date(game.created_at).toLocaleDateString()}</span>
          </div>
          <div class="game-card-actions">
            <button class="btn-edit" onclick="editGame(${game.game_id})">
              Edit
            </button>
            <button class="btn-delete" onclick="deleteGame(${game.game_id}, '${escapeHtml(game.game_name)}')">
              Delete
            </button>
          </div>
        `
        
        gamesList.appendChild(gameCard)
      })
    } else {
      gamesList.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="8" width="18" height="12" rx="2" ry="2"></rect>
            <line x1="12" y1="8" x2="12" y2="21"></line>
            <line x1="3" y1="14" x2="21" y2="14"></line>
          </svg>
          <h3 style="color: #fff; margin-bottom: 0.5rem;">No Custom Games Yet</h3>
          <p style="margin-bottom: 1.5rem;">Create your first custom learning game!</p>
          <button class="create-game-btn" onclick="window.location.href='add-game.php'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Your First Game
          </button>
        </div>
      `
    }
  } catch (error) {
    console.error("Error loading custom games:", error)
    document.getElementById("customGamesList").innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <p style="color: #ef4444;">Failed to load games. Please try again.</p>
      </div>
    `
  }
}

// Edit Game
function editGame(gameId) {
  window.location.href = `add-game.php?edit=${gameId}`
}

// Delete Game
async function deleteGame(gameId, gameName) {
  const confirmed = await deleteModal(
    `Are you sure you want to delete "${gameName}"? This action cannot be undone and will permanently remove the game and all its questions.`,
    "Delete Game"
  );
  
  if (!confirmed) {
    return;
  }
  
  try {
    const response = await fetch(`../api/custom-games.php?gameId=${gameId}`, {
      method: 'DELETE'
    })
    
    const result = await response.json()
    
    if (result.success) {
      await successModal("Game deleted successfully!", "Success")
      loadCustomGames() // Reload the list
    } else {
      await errorModal("Error: " + result.message, "Delete Failed")
    }
  } catch (error) {
    console.error("Error deleting game:", error)
    await errorModal("Failed to delete game. Please try again.", "Network Error")
  }
}

// Clustering Functions
async function loadClusteringStatus() {
  try {
    const response = await fetch('../api/clustering.php?action=status')
    const result = await response.json()
    
    // Update status cards
    const lastClusteringTime = document.getElementById('lastClusteringTime')
    const newGamesCount = document.getElementById('newGamesCount')
    const autoClusteringStatus = document.getElementById('autoClusteringStatus')
    
    if (result.success) {
      // Service is online - show detailed information
      if (lastClusteringTime) {
        lastClusteringTime.textContent = result.last_clustering 
          ? new Date(result.last_clustering).toLocaleString() 
          : 'Never'
      }
      
      if (newGamesCount) {
        newGamesCount.textContent = result.new_games_since_last || 0
      }
      
      if (autoClusteringStatus) {
        if (result.should_run) {
          autoClusteringStatus.textContent = 'Will run soon'
          autoClusteringStatus.style.color = '#ff6b35'
        } else {
          autoClusteringStatus.textContent = 'Up to date'
          autoClusteringStatus.style.color = '#28a745'
        }
      }
    } else {
      // Service is offline or error
      if (lastClusteringTime) {
        lastClusteringTime.textContent = 'Service Offline'
      }
      
      if (newGamesCount) {
        newGamesCount.textContent = 'N/A'
      }
      
      if (autoClusteringStatus) {
        autoClusteringStatus.textContent = 'Service Unavailable'
        autoClusteringStatus.style.color = '#dc3545'
      }
    }
  } catch (error) {
    console.error('Error loading clustering status:', error)
    
    // Update UI to show error state
    const lastClusteringTime = document.getElementById('lastClusteringTime')
    const newGamesCount = document.getElementById('newGamesCount')
    const autoClusteringStatus = document.getElementById('autoClusteringStatus')
    
    if (lastClusteringTime) {
      lastClusteringTime.textContent = 'Error'
    }
    
    if (newGamesCount) {
      newGamesCount.textContent = 'N/A'
    }
    
    if (autoClusteringStatus) {
      autoClusteringStatus.textContent = 'Connection Error'
      autoClusteringStatus.style.color = '#dc3545'
    }
  }
}

// Export clustering data to Excel
async function exportClusteringToExcel(event) {
  const exportBtn = event ? event.target.closest('.export-excel-btn') : document.querySelector('.export-excel-btn');
  const originalText = exportBtn ? exportBtn.innerHTML : '';
  
  try {
    // Show loading indicator
    if (exportBtn) {
      exportBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg> Exporting...';
      exportBtn.disabled = true;
    }
    
    // Fetch the file as blob
    const exportUrl = '/ClusteringGame/api/export-clustering.php';
    const response = await fetch(exportUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get the blob data
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'clustering_report.xls';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    window.URL.revokeObjectURL(url);
    
    // Show success message
    if (typeof successModal === 'function') {
      successModal('Excel file downloaded successfully!', 'Export Complete');
    } else {
      alert('Excel file downloaded successfully!');
    }
  } catch (error) {
    console.error('Export error:', error);
    if (typeof errorModal === 'function') {
      errorModal('Failed to export Excel file: ' + error.message, 'Export Failed');
    } else {
      alert('Failed to export Excel file: ' + error.message);
    }
  } finally {
    // Restore button
    if (exportBtn) {
      exportBtn.innerHTML = originalText;
      exportBtn.disabled = false;
    }
  }
}

async function runManualClustering(category = 'all') {
  // Find the button that was clicked
  const buttons = document.querySelectorAll('.run-clustering-btn')
  let button = null
  
  if (category === 'literacy') {
    button = document.querySelector('.literacy-clustering-btn')
  } else if (category === 'math') {
    button = document.querySelector('.math-clustering-btn')
  } else {
    button = document.querySelector('.run-clustering-btn')
  }
  
  if (!button) return
  
  const originalText = button.innerHTML
  const categoryLabel = category === 'literacy' ? 'Literacy' : category === 'math' ? 'Math' : 'Overall'
  
  try {
    // Show loading state
    button.disabled = true
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 6v6l4 2"></path>
      </svg>
      Running ${categoryLabel} Clustering...
    `
    
    const response = await fetch(`../api/clustering.php?action=run&category=${category}`)
    const result = await response.json()
    
    if (result.success) {
      if (result.skipped) {
        await errorModal('Clustering was skipped: ' + result.message, 'Clustering Skipped')
      } else {
        await successModal(`${categoryLabel} clustering completed successfully! The student performance analysis has been updated.`, 'Clustering Complete')
        loadClusteringData() // Refresh clustering results
      }
      loadClusteringStatus() // Refresh status
    } else {
      await errorModal('Error: ' + result.message, 'Clustering Failed')
    }
  } catch (error) {
    console.error('Error running clustering:', error)
    await errorModal('Failed to run clustering. Please try again.', 'Network Error')
  } finally {
    // Restore button
    button.disabled = false
    button.innerHTML = originalText
  }
}

// Add CSS for spinning animation
const style = document.createElement('style')
style.textContent = `
  .spinning {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .clustering-controls {
    display: flex;
    gap: 10px;
  }
  
  .run-clustering-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
  }
  
  .run-clustering-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  .run-clustering-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .clustering-status {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 20px 0;
  }
  
  .status-card {
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .status-icon {
    font-size: 24px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border-radius: 8px;
  }
  
  .status-info {
    flex: 1;
  }
  
  .status-label {
    font-size: 12px;
    color: #6c757d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  
  .status-value {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
  }
`
document.head.appendChild(style)
