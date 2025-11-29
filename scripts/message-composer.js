// Message Composer Game Logic

const messageTasks = [
  // Grammar Fix Tasks
  {
    type: "grammar",
    messageType: "Text Message",
    scenario: "Texting your friend about homework",
    incorrect: "hey can u help me with the homework im stuck",
    question: "Fix the grammar and punctuation:",
    correct: "Hey, can you help me with the homework? I'm stuck.",
    options: [
      "Hey, can you help me with the homework? I'm stuck.",
      "hey can u help me with the homework im stuck",
      "Hey can you help me with the homework Im stuck",
      "hey, can u help me with homework? im stuck"
    ],
    explanation: "Use proper capitalization, punctuation, and avoid abbreviations like 'u' and 'im'."
  },
  {
    type: "grammar",
    messageType: "Text Message",
    scenario: "Asking your mom about dinner",
    incorrect: "whats for dinner tonight mom",
    question: "Choose the correctly written message:",
    correct: "What's for dinner tonight, Mom?",
    options: [
      "What's for dinner tonight, Mom?",
      "whats for dinner tonight mom",
      "Whats for dinner tonight mom?",
      "what's for dinner tonight mom"
    ],
    explanation: "Capitalize 'Mom', use apostrophe in 'What's', and end with a question mark."
  },

  // Email Tasks
  {
    type: "email",
    messageType: "Email",
    scenario: "Emailing your teacher about an assignment",
    incorrect: "hey mr smith can i turn in my assignment late thanks",
    question: "Choose the most professional version:",
    correct: "Dear Mr. Smith,\n\nMay I please turn in my assignment late? Thank you for your understanding.\n\nSincerely,\n[Your Name]",
    options: [
      "Dear Mr. Smith,\n\nMay I please turn in my assignment late? Thank you for your understanding.\n\nSincerely,\n[Your Name]",
      "hey mr smith can i turn in my assignment late thanks",
      "Hi Mr Smith, can I turn in my assignment late? Thanks",
      "Mr. Smith - Can I turn in assignment late? Thanks."
    ],
    explanation: "Professional emails need proper greeting, polite request, and formal closing."
  },
  {
    type: "email",
    messageType: "Email",
    scenario: "Thank you note to a family member",
    incorrect: "thx for the gift it was cool",
    question: "Choose the best thank you message:",
    correct: "Dear Aunt Sarah,\n\nThank you so much for the wonderful gift! I really appreciate your thoughtfulness.\n\nWith love,\n[Your Name]",
    options: [
      "Dear Aunt Sarah,\n\nThank you so much for the wonderful gift! I really appreciate your thoughtfulness.\n\nWith love,\n[Your Name]",
      "thx for the gift it was cool",
      "Thanks for the gift! It was cool.",
      "Hi, thanks for gift. Cool!"
    ],
    explanation: "Express genuine gratitude with complete words and proper structure."
  },

  // Punctuation Tasks
  {
    type: "punctuation",
    messageType: "Text Message",
    scenario: "Making weekend plans",
    incorrect: "Do you want to go to the movies or the park",
    question: "Add the correct punctuation:",
    correct: "Do you want to go to the movies or the park?",
    options: [
      "Do you want to go to the movies or the park?",
      "Do you want to go to the movies or the park",
      "Do you want to go to the movies or the park.",
      "Do you want to go to the movies, or the park?"
    ],
    explanation: "Questions need question marks at the end."
  },
  {
    type: "punctuation",
    messageType: "Text Message",
    scenario: "Excited news to share",
    incorrect: "I got an A on my test",
    question: "Choose the version that shows excitement:",
    correct: "I got an A on my test!",
    options: [
      "I got an A on my test!",
      "I got an A on my test",
      "I got an A on my test?",
      "I got an A on my test..."
    ],
    explanation: "Exclamation marks show excitement and enthusiasm."
  },

  // Formal vs Informal
  {
    type: "formality",
    messageType: "Email",
    scenario: "Requesting information from a library",
    incorrect: "yo do u guys have harry potter books",
    question: "Choose the most appropriate message:",
    correct: "Hello,\n\nDo you have Harry Potter books available? Thank you!",
    options: [
      "Hello,\n\nDo you have Harry Potter books available? Thank you!",
      "yo do u guys have harry potter books",
      "Hey, do you have Harry Potter books?",
      "Do you have harry potter books"
    ],
    explanation: "Formal requests need proper greetings and complete sentences."
  },
  {
    type: "formality",
    messageType: "Text Message",
    scenario: "Inviting friend to birthday party",
    incorrect: "Dear Friend I would like to formally invite you to my birthday celebration",
    question: "Choose the most natural text message:",
    correct: "Hey! Want to come to my birthday party on Saturday?",
    options: [
      "Hey! Want to come to my birthday party on Saturday?",
      "Dear Friend I would like to formally invite you to my birthday celebration",
      "You are cordially invited to attend my birthday party",
      "Please RSVP to my birthday celebration event"
    ],
    explanation: "Text messages to friends can be casual and friendly."
  },

  // Clarity Tasks
  {
    type: "clarity",
    messageType: "Text Message",
    scenario: "Giving directions",
    incorrect: "meet me at the place near the thing at sometime",
    question: "Choose the clearest message:",
    correct: "Meet me at the library entrance at 3:00 PM.",
    options: [
      "Meet me at the library entrance at 3:00 PM.",
      "meet me at the place near the thing at sometime",
      "Meet me at the place at 3.",
      "Meet at the library sometime."
    ],
    explanation: "Clear messages include specific location and time."
  },
  {
    type: "clarity",
    messageType: "Text Message",
    scenario: "Explaining homework",
    incorrect: "homework is on page with stuff about things",
    question: "Choose the clearest explanation:",
    correct: "The homework is on page 45, questions 1-10 about fractions.",
    options: [
      "The homework is on page 45, questions 1-10 about fractions.",
      "homework is on page with stuff about things",
      "Homework is on some page about math.",
      "The homework is about fractions and stuff."
    ],
    explanation: "Be specific with page numbers, questions, and topics."
  },

  // Common Mistakes
  {
    type: "mistakes",
    messageType: "Text Message",
    scenario: "Common spelling errors",
    incorrect: "I dont no if your coming or not",
    question: "Fix all the errors:",
    correct: "I don't know if you're coming or not.",
    options: [
      "I don't know if you're coming or not.",
      "I dont no if your coming or not",
      "I don't no if your coming or not.",
      "I dont know if you're coming or not"
    ],
    explanation: "Common errors: don't (contraction), know (not no), you're (you are)."
  },
  {
    type: "mistakes",
    messageType: "Text Message",
    scenario: "Their, there, they're",
    incorrect: "there going to bring there books over their",
    question: "Choose the correct usage:",
    correct: "They're going to bring their books over there.",
    options: [
      "They're going to bring their books over there.",
      "there going to bring there books over their",
      "Their going to bring they're books over there.",
      "They're going to bring there books over their."
    ],
    explanation: "They're = they are, their = possessive, there = location."
  }
];

