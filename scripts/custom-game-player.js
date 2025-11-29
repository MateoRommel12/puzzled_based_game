// Custom Game Player
let gameData = null
let currentQuestionIndex = 0
let score = 0
let correctAnswers = 0
let startTime = null
let timerInterval = null
let elapsedSeconds = 0
let timeLimit = 0
let hintsUsed = 0  // Track hints used in custom games

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
    
    if (result.success && result.game) {image.png
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
  
  // Reset game state
  currentQuestionIndex = 0
  score = 0
  correctAnswers = 0
  hintsUsed = 0
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
  
  // Update progress
  document.getElementById('progressText').textContent = `${currentQuestionIndex}/${gameData.questions.length}`
  const progressPercent = (currentQuestionIndex / gameData.questions.length) * 100
  document.getElementById('progressFill').style.width = `${progressPercent}%`
  
  const answersContainer = document.getElementById('answersContainer')
  answersContainer.innerHTML = ''
  
  // Clean up any existing hint buttons/containers from previous questions
  const existingHintButton = document.getElementById('hintButton')
  const existingHintContainer = document.getElementById('hintContainer')
  if (existingHintButton) existingHintButton.remove()
  if (existingHintContainer) existingHintContainer.remove()
  
  // Check for jumbled sentences by question_type OR game category
  const isJumbledSentence = question.question_type === 'jumbled_sentence' || 
                            question.questionType === 'jumbled_sentence' ||
                            gameData.game_category === 'jumbled_sentences';
  
  const isFillBlanks = question.question_type === 'fill_blanks' || 
                       question.questionType === 'fill_blanks' ||
                       gameData.game_category === 'fill_blanks';
  
  // Handle different question types BEFORE setting question text
  if (isFillBlanks) {
    // For fill-blanks, we'll create a different UI
    displayFillBlanksQuestion(question)
    return
  } else if (isJumbledSentence) {
    // For jumbled sentences, we'll create a different UI
    displayJumbledSentenceQuestion(question)
    return
  }
  
  // For regular questions, set the question text
  document.getElementById('questionText').textContent = question.question_text || question.questionText || ''
  
  // Add hint button and container if question has a hint
  const questionContent = document.querySelector('.question-content')
  
  // Use the helper function to add hint button
  // Check for hint in multiple possible field names
  const hint = question.hint || question.hintText || null;
  if (hint && (typeof hint === 'string' && hint.trim() !== '')) {
    addHintButton(questionContent, question)
  }
  
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

// Show hint function
function showHint(hintText) {
  const hintContainer = document.getElementById('hintContainer')
  const hintButton = document.getElementById('hintButton')
  
  if (hintContainer && hintText) {
    // Show the hint
    hintContainer.style.display = 'block'
    
    // Hide the button after showing hint
    if (hintButton) {
      hintButton.style.display = 'none'
    }
    
    // Track hint usage (only when actually clicked)
    hintsUsed++
  }
}

// Helper function to add hint button to any container
function addHintButton(container, question) {
  // Check for hint in multiple possible field names and handle null/empty values
  const hint = question.hint || question.hintText || null;
  if (!hint || (typeof hint === 'string' && hint.trim() === '')) {
    return // No hint available
  }
  
  // Get hint text once
  const hintText = question.hint || question.hintText || '';
  
  // Remove existing hint elements
  const existingButton = document.getElementById('hintButton')
  const existingContainer = document.getElementById('hintContainer')
  if (existingButton) existingButton.remove()
  if (existingContainer) existingContainer.remove()
  
  // Create hint button
  const hintButton = document.createElement('button')
  hintButton.id = 'hintButton'
  hintButton.className = 'hint-button'
  hintButton.innerHTML = '💡 Need a Hint?'
  hintButton.style.cssText = `
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(245, 158, 11, 0.2);
    border: 2px solid rgba(245, 158, 11, 0.5);
    border-radius: 8px;
    color: #f59e0b;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: block;
    width: auto;
  `
  hintButton.onclick = () => showHint(hintText)
  hintButton.onmouseover = () => {
    hintButton.style.background = 'rgba(245, 158, 11, 0.3)'
    hintButton.style.borderColor = 'rgba(245, 158, 11, 0.7)'
  }
  hintButton.onmouseout = () => {
    hintButton.style.background = 'rgba(245, 158, 11, 0.2)'
    hintButton.style.borderColor = 'rgba(245, 158, 11, 0.5)'
  }
  
  // Create hint container (initially hidden)
  const hintContainer = document.createElement('div')
  hintContainer.id = 'hintContainer'
  hintContainer.style.cssText = `
    display: none;
    margin-top: 1rem;
    margin-bottom: 1rem;
    padding: 1rem;
    background: rgba(245, 158, 11, 0.1);
    border: 2px solid rgba(245, 158, 11, 0.3);
    border-radius: 8px;
    color: #fbbf24;
  `
  hintContainer.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
      <span style="font-size: 1.2rem;">💡</span>
      <strong style="color: #f59e0b;">Hint:</strong>
    </div>
    <p style="margin: 0; color: #fbbf24;">${escapeHtml(hintText)}</p>
  `
  
  // Insert hint button and container after questionText but before answersContainer
  const questionTextElement = document.getElementById('questionText')
  const answersContainer = document.getElementById('answersContainer')
  
  if (questionTextElement && answersContainer) {
    // Insert before answersContainer
    container.insertBefore(hintButton, answersContainer)
    container.insertBefore(hintContainer, answersContainer)
  } else {
    // Fallback: append to container
    container.appendChild(hintButton)
    container.appendChild(hintContainer)
  }
}

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
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
    hintsUsed: hintsUsed || 0,
    gameCategory: gameData.game_category,  // Category (quiz, fill_blanks, etc.)
    subject: gameData.game_type,          // Learning type (math or literacy)
    gameId: gameData.game_id             // Add game_id for mapping
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
      let errorMessage = `Failed to save game score! Status: ${response.status}`
      try {
        const errorData = JSON.parse(text)
        if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch (e) {
        errorMessage += '\n\n' + text.substring(0, 200)
      }
      alert(errorMessage)
      return
    }
    
    const result = await response.json()
    
    if (result.success) {
      // Game session saved successfully
    } else {
      alert(`Failed to save your score: ${result.message}`)
    }
  } catch (error) {
    alert(`Error saving your score: ${error.message}\n\nCheck if you're logged in and try refreshing the page.`)
  }
}

