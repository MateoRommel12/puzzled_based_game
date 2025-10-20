// Custom Game Player
let gameData = null
let currentQuestionIndex = 0
let score = 0
let correctAnswers = 0
let startTime = null
let timerInterval = null
let elapsedSeconds = 0
let timeLimit = 0

// Get game ID from URL
const urlParams = new URLSearchParams(window.location.search)
const gameId = urlParams.get('game')

if (!gameId) {
  alert('No game specified!')
  window.location.href = 'index.php'
}

// Load game data
async function loadGameData() {
  try {
    const response = await fetch(`/ClusteringGame/api/custom-games.php?gameId=${gameId}&includeQuestions=1`)
    
    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.success && result.game) {
      gameData = result.game
      
      // Check if game has questions
      if (!gameData.questions || gameData.questions.length === 0) {
        alert('This game has no questions yet! Please ask an admin to add questions.')
        window.location.href = 'index.php'
        return
      }
      
      displayInstructions()
    } else {
      const errorMsg = result.message || 'Game not found'
      console.error('Game load failed:', errorMsg)
      alert(`Game not found: ${errorMsg}`)
      window.location.href = 'index.php'
    }
  } catch (error) {
    console.error('Error loading game:', error)
    alert(`Failed to load game: ${error.message}\n\nCheck browser console for details.`)
    window.location.href = 'index.php'
  }
}

// Display instructions
function displayInstructions() {
  try {
    // Update header
    document.getElementById('gameHeaderIcon').textContent = gameData.icon_emoji || '🎮'
    document.getElementById('gameHeaderName').textContent = gameData.game_name
    document.getElementById('headerTotal').textContent = gameData.questions.length
    
    // Update instructions card
    document.getElementById('instructionsIcon').textContent = gameData.icon_emoji || '🎮'
    document.getElementById('instructionsTitle').textContent = 'How to Play'
    
    // Create instructions list
    const instructions = gameData.description || 'Answer the questions correctly to earn points!'
    const instructionsList = document.getElementById('instructionsList')
    instructionsList.innerHTML = `
      <li>${instructions}</li>
      <li>Read each question carefully</li>
      <li>Select the correct answer</li>
      <li>Earn points for each correct answer</li>
      <li>Complete all questions to finish!</li>
    `
    
    // Update game info
    document.getElementById('infoQuestions').textContent = gameData.questions.length
    document.getElementById('infoTimeLimit').textContent = gameData.time_limit ? `${gameData.time_limit}s` : 'No limit'
    document.getElementById('infoDifficulty').textContent = gameData.difficulty
  } catch (error) {
    console.error('Error displaying instructions:', error)
    alert(`Error displaying game: ${error.message}`)
  }
}

// Start the game
function startCustomGame() {
  document.getElementById('instructionsCard').style.display = 'none'
  document.getElementById('gamePlayArea').style.display = 'block'
  
  document.getElementById('totalQuestionsNum').textContent = gameData.questions.length
  document.getElementById('progressText').textContent = `0/${gameData.questions.length}`
  
  startTime = Date.now()
  
  
  startTimer()
  loadQuestion()
}

// Start ascending timer (counts up) - Universal timer for all games
function startTimer() {
  // Get timer elements
  const timerElement = document.getElementById('timer')
  const timerDisplay = document.getElementById('timerDisplay')
  const headerTime = document.getElementById('headerTime')
  
  // Show timer display if it exists
  if (timerDisplay) {
    timerDisplay.style.display = 'flex'
  }
  
  // Clear any existing timer
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  
  // Initialize elapsed time
  elapsedSeconds = 0
  
  // Update timer display immediately
  updateTimerDisplay()
  
  // Start counting up
  timerInterval = setInterval(() => {
    elapsedSeconds++
    updateTimerDisplay()
    
    // Check if there's a time limit
    if (gameData.time_limit && gameData.time_limit > 0) {
      const timeRemaining = gameData.time_limit - elapsedSeconds
      
      // Check if time is running out (last 10 seconds)
      if (timeRemaining <= 10 && timeRemaining > 0) {
        if (timerElement) {
          timerElement.style.fontWeight = '700'
        }
        if (headerTime) {
          headerTime.style.fontWeight = '700'
        }
        if (timerDisplay) {
          timerDisplay.style.animation = 'pulse 0.5s ease-in-out infinite'
        }
      }
      
      // Time's up!
      if (elapsedSeconds >= gameData.time_limit) {
        clearInterval(timerInterval)
        handleTimeUp()
      }
    }
  }, 1000)
}