class MessageComposerGame {
  constructor() {
    this.currentMessageIndex = 0;
    this.score = 0;
    this.correctAnswers = 0;
    this.totalAttempts = 0;
    this.messages = this.shuffleArray([...messageTasks]);
    // Session timer  
    this.sessionStartTs = null;
    this.timerInterval = null;
    this.elapsedSeconds = 0;
    // Hint tracking
    this.hintsUsed = 0;
    this.currentMessageHintShown = false;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  getCurrentMessage() {
    return this.messages[this.currentMessageIndex];
  }

  loadMessage() {
    const message = this.getCurrentMessage();
    const messageContent = document.getElementById("messageContent");
    const messageType = document.getElementById("messageType");
  
    // Reset hint tracking for new message
    this.currentMessageHintShown = false;
  
    // Update message type badge
    messageType.textContent = `${this.getTypeEmoji(message.type)} ${message.messageType}`;
    messageType.style.background = this.getTypeColor(message.type);
  
    // Display message
    messageContent.innerHTML = `
      <div class="scenario-badge">📍 ${message.scenario}</div>
      <div class="message-display">
        <div class="message-bubble incorrect-message">
          <div class="message-label">❌ Original Message:</div>
          ${this.formatMessage(message.incorrect)}
        </div>
      </div>
      <p class="message-question">${message.question}</p>
      <div class="options-list" id="optionsList"></div>
      <button class="hint-button" id="hintButton">💡 Show Explanation</button>
      <div class="explanation-display" id="explanationDisplay" style="display:none;"></div>
    `;
  
    // Attach hint button event listener with proper context
    const hintButton = document.getElementById("hintButton");
    if (hintButton) {
      hintButton.addEventListener('click', () => {
        this.showExplanation(true);
      });
    }
  
    // Display options - SHUFFLE THEM HERE!
    const optionsList = document.getElementById("optionsList");
    const shuffledOptions = this.shuffleArray([...message.options]); // Create shuffled copy
    shuffledOptions.forEach((option, index) => {
      const optionDiv = document.createElement("div");
      optionDiv.className = "option-item";
      optionDiv.innerHTML = `
        <button class="option-button" onclick="game.checkAnswer('${this.escapeHtml(option)}')">
          <span class="option-letter">${String.fromCharCode(65 + index)}</span>
          <span class="option-text">${this.formatMessage(option)}</span>
        </button>
      `;
      optionsList.appendChild(optionDiv);
    });
  
    this.updateProgress();
  }

  formatMessage(text) {
    return text.replace(/\n/g, '<br>');
  }

  escapeHtml(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
  }

  getTypeEmoji(type) {
    const emojis = {
      grammar: "✏️",
      email: "📧",
      punctuation: "❓",
      formality: "👔",
      clarity: "💡",
      mistakes: "🔍"
    };
    return emojis[type] || "💬";
  }

  getTypeColor(type) {
    const colors = {
      grammar: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
      email: "linear-gradient(135deg, #10b981, #06b6d4)",
      punctuation: "linear-gradient(135deg, #f59e0b, #ef4444)",
      formality: "linear-gradient(135deg, #8b5cf6, #ec4899)",
      clarity: "linear-gradient(135deg, #06b6d4, #3b82f6)",
      mistakes: "linear-gradient(135deg, #ef4444, #f59e0b)"
    };
    return colors[type] || "linear-gradient(135deg, #667eea, #764ba2)";
  }

  showExplanation(userInitiated = false) {
    const message = this.getCurrentMessage();
    const explanationDisplay = document.getElementById("explanationDisplay");
    
    // Only track hint if user clicked the button (not auto-shown on wrong answer)
    if (userInitiated && !this.currentMessageHintShown) {
      this.hintsUsed++;
      this.currentMessageHintShown = true;
    }
    
    explanationDisplay.textContent = `💡 ${message.explanation}`;
    explanationDisplay.style.display = "block";
    this.score = Math.max(0, this.score - 2);
    this.updateScore();
  }

  checkAnswer(selectedAnswer) {
    const message = this.getCurrentMessage();
    // Unescape the answer for comparison
    const unescapedAnswer = selectedAnswer.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, '\n');
    this.totalAttempts++;

    const optionButtons = document.querySelectorAll(".option-button");
    optionButtons.forEach((btn) => (btn.disabled = true));

    if (unescapedAnswer === message.correct) {
      this.correctAnswers++;
      this.score += 15;
      this.showFeedback(true, "✅ Perfect! That's the correct way to write it!");
      this.updateScore();

      setTimeout(() => {
        this.nextMessage();
      }, 1500);
    } else {
      this.showFeedback(false, `❌ Not quite. Check the explanation to learn why.`);
      this.score = Math.max(0, this.score - 3);
      this.updateScore();
      this.showExplanation();

      setTimeout(() => {
        this.nextMessage();
      }, 3500);
    }
  }