// Display fill-blanks question
// Display jumbled sentence question
function displayJumbledSentenceQuestion(question) {
  const correctSentence = question.question_text || question.correct_answer || ''
  
  if (!correctSentence || correctSentence.trim() === '') {
    document.getElementById('answersContainer').innerHTML = `
      <div style="color: #ef4444; padding: 2rem; text-align: center;">
        <p>⚠️ Error: No sentence data found for this question.</p>
        <p>Please contact an admin to fix this game.</p>
      </div>
    `;
    return;
  }
  
  const words = correctSentence.split(' ').filter(word => word.trim() !== '')
  
  if (words.length === 0) {
    document.getElementById('answersContainer').innerHTML = `
      <div style="color: #ef4444; padding: 2rem; text-align: center;">
        <p>⚠️ Error: Sentence appears to be empty.</p>
      </div>
    `;
    return;
  }
  
  // Scramble the words
  const scrambledWords = [...words].sort(() => Math.random() - 0.5)
  
  if (scrambledWords.length === 0) {
    document.getElementById('answersContainer').innerHTML = `
      <div style="color: #ef4444; padding: 2rem; text-align: center;">
        <p>⚠️ Error: No words found in sentence.</p>
        <p>Original sentence: "${correctSentence}"</p>
      </div>
    `;
    return;
  }
  
  // Store selected words order
  let selectedWords = []
  
  // Update question text
  document.getElementById('questionText').innerHTML = `
    <p>Drag and drop words to rearrange them into a correct sentence:</p>
  `
  
  // Add hint button if hint exists (don't show default instruction as hint)
  const hint = question.hint || question.hintText || null;
  if (hint && (typeof hint === 'string' && hint.trim() !== '')) {
    const questionContent = document.querySelector('.question-content')
    addHintButton(questionContent, question)
  }
  
  // Generate word bank HTML
  const wordBankHTML = scrambledWords.map((word, index) => {
    // Escape HTML to prevent XSS
    const safeWord = word.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `
      <div 
        class="draggable-word" 
        draggable="true"
        data-word="${safeWord.replace(/"/g, '&quot;')}" 
        data-word-id="word-${index}"
        data-original-index="${index}"
      >${safeWord}</div>
    `;
  }).join('');
  
  // Create the UI
  const answersContainer = document.getElementById('answersContainer')
  if (!answersContainer) {
    return;
  }
  
  answersContainer.innerHTML = `
    <div class="jumbled-sentence-container">
      <div class="scrambled-words" id="scrambledWords">
        <h4>Scrambled Words:</h4>
        <div class="word-bank" id="wordBank">
          ${wordBankHTML}
        </div>
      </div>
      
      <div class="selected-sentence" id="selectedSentence">
        <h4>Your Sentence:</h4>
        <div class="sentence-display" id="sentenceDisplay" data-drop-zone="true">
          <span class="placeholder">Drag words here to build your sentence...</span>
        </div>
        <button class="clear-btn" onclick="clearJumbledSentence()" style="margin-top: 0.5rem;">Clear All</button>
      </div>
      
      <button id="checkJumbledAnswerBtn" class="check-answer-btn" onclick="checkJumbledSentenceAnswer()">
        Check Answer
      </button>
    </div>
  `
  
  // Store data for checking
  window.jumbledSentenceData = {
    correctWords: words,
    correctSentence: correctSentence,
    selectedWords: selectedWords,
    scrambledWords: scrambledWords,
    usedWords: new Set() // Track which words are in the sentence
  }
  
  // Setup drag and drop
  setupJumbledSentenceDragDrop()
  
  // Add styles
  const style = document.createElement('style')
  style.id = 'jumbled-sentence-styles'
  // Remove old styles if they exist
  const oldStyle = document.getElementById('jumbled-sentence-styles')
  if (oldStyle) oldStyle.remove()
  
  style.textContent = `
    .jumbled-sentence-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .word-bank {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 0.5rem;
      min-height: 60px;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border: 2px dashed rgba(96, 165, 250, 0.3);
      border-radius: 8px;
    }
    .draggable-word {
      padding: 0.75rem 1.25rem;
      background: rgba(96, 165, 250, 0.2);
      border: 2px solid rgba(96, 165, 250, 0.4);  
      border-radius: 8px;
      color: #60a5fa;
      font-size: 1rem;
      cursor: grab;
      transition: all 0.3s ease;
      user-select: none;
    }
    .draggable-word:hover {
      background: rgba(96, 165, 250, 0.3);
      border-color: #60a5fa;
      transform: translateY(-2px);
    }
    .draggable-word.dragging {
      opacity: 0.5;
      cursor: grabbing;
    }
    .draggable-word.used {
      opacity: 0.3;
      cursor: not-allowed;
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
    }
    .sentence-display {
      min-height: 80px;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 2px dashed rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      margin-top: 0.5rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      transition: all 0.3s ease;
    }
    .sentence-display.drag-over {
      background: rgba(96, 165, 250, 0.1);
      border-color: #60a5fa;
      border-style: solid;
    }
    .sentence-display .placeholder {
      color: #888;
      font-style: italic;
      width: 100%;
      text-align: center;
    }
    .sentence-word {
      padding: 0.75rem 1.25rem;
      background: rgba(59, 130, 246, 0.3);
      border: 2px solid rgba(59, 130, 246, 0.5);
      border-radius: 8px;
      color: #3b82f6;
      cursor: grab;
      user-select: none;
      transition: all 0.3s ease;
      position: relative;
    }
    .sentence-word:hover {
      background: rgba(59, 130, 246, 0.4);
      border-color: #3b82f6;
      transform: scale(1.05);
    }
    .sentence-word.dragging {
      opacity: 0.5;
      cursor: grabbing;
    }
    .clear-btn {
      padding: 0.5rem 1rem;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 6px;
      color: #ef4444;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .clear-btn:hover {
      background: rgba(239, 68, 68, 0.3);
      transform: translateY(-1px);
    }
  `
  document.head.appendChild(style)
}