// Update timer display (shows elapsed time) - Works everywhere
function updateTimerDisplay() {
  const timerElement = document.getElementById('timer')
  const headerTime = document.getElementById('headerTime')
  
  const minutes = Math.floor(elapsedSeconds / 60)
  const seconds = elapsedSeconds % 60
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`
  
  // Update timer in game area
  if (timerElement) {
    timerElement.textContent = timeString
  }
  
  // Update timer in header
  if (headerTime) {
    headerTime.textContent = timeString
  }
}

// Handle time up
function handleTimeUp() {
  alert('⏰ Time\'s up! The game will end now.')
  endGame()
}




// Load current question
function loadQuestion() {
  if (currentQuestionIndex >= gameData.questions.length) {
    endGame()
    return
  }
  
  const question = gameData.questions[currentQuestionIndex]
  
  // Update question number
  document.getElementById('currentQuestionNum').textContent = currentQuestionIndex + 1
  document.getElementById('headerCurrent').textContent = currentQuestionIndex + 1
  document.getElementById('questionText').textContent = question.question_text
  
  // Update progress
  document.getElementById('progressText').textContent = `${currentQuestionIndex}/${gameData.questions.length}`
  const progressPercent = (currentQuestionIndex / gameData.questions.length) * 100
  document.getElementById('progressFill').style.width = `${progressPercent}%`
  
  const answersContainer = document.getElementById('answersContainer')
  answersContainer.innerHTML = ''
  
  // Get options - handle different question types
  let options = []
  if (question.question_type === 'multiple_choice') {
    options = [
      question.option_a,
      question.option_b,
      question.option_c,
      question.option_d
    ].filter(opt => opt !== null && opt !== '')
  } else if (question.question_type === 'true_false') {
    options = ['True', 'False']
  } else if (question.question_type === 'fill_blanks') {
    // For fill-blanks, we'll create a different UI
    displayFillBlanksQuestion(question)
    return
  }
  
  // Create answer buttons
  options.forEach((option, index) => {
    const button = document.createElement('button')
    button.className = 'option-button'
    button.style.cssText = `
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #e0e0e0;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
    `
    button.textContent = option
    button.onclick = () => selectAnswer(option, question.correct_answer)
    
    button.onmouseover = () => {
      if (!button.disabled) {
        button.style.background = 'rgba(96, 165, 250, 0.2)'
        button.style.borderColor = 'rgba(96, 165, 250, 0.5)'
      }
    }
    button.onmouseout = () => {
      if (!button.disabled && !button.classList.contains('correct') && !button.classList.contains('incorrect')) {
        button.style.background = 'rgba(255, 255, 255, 0.05)'
        button.style.borderColor = 'rgba(255, 255, 255, 0.1)'
      }
    }
    
    answersContainer.appendChild(button)
  })
  
  // Hide feedback
  document.getElementById('feedbackMessage').style.display = 'none'
}

// Select an answer
function selectAnswer(selectedAnswer, correctAnswer) {
  const buttons = document.querySelectorAll('.option-button')
  const feedbackMessage = document.getElementById('feedbackMessage')
  
  // Disable all buttons
  buttons.forEach(btn => btn.disabled = true)
  
  // Normalize answers for comparison (trim whitespace and convert to lowercase)
  const normalizedSelected = selectedAnswer.toString().trim().toLowerCase()
  const normalizedCorrect = correctAnswer.toString().trim().toLowerCase()
  
  
  const isCorrect = normalizedSelected === normalizedCorrect
  
  buttons.forEach(btn => {
    const normalizedButtonText = btn.textContent.toString().trim().toLowerCase()
    
    if (normalizedButtonText === normalizedCorrect) {
      btn.style.background = 'rgba(16, 185, 129, 0.3)'
      btn.style.borderColor = '#10b981'
      btn.classList.add('correct')
    }
    if (normalizedButtonText === normalizedSelected && !isCorrect) {
      btn.style.background = 'rgba(239, 68, 68, 0.3)'
      btn.style.borderColor = '#ef4444'
      btn.classList.add('incorrect')
    }
  })
  
  if (isCorrect) {
    const points = gameData.questions[currentQuestionIndex].points || 10
    score += points
    correctAnswers++
    
    feedbackMessage.textContent = '✓ Correct! Great job!'
    feedbackMessage.style.background = 'rgba(16, 185, 129, 0.2)'
    feedbackMessage.style.borderColor = '#10b981'
    feedbackMessage.style.color = '#10b981'
  } else {
    feedbackMessage.textContent = `✗ Incorrect. The correct answer is: ${correctAnswer}`
    feedbackMessage.style.background = 'rgba(239, 68, 68, 0.2)'
    feedbackMessage.style.borderColor = '#ef4444'
    feedbackMessage.style.color = '#ef4444'
  }
  
  feedbackMessage.style.display = 'block'
  feedbackMessage.style.padding = '1rem'
  feedbackMessage.style.borderRadius = '8px'
  feedbackMessage.style.border = '2px solid'
  feedbackMessage.style.marginTop = '1rem'
  
  // Update score display
  document.getElementById('headerScore').textContent = score
  
  // Auto advance after 2 seconds
  setTimeout(() => {
    currentQuestionIndex++
    loadQuestion()
  }, 2000)
}

// End game
async function endGame() {
  // Stop timer if running
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  
  const endTime = Date.now()
  const timeTaken = Math.floor((endTime - startTime) / 1000)
  const totalQuestions = gameData.questions.length
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100)
  
  // Hide game play area
  document.getElementById('gamePlayArea').style.display = 'none'
  
  // Show game over screen
  document.getElementById('gameOverScreen').style.display = 'block'
  
  // Update final stats
  document.getElementById('finalScore').textContent = score
  document.getElementById('correctCount').textContent = `${correctAnswers}/${totalQuestions}`
  document.getElementById('accuracy').textContent = `${accuracy}%`
  
  // Update progress to 100%
  document.getElementById('progressFill').style.width = '100%'
  document.getElementById('progressText').textContent = `${totalQuestions}/${totalQuestions}`
  
  // Save game session to database
  const gameTypeToSend = gameData.game_category === 'fill_blanks' ? 'fill_blanks' : `custom_${gameData.game_id}`
  
  await saveGameSession({
    gameType: gameTypeToSend,
    gameName: gameData.game_name,
    score: score,
    difficulty: gameData.difficulty,
    timeTaken: timeTaken,
    questionsAnswered: totalQuestions,
    correctAnswers: correctAnswers,
    accuracy: accuracy,
    streakCount: 0,
    hintsUsed: 0,
    gameCategory: gameData.category,  // Add the category field
    subject: gameData.category        // Add the subject field as backup
  })
}

// Save game session
async function saveGameSession(sessionData) {
  try {
    
    const response = await fetch('/ClusteringGame/api/game-session.php?action=save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sessionData)
    })
    
    if (!response.ok) {
      const text = await response.text()
      console.error('❌ HTTP error:', response.status, text)
      alert(`Failed to save game score! Status: ${response.status}`)
      return
    }
    
    const result = await response.json()
    
    if (result.success) {
      // Game session saved successfully
    } else {
      console.error('❌ Failed to save game session:', result.message)
      alert(`Failed to save your score: ${result.message}\n\n${result.debug ? JSON.stringify(result.debug) : ''}`)
    }
  } catch (error) {
    console.error('💥 Error saving game session:', error)
    alert(`Error saving your score: ${error.message}\n\nCheck if you're logged in.`)
  }
}