  showFeedback(isCorrect, message) {
    const feedbackEl = document.getElementById("feedbackMessage");
    feedbackEl.textContent = message;
    feedbackEl.className = `feedback-message ${isCorrect ? "correct" : "incorrect"}`;
    feedbackEl.style.display = "block";

    setTimeout(() => {
      feedbackEl.style.display = "none";
    }, 2000);
  }

  nextMessage() {
    this.currentMessageIndex++;

    if (this.currentMessageIndex >= this.messages.length) {
      this.endGame();
    } else {
      this.loadMessage();
    }
  }

  updateScore() {
    document.getElementById("score").textContent = this.score;
    document.getElementById("messagesCompleted").textContent = this.correctAnswers;
  }

  updateProgress() {
    const progress = ((this.currentMessageIndex + 1) / this.messages.length) * 100;
    document.getElementById("progressFill").style.width = `${progress}%`;
    document.getElementById("progressText").textContent = `${this.currentMessageIndex + 1}/${this.messages.length}`;
    document.getElementById("messageNumber").textContent = this.currentMessageIndex + 1;
  }

  endGame() {
    document.getElementById("gamePlayArea").style.display = "none";
    document.getElementById("gameOverScreen").style.display = "block";

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    const accuracy = Math.round((this.correctAnswers / this.totalAttempts) * 100);

    document.getElementById("finalScore").textContent = this.score;
    document.getElementById("messagesFixed").textContent = this.correctAnswers;
    document.getElementById("accuracy").textContent = `${accuracy}%`;

    // Save to database
    if (window.saveGameResult) {
      // Ensure hintsUsed is always a number
      const hintsUsedValue = Number(this.hintsUsed) || 0;
      
      const gameData = {
        score: this.score,
        difficulty: "medium",
        questionsAnswered: this.totalAttempts,
        correctAnswers: this.correctAnswers,
        accuracy: accuracy,
        hintsUsed: hintsUsedValue,
        timeTaken: this.elapsedSeconds,
      };
      window.saveGameResult("message-composer", gameData);
    }
  }
}

let game;

function startGame() {
  document.getElementById("instructionsCard").style.display = "none";
  document.getElementById("gamePlayArea").style.display = "flex";

  game = new MessageComposerGame();
  game.loadMessage();

  // start session timer
  game.sessionStartTs = Date.now();
  const timerEl = document.getElementById("gameTimer");
  game.timerInterval = setInterval(() => {
    game.elapsedSeconds = Math.floor((Date.now() - game.sessionStartTs) / 1000);
    if (game.elapsedSeconds >= 300) {
      clearInterval(game.timerInterval);
      game.timerInterval = null;
      game.endGame();
      return;
    }
    const m = Math.floor(game.elapsedSeconds / 60);
    const s = game.elapsedSeconds % 60;
    if (timerEl) timerEl.textContent = `${m}:${s.toString().padStart(2, "0")}`;
  }, 1000);
}

function restartGame() {
  document.getElementById("gameOverScreen").style.display = "none";
  document.getElementById("instructionsCard").style.display = "block";
}

