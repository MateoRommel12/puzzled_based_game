// Results and Analytics Page Logic - Backend Integration

const achievements = [
  {
    id: "first_game",
    name: "Getting Started",
    description: "Play your first game",
    icon: "🎮",
    condition: (data) => data.gamesPlayed >= 1,
  },
  {
    id: "five_games",
    name: "Dedicated Learner",
    description: "Play 5 games",
    icon: "📚",
    condition: (data) => data.gamesPlayed >= 5,
  },
  {
    id: "ten_games",
    name: "Game Master",
    description: "Play 10 games",
    icon: "🏆",
    condition: (data) => data.gamesPlayed >= 10,
  },
  {
    id: "score_100",
    name: "Century Club",
    description: "Score 100+ points total",
    icon: "💯",
    condition: (data) => data.totalScore >= 100,
  },
  {
    id: "score_500",
    name: "High Achiever",
    description: "Score 500+ points total",
    icon: "⭐",
    condition: (data) => data.totalScore >= 500,
  },
  {
    id: "literacy_master",
    name: "Word Wizard",
    description: "Complete 50% literacy progress",
    icon: "📖",
    condition: (data) => data.literacyProgress >= 50,
  },
  {
    id: "math_master",
    name: "Math Genius",
    description: "Complete 50% math progress",
    icon: "🔢",
    condition: (data) => data.mathProgress >= 50,
  },
  {
    id: "all_games",
    name: "Well Rounded",
    description: "Play all 4 games",
    icon: "🌟",
    condition: (data) => {
      return (
        data.games["word-scramble"].plays > 0 &&
        data.games["reading-comprehension"].plays > 0 &&
        data.games["number-puzzle"].plays > 0 &&
        data.games["math-challenge"].plays > 0
      )
    },
  },
  {
    id: "perfect_literacy",
    name: "Literacy Champion",
    description: "Complete 100% literacy progress",
    icon: "👑",
    condition: (data) => data.literacyProgress >= 100,
  },
  {
    id: "perfect_math",
    name: "Math Champion",
    description: "Complete 100% math progress",
    icon: "🎯",
    condition: (data) => data.mathProgress >= 100,
  },
]

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

  // Update game performance
  updateGamePerformance("word-scramble", "wordScramble", data)
  updateGamePerformance("reading-comprehension", "reading", data)
  updateGamePerformance("number-puzzle", "numberPuzzle", data)
  updateGamePerformance("math-challenge", "mathChallenge", data)

  // Load achievements
  loadAchievements(data)

  showLoading(false)
}

function updateGamePerformance(gameKey, elementPrefix, data) {
  const gameData = data.games[gameKey]

  const playsEl = document.getElementById(`${elementPrefix}Plays`)
  const bestEl = document.getElementById(`${elementPrefix}Best`)
  const totalEl = document.getElementById(`${elementPrefix}Total`)

  if (playsEl) playsEl.textContent = gameData.plays
  if (bestEl) bestEl.textContent = gameData.bestScore
  if (totalEl) totalEl.textContent = gameData.totalScore
}

function loadAchievements(data) {
  const achievementsGrid = document.getElementById("achievementsGrid")
  if (!achievementsGrid) return

  achievementsGrid.innerHTML = ""

  achievements.forEach((achievement) => {
    const isUnlocked = achievement.condition(data)

    const card = document.createElement("div")
    card.className = `achievement-card ${isUnlocked ? "unlocked" : "locked"}`

    card.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.description}</div>
        `

    achievementsGrid.appendChild(card)
  })
}

function showLoading(show) {
  const loadingElements = document.querySelectorAll(".stat-value, .perf-value")
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