// Setup drag and drop for jumbled sentences
function setupJumbledSentenceDragDrop() {
  const wordBank = document.getElementById('wordBank')
  const sentenceDisplay = document.getElementById('sentenceDisplay')
  
  // Make words in bank draggable
  const draggableWords = wordBank.querySelectorAll('.draggable-word')
  draggableWords.forEach(word => {
    word.addEventListener('dragstart', handleDragStart)
    word.addEventListener('dragend', handleDragEnd)
  })
  
  // Setup drop zone
  sentenceDisplay.addEventListener('dragover', handleDragOver)
  sentenceDisplay.addEventListener('drop', handleDrop)
  sentenceDisplay.addEventListener('dragleave', handleDragLeave)
  
  // Allow reordering words in sentence by dragging them
  sentenceDisplay.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('sentence-word')) {
      e.dataTransfer.setData('text/plain', e.target.dataset.word)
      e.dataTransfer.setData('source', 'sentence')
      e.target.classList.add('dragging')
    }
  })
  
  // Allow removing words by dragging back to word bank
  wordBank.addEventListener('dragover', (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  })
  
  wordBank.addEventListener('drop', (e) => {
    e.preventDefault()
    const word = e.dataTransfer.getData('text/plain')
    const source = e.dataTransfer.getData('source')
    
    if (source === 'sentence') {
      // Remove word from sentence and add back to bank
      removeWordFromSentence(word)
    }
  })
}

