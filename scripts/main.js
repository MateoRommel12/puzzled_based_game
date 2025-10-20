// Game Data Management - Backend Integration
class GameDataManager {
  constructor() {
    // Get base path for API - works from any directory
    const path = window.location.pathname
    const isInGamesFolder = path.includes('/games/')
    this.apiUrl = isInGamesFolder ? "../api/game-session.php" : "api/game-session.php"
    this.cachedData = null
  }

  async getData() {
    // Return cached data if available
    if (this.cachedData) {
      return this.cachedData
    }

    try {
      const fullUrl = `${this.apiUrl}?action=get-stats`
      const response = await fetch(fullUrl)
      const result = await response.json()

      if (result.success) {
        // Transform backend data to match frontend structure
        const progress = result.progress || {}
        const gameStats = result.gameStats || []
        
        const data = {
          gamesPlayed: progress.games_played || 0,
          totalScore: progress.total_score || 0,
          literacyProgress: progress.literacy_progress || 0,
          mathProgress: progress.math_progress || 0,
          games: {
            "word-scramble": this.getGameData(gameStats, "word_scramble"),
            "reading-comprehension": this.getGameData(gameStats, "reading_comprehension"),
            "number-puzzle": this.getGameData(gameStats, "number_puzzle"),
            "math-challenge": this.getGameData(gameStats, "math_challenge"),
            "budget-manager": this.getGameData(gameStats, "budget_manager"),
            "shopping-list": this.getGameData(gameStats, "shopping_list"),
            "message-composer": this.getGameData(gameStats, "message_composer"),
            "recipe-calculator": this.getGameData(gameStats, "recipe_calculator"),
            "fill-blanks": this.getGameData(gameStats, "fill_blanks"),
          },
        }
        
        this.cachedData = data
        return data
      }
    } catch (error) {
      console.error("Error fetching game data:", error)
    }

    // Return default data if fetch fails
    return {
      gamesPlayed: 0,
      totalScore: 0,
      games: {
        "word-scramble": { plays: 0, bestScore: 0, totalScore: 0 },
        "reading-comprehension": { plays: 0, bestScore: 0, totalScore: 0 },
        "number-puzzle": { plays: 0, bestScore: 0, totalScore: 0 },
        "math-challenge": { plays: 0, bestScore: 0, totalScore: 0 },
        "budget-manager": { plays: 0, bestScore: 0, totalScore: 0 },
        "shopping-list": { plays: 0, bestScore: 0, totalScore: 0 },
        "message-composer": { plays: 0, bestScore: 0, totalScore: 0 },
        "recipe-calculator": { plays: 0, bestScore: 0, totalScore: 0 },
      },
      literacyProgress: 0,
      mathProgress: 0,
    }
  }

  getGameData(gameStats, gameType) {
    const stat = gameStats.find((s) => s.game_type === gameType)
    return stat
      ? {
          plays: stat.total_plays || 0,
          bestScore: stat.best_score || 0,
          totalScore: stat.total_score || 0,
        }
      : { plays: 0, bestScore: 0, totalScore: 0 }
  }

