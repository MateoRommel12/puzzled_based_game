// Results and Analytics Page Logic - Backend Integration

async function loadResults() {
  // Show loading state
  showLoading(true)

  const data = await window.gameDataManager.getData()

  // Update overall stats
  document.getElementById("totalScore").textContent = data.totalScore
  document.getElementById("gamesPlayed").textContent = data.gamesPlayed
  document.getElementById("literacyProgress").textContent = `${Math.round(
    data.literacyProgress
  )}%`
  document.getElementById("mathProgress").textContent = `${Math.round(data.mathProgress)}%`

  // Update performance level
  updatePerformanceLevel(data.performanceLevel || 'low')

  showLoading(false)
}

function updatePerformanceLevel(level) {
  const performanceLevelEl = document.getElementById("performanceLevel")
  const performanceLabelEl = document.getElementById("performanceLabel")
  const badgeIconEl = document.getElementById("badgeIcon")
  const performanceDescEl = document.getElementById("performanceDescription")
  const progressFillEl = document.getElementById("performanceProgressFill")
  
  if (performanceLevelEl && performanceLabelEl) {
    // Remove existing performance level classes
    performanceLevelEl.className = "performance-badge " + level
    
    // Set the label and icon
    const levelData = {
      'high': {
        label: 'High Achiever',
        icon: '🏆',
        description: 'Excellent work! You\'re performing at a high level. Keep up the great progress!'
      },
      'medium': {
        label: 'Average Performer',
        icon: '📚',
        description: 'You\'re doing well! Continue practicing to reach the next level.'
      },
      'low': {
        label: 'Needs Support',
        icon: '🎯',
        description: 'Keep practicing to improve your skills! Every game helps you learn and grow.'
      }
    }
    
    const data = levelData[level] || levelData['low']
    
    if (badgeIconEl) {
      badgeIconEl.textContent = data.icon
    }
    
    if (performanceLabelEl) {
      performanceLabelEl.textContent = data.label
    }
    
    if (performanceDescEl) {
      performanceDescEl.textContent = data.description
    }
    
    // Update progress bar
    if (progressFillEl) {
      progressFillEl.className = "progress-fill " + level
    }
  }
}


function showLoading(show) {
  const loadingElements = document.querySelectorAll(".stat-value")
  loadingElements.forEach((el) => {
    if (show) {
      el.textContent = "..."
      el.style.opacity = "0.5"
    } else {
      el.style.opacity = "1"
    }
  })
}

async function resetAllData() {
  if (
    confirm(
      "Are you sure you want to reset all your progress? This action requires contacting an administrator to reset your database records."
    )
  ) {
    alert(
      "Please contact your administrator to reset your account data. This action cannot be done from the student interface for security reasons."
    )
  }
}

// Load results when page loads
document.addEventListener("DOMContentLoaded", () => {
  loadResults()
})