// Drag event handlers
function handleDragStart(e) {
  if (!e.target.classList.contains('draggable-word') || e.target.classList.contains('used')) {
    e.preventDefault()
    return
  }
  
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', e.target.dataset.word)
  e.dataTransfer.setData('word-id', e.target.dataset.wordId)
  e.dataTransfer.setData('source', 'bank')
  
  e.target.classList.add('dragging')
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging')
}

function handleDragOver(e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
  e.currentTarget.classList.add('drag-over')
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over')
}

function handleDrop(e) {
  e.preventDefault()
  e.currentTarget.classList.remove('drag-over')
  
  const word = e.dataTransfer.getData('text/plain')
  const wordId = e.dataTransfer.getData('word-id')
  const source = e.dataTransfer.getData('source')
  
  if (source === 'bank' && word && !window.jumbledSentenceData.usedWords.has(word)) {
    // Add word to sentence
    addWordToSentence(word, wordId)
  } else if (source === 'sentence') {
    // Word is being reordered - find insertion point
    const sentenceDisplay = document.getElementById('sentenceDisplay')
    const afterElement = getDragAfterElement(sentenceDisplay, e.clientX)
    
    const draggedWord = document.querySelector('.sentence-word.dragging')
    if (draggedWord && draggedWord.dataset.word === word) {
      // Remove from current position
      draggedWord.remove()
      
      // Insert at new position
      if (afterElement == null) {
        sentenceDisplay.appendChild(draggedWord)
      } else {
        sentenceDisplay.insertBefore(draggedWord, afterElement)
      }
      
      // Update order
      updateSentenceOrder()
    }
  }
}

// Helper function to find where to insert dragged element
function getDragAfterElement(container, x) {
  const draggableElements = [...container.querySelectorAll('.sentence-word:not(.dragging)')]
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = x - box.left - box.width / 2
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child }
    } else {
      return closest
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element
}

// Add word to sentence
function addWordToSentence(word, wordId) {
  if (!window.jumbledSentenceData) return
  
  const sentenceDisplay = document.getElementById('sentenceDisplay')
  const placeholder = sentenceDisplay.querySelector('.placeholder')
  if (placeholder) placeholder.remove()
  
  // Create word element in sentence
  const wordElement = document.createElement('div')
  wordElement.className = 'sentence-word'
  wordElement.textContent = word
  wordElement.dataset.word = word
  wordElement.draggable = true
  
  // Add drag handlers for reordering
  wordElement.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', word)
    e.dataTransfer.setData('source', 'sentence')
    e.target.classList.add('dragging')
  })
  
  wordElement.addEventListener('dragend', (e) => {
    e.target.classList.remove('dragging')
  })
  
  sentenceDisplay.appendChild(wordElement)
  
  // Mark word as used in bank
  const bankWord = document.querySelector(`.draggable-word[data-word-id="${wordId}"]`)
  if (bankWord) {
    bankWord.classList.add('used')
  }
  
  // Update data
  window.jumbledSentenceData.selectedWords.push(word)
  window.jumbledSentenceData.usedWords.add(word)
  
  // Update order when dropped
  updateSentenceOrder()
}