  async saveGameSession(gameData) {
    try {
      const response = await fetch(`${this.apiUrl}?action=save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gameData),
      })

      const result = await response.json()
      
      if (result.success) {
        // Clear cache to force refresh on next getData call
        this.cachedData = null
        return result
      } else {
        console.error("Error saving game session:", result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error("Network error saving game session:", error)
      return { success: false, message: "Network error" }
    }
  }

  clearCache() {
    this.cachedData = null
  }
}

// Initialize Game Data Manager
const gameDataManager = new GameDataManager()

// Custom Games Manager
async function loadCustomGames() {
  try {
    // Only load custom games if we're on the dashboard
    const literacyGrid = document.getElementById('literacyGamesGrid')
    const mathGrid = document.getElementById('mathGamesGrid')
    
    if (!literacyGrid || !mathGrid) {
      return // Skip if not on dashboard
    }
    
    // Get correct path for API
    const path = window.location.pathname
    const isInGamesFolder = path.includes('/games/')
    const apiPath = isInGamesFolder ? '../api/custom-games.php' : 'api/custom-games.php'
    
    const response = await fetch(apiPath)
    const result = await response.json()
    
    if (result.success && result.games && result.games.length > 0) {
      
      // Separate games by type
      const literacyGames = result.games.filter(game => game.game_type === 'literacy')
      const mathGames = result.games.filter(game => game.game_type === 'math')
      
      // Add literacy games
      literacyGames.forEach(game => {
        const gameCard = createCustomGameCard(game)
        literacyGrid.appendChild(gameCard)
      })
      
      // Add math games
      mathGames.forEach(game => {
        const gameCard = createCustomGameCard(game)
        mathGrid.appendChild(gameCard)
      })
      
      // Update badges to show total count
      const literacyCount = 2 + literacyGames.length // 2 default + custom
      const mathCount = 2 + mathGames.length // 2 default + custom
      
      document.getElementById('literacyGamesCount').textContent = `${literacyCount} Game${literacyCount !== 1 ? 's' : ''}`
      document.getElementById('mathGamesCount').textContent = `${mathCount} Game${mathCount !== 1 ? 's' : ''}`
    }
  } catch (error) {
    console.error('Error loading custom games:', error)
  }
}

function createCustomGameCard(game) {
  const card = document.createElement('div')
  card.className = 'game-card'
  card.dataset.game = `custom-${game.game_id}`
  
  const iconClass = game.game_type === 'literacy' ? 'literacy' : 'math'
  const iconEmoji = game.icon_emoji || '🎮'
  
  // Get difficulty badge color
  const difficultyColors = {
    easy: 'background: rgba(16, 185, 129, 0.2); color: #10b981;',
    medium: 'background: rgba(245, 158, 11, 0.2); color: #fbbf24;',
    hard: 'background: rgba(239, 68, 68, 0.2); color: #ef4444;'
  }
  const difficultyStyle = difficultyColors[game.difficulty] || difficultyColors.medium
  
  card.innerHTML = `
    <div class="game-icon ${iconClass}">
      <div style="font-size: 48px;">${iconEmoji}</div>
    </div>
    <div class="game-content">
      <h4 class="game-title">${escapeHtml(game.game_name)}</h4>
      <p class="game-description">${escapeHtml(game.description || 'No description')}</p>
      <div class="game-stats">
        <span class="plays">${game.play_count || 0} plays</span>
      </div>
    </div>
    <button class="play-button" onclick="playCustomGame(${game.game_id})">
      <span>Play Now</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    </button>
  `
  
  return card
}

function playCustomGame(gameId) {
  window.location.href = `custom-game-player.php?game=${gameId}`
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function updateUserDisplay() {
  const currentUser = window.authManager?.getCurrentUser()
  if (currentUser) {
    const userNameElement = document.getElementById("userName")
    if (userNameElement) {
      userNameElement.textContent = currentUser.name || currentUser.fullName
    }
  }
}

// Update UI with current data
async function updateDashboard() {
  // Only run dashboard updates if we're on the dashboard page
  const isDashboard = document.getElementById("gamesPlayed") || document.querySelector(".game-card")
  
  if (!isDashboard) {
    return // Skip dashboard updates on game pages
  }
  
  const data = await gameDataManager.getData()

  updateUserDisplay()

  // Update header stats
  const gamesPlayedEl = document.getElementById("gamesPlayed")
  const totalScoreEl = document.getElementById("totalScore")
  
  if (gamesPlayedEl) gamesPlayedEl.textContent = data.gamesPlayed
  if (totalScoreEl) totalScoreEl.textContent = data.totalScore

  // Update game play counts
  document.querySelectorAll(".game-card").forEach((card) => {
    const gameName = card.dataset.game
    const playsElement = card.querySelector(".plays")
    if (playsElement && data.games[gameName]) {
      playsElement.textContent = `${data.games[gameName].plays} plays`
    }
  })

  // Update progress bars
  updateProgressBar("literacyProgress", data.literacyProgress)
  updateProgressBar("mathProgress", data.mathProgress)
  
  // Load custom games
  await loadCustomGames()
}

function updateProgressBar(elementId, percentage) {
  const progressFill = document.getElementById(elementId)
  if (!progressFill) return
  
  const progressCard = progressFill.closest(".progress-card")
  const progressText = progressCard?.querySelector(".progress-text")

  progressFill.style.width = `${percentage}%`
  if (progressText) {
    progressText.textContent = `${Math.round(percentage)}% Complete`
  }
}

// Navigation function
function navigateToGame(gameFile) {
  // Add animation before navigation
  const card = event?.target.closest(".game-card")
  if (card) {
    card.style.transform = "scale(0.95)"
  }

  setTimeout(() => {
    window.location.href = gameFile
  }, 200)
}

// Add hover effects to game cards
document.addEventListener("DOMContentLoaded", () => {
  updateDashboard()

  // Add entrance animations
  const cards = document.querySelectorAll(".game-card")
  cards.forEach((card, index) => {
    card.style.opacity = "0"
    card.style.transform = "translateY(20px)"

    setTimeout(() => {
      card.style.transition = "all 0.5s ease"
      card.style.opacity = "1"
      card.style.transform = "translateY(0)"
    }, index * 100)
  })

  // Add particle effect on hover (optional enhancement)
  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.boxShadow = "0 8px 32px rgba(59, 130, 246, 0.3)"
    })

    card.addEventListener("mouseleave", function () {
      this.style.boxShadow = ""
    })
  })
})

// Utility function to save game results
async function saveGameResult(gameName, gameData) {
  // Convert game name format
  const gameTypeMap = {
    "word-scramble": "word_scramble",
    "reading-comprehension": "reading_comprehension",
    "number-puzzle": "number_puzzle",
    "math-challenge": "math_challenge",
    "budget-manager": "budget_manager",
    "shopping-list": "shopping_list",
    "message-composer": "message_composer",
    "recipe-calculator": "recipe_calculator",
    "fill-blanks": "fill_blanks",
  }

  const sessionData = {
    gameType: gameTypeMap[gameName] || gameName, // Use mapping if available, otherwise use the gameName directly
    score: gameData.score || 0,
    difficulty: gameData.difficulty || "medium",
    timeTaken: gameData.timeTaken || null,
    questionsAnswered: gameData.questionsAnswered || 0,
    correctAnswers: gameData.correctAnswers || 0,
    accuracy: gameData.accuracy || 0,
    streakCount: gameData.streakCount || 0,
    hintsUsed: gameData.hintsUsed || 0,
    sessionData: gameData.extra || null,
  }

  const result = await gameDataManager.saveGameSession(sessionData)
  
  if (result.success) {
    // Game session saved successfully
  } else {
    console.error("Failed to save game session:", result.message)
  }
  
  return result
}

async function handleLogout() {
  try {
    const confirmed = await confirmModal(
      "Are you sure you want to logout? You'll need to login again to continue your learning journey.",
      "Logout Confirmation"
    );
    
    if (confirmed) {
      try {
        await window.authManager.logout()
        // The logout function will handle the redirect automatically
      } catch (error) {
        console.error("Logout error:", error)
        // Fallback redirect if logout fails
        window.location.href = "login.php"
      }
    }
  } catch (error) {
    console.error("handleLogout error:", error)
  }
}

// Export for use in game pages
if (typeof window !== "undefined") {
  window.gameDataManager = gameDataManager
  window.saveGameResult = saveGameResult
  window.handleLogout = handleLogout
}