// Display fill-blanks question
function displayFillBlanksQuestion(question) {
  
  // Parse blanks and choices from the question data
  const blanks = question.blanks ? question.blanks.split('|').map(blank => {
    const [number, text, position, length] = blank.split(':')
    return { number: parseInt(number), text, position: parseInt(position), length: parseInt(length) }
  }) : []
  
  const choices = question.choices ? question.choices.split('|').map(choice => {
    const [text, isCorrect, order] = choice.split(':')
    return { text, isCorrect: isCorrect === '1', order: parseInt(order) }
  }) : []
  
  
  // If no blanks or choices data, show a simple message
  if (blanks.length === 0 || choices.length === 0) {
    console.error('No blanks or choices data found!')
    
    document.getElementById('answersContainer').innerHTML = `
      <div class="error-message">
        <h3>⚠️ Game Data Issue</h3>
        <p>This fill-in-the-blanks game doesn't have the required data yet.</p>
        <p>Blanks found: ${blanks.length}</p>
        <p>Choices found: ${choices.length}</p>
        <p>Raw blanks data: ${question.blanks || 'null'}</p>
        <p>Raw choices data: ${question.choices || 'null'}</p>
        <p>Please contact an admin to fix this game.</p>
      </div>
    `
    return
  }
  
  // Create passage with blanks
  let passage = question.question_text
  const blankElements = []
  
  
  // Replace [BLANK] with draggable elements
  blanks.forEach(blank => {
    const blankId = `blank-${blank.number}`
    const blankElement = `<span class="blank-space" id="${blankId}" data-blank-number="${blank.number}">___</span>`
    blankElements.push({ id: blankId, number: blank.number, correctText: blank.text })
    passage = passage.replace('[BLANK]', blankElement)
  })
  
  // Create word bank from choices
  const wordBank = [...new Set(choices.map(c => c.text))] // Remove duplicates
  
  // Update the UI
  document.getElementById('questionText').innerHTML = `<p>${passage}</p>`
  
  // Create word bank
  const answersContainer = document.getElementById('answersContainer')
  answersContainer.innerHTML = `
    <div class="word-bank">
      <h4>Word Bank:</h4>
      <div class="word-choices" id="wordChoices">
        ${wordBank.map(word => `<span class="word-choice" draggable="true" data-word="${word}">${word}</span>`).join('')}
      </div>
    </div>
    <button id="checkAnswerBtn" class="check-answer-btn" onclick="checkFillBlanksAnswer()">Check Answer</button>
  `
  
  // Store blank elements for checking
  window.fillBlanksData = {
    blanks: blankElements,
    choices: choices,
    wordBank: wordBank
  }
  
  
  // Add drag and drop functionality
  setupDragAndDrop()
}