// Remove word from sentence
function removeWordFromSentence(word) {
  if (!window.jumbledSentenceData) return
  
  // Remove from sentence display
  const wordElement = document.querySelector(`.sentence-word[data-word="${word}"]`)
  if (wordElement) {
    wordElement.remove()
  }
  
  // Remove from data
  const index = window.jumbledSentenceData.selectedWords.indexOf(word)
  if (index > -1) {
    window.jumbledSentenceData.selectedWords.splice(index, 1)
  }
  window.jumbledSentenceData.usedWords.delete(word)
  
  // Show word in bank again
  const bankWords = document.querySelectorAll('.draggable-word')
  bankWords.forEach(bw => {
    if (bw.dataset.word === word) {
      bw.classList.remove('used')
    }
  })
  
  // Show placeholder if sentence is empty
  const sentenceDisplay = document.getElementById('sentenceDisplay')
  if (sentenceDisplay.children.length === 0) {
    sentenceDisplay.innerHTML = '<span class="placeholder">Drag words here to build your sentence...</span>'
  }
  
  updateSentenceOrder()
}

// Update sentence order based on DOM order
function updateSentenceOrder() {
  if (!window.jumbledSentenceData) return
  
  const sentenceDisplay = document.getElementById('sentenceDisplay')
  const wordElements = sentenceDisplay.querySelectorAll('.sentence-word')
  
  window.jumbledSentenceData.selectedWords = Array.from(wordElements).map(el => el.dataset.word)
}

// Clear jumbled sentence
function clearJumbledSentence() {
  if (!window.jumbledSentenceData) return
  
  // Clear sentence display
  const sentenceDisplay = document.getElementById('sentenceDisplay')
  sentenceDisplay.innerHTML = '<span class="placeholder">Drag words here to build your sentence...</span>'
  
  // Reset data
  window.jumbledSentenceData.selectedWords = []
  window.jumbledSentenceData.usedWords.clear()
  
  // Show all words in bank again
  const bankWords = document.querySelectorAll('.draggable-word')
  bankWords.forEach(word => {
    word.classList.remove('used')
  })
}

// Check jumbled sentence answer
function checkJumbledSentenceAnswer() {
  if (!window.jumbledSentenceData) return
  
  const selected = window.jumbledSentenceData.selectedWords
  const correct = window.jumbledSentenceData.correctWords
  
  // Normalize for comparison (trim, lowercase)
  const selectedNormalized = selected.map(w => w.trim().toLowerCase())
  const correctNormalized = correct.map(w => w.trim().toLowerCase())
  
  const isCorrect = JSON.stringify(selectedNormalized) === JSON.stringify(correctNormalized)
  
  const feedbackMessage = document.getElementById('feedbackMessage')
  const checkBtn = document.getElementById('checkJumbledAnswerBtn')
  
  if (isCorrect) {
    const points = gameData.questions[currentQuestionIndex].points || 10
    score += points
    correctAnswers++
    
    feedbackMessage.textContent = '✓ Correct! Great job!'
    feedbackMessage.style.background = 'rgba(16, 185, 129, 0.2)'
    feedbackMessage.style.borderColor = '#10b981'
    feedbackMessage.style.color = '#10b981'
    feedbackMessage.style.display = 'block'
    
    checkBtn.disabled = true
    
    setTimeout(() => {
      currentQuestionIndex++
      loadQuestion()
    }, 1500)
  } else {
    feedbackMessage.textContent = `✗ Incorrect. The correct sentence is: "${window.jumbledSentenceData.correctSentence}"`
    feedbackMessage.style.background = 'rgba(239, 68, 68, 0.2)'
    feedbackMessage.style.borderColor = '#ef4444'
    feedbackMessage.style.color = '#ef4444'
    feedbackMessage.style.display = 'block'
    
    // Show correct answer
    const sentenceDisplay = document.getElementById('sentenceDisplay')
    sentenceDisplay.innerHTML = correct.map((word, i) => 
      `<div class="sentence-word" style="background: rgba(16, 185, 129, 0.3); border-color: #10b981; cursor: default;">${word}</div>`
    ).join('')
    
    setTimeout(() => {
      currentQuestionIndex++
      loadQuestion()
    }, 3000)
  }
}

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
  
  // Add hint button if question has a hint
  const hint = question.hint || question.hintText || null;
  if (hint && (typeof hint === 'string' && hint.trim() !== '')) {
    const questionContent = document.querySelector('.question-content')
    addHintButton(questionContent, question)
  }
  
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