// Setup drag and drop functionality
function setupDragAndDrop() {
  const wordChoices = document.querySelectorAll('.word-choice')
  const blankSpaces = document.querySelectorAll('.blank-space')
  
  if (wordChoices.length === 0) {
    console.error('No word choices found!')
  }
  
  if (blankSpaces.length === 0) {
    console.error('No blank spaces found!')
  }
  
  wordChoices.forEach(word => {
    word.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', word.dataset.word)
      word.classList.add('dragging')
    })
    
    word.addEventListener('dragend', () => {
      word.classList.remove('dragging')
    })
  })
  
  blankSpaces.forEach(blank => {
    blank.addEventListener('dragover', (e) => {
      e.preventDefault()
      blank.classList.add('drag-over')
    })
    
    blank.addEventListener('dragleave', () => {
      blank.classList.remove('drag-over')
    })
    
    blank.addEventListener('drop', (e) => {
      e.preventDefault()
      blank.classList.remove('drag-over')
      
      const word = e.dataTransfer.getData('text/plain')
      blank.textContent = word
      blank.dataset.filledWord = word
    })
  })
}

// Check fill-blanks answer
function checkFillBlanksAnswer() {
  
  if (!window.fillBlanksData || !window.fillBlanksData.blanks) {
    console.error('No fill-blanks data found')
    alert('Error: No fill-blanks data found. Please refresh and try again.')
    return
  }
  
  const blanks = window.fillBlanksData.blanks
  let correctCount = 0
  
  blanks.forEach(blank => {
    const blankElement = document.getElementById(blank.id)
    
    if (!blankElement) {
      console.error('Blank element not found:', blank.id)
      alert(`Error: Blank element "${blank.id}" not found. The game may not have loaded properly.`)
      return
    }
    
    const filledWord = blankElement.dataset.filledWord || ''
    
    if (filledWord === blank.correctText) {
      blankElement.classList.add('correct')
      correctCount++
    } else {
      blankElement.classList.add('incorrect')
    }
  })
  
  const isCorrect = correctCount === blanks.length
  
  // Update score
  if (isCorrect) {
    score += gameData.questions[currentQuestionIndex].points || 10
    correctAnswers++
  }
  
  // Show result
  setTimeout(() => {
    nextQuestion()
  }, 1500)
}

// Move to next question
function nextQuestion() {
  currentQuestionIndex++
  loadQuestion()
}

// Initialize
loadGameData()

