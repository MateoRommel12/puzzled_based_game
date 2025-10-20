// Shopping List Helper Game Logic

const shoppingTasks = [
  // Spelling Fix Tasks
  {
    type: "spelling",
    question: "Fix the spelling mistake in this shopping item:",
    incorrect: "banannas",
    correct: "bananas",
    options: ["bananas", "banannas", "bannanas", "bananes"],
    hint: "The fruit is yellow and you peel it"
  },
  {
    type: "spelling",
    question: "Fix the spelling mistake:",
    incorrect: "tomatoe",
    correct: "tomato",
    options: ["tomato", "tomatoe", "tomatoe", "tommato"],
    hint: "Red vegetable used in salads"
  },
  {
    type: "spelling",
    question: "Which spelling is correct?",
    incorrect: "yoghurt",
    correct: "yogurt",
    options: ["yogurt", "yoghurt", "yogurt", "yoghurt"],
    hint: "Dairy product, often eaten for breakfast"
  },
  {
    type: "spelling",
    question: "Fix the spelling:",
    incorrect: "bred",
    correct: "bread",
    options: ["bread", "bred", "brede", "braed"],
    hint: "You make sandwiches with this"
  },
  {
    type: "spelling",
    question: "Which is correct?",
    incorrect: "chiken",
    correct: "chicken",
    options: ["chicken", "chiken", "chickin", "chickun"],
    hint: "A type of meat or bird"
  },

  // Categorization Tasks
  {
    type: "category",
    question: "Which category does 'milk' belong to?",
    item: "milk",
    correct: "Dairy",
    options: ["Dairy", "Vegetables", "Fruits", "Meat"],
    hint: "Comes from cows"
  },
  {
    type: "category",
    question: "Where should you put 'apple'?",
    item: "apple",
    correct: "Fruits",
    options: ["Fruits", "Vegetables", "Dairy", "Snacks"],
    hint: "Grows on trees, often red or green"
  },
  {
    type: "category",
    question: "Categorize 'carrot':",
    item: "carrot",
    correct: "Vegetables",
    options: ["Vegetables", "Fruits", "Meat", "Dairy"],
    hint: "Orange and crunchy, rabbits love them"
  },
  {
    type: "category",
    question: "Where does 'cheese' go?",
    item: "cheese",
    correct: "Dairy",
    options: ["Dairy", "Meat", "Vegetables", "Snacks"],
    hint: "Made from milk"
  },
  {
    type: "category",
    question: "Categorize 'beef':",
    item: "beef",
    correct: "Meat",
    options: ["Meat", "Dairy", "Vegetables", "Fruits"],
    hint: "Comes from cows, protein source"
  },

  // Quantity Tasks
  {
    type: "quantity",
    question: "If you need 2 bags of apples and already have 1, how many more do you need?",
    correct: "1",
    options: ["1", "2", "3", "0"],
    hint: "Subtraction: 2 - 1 = ?"
  },
  {
    type: "quantity",
    question: "You need 3 bottles of milk. Each costs $2. How much total?",
    correct: "$6",
    options: ["$6", "$5", "$8", "$3"],
    hint: "3 × 2 = ?"
  },
  {
    type: "quantity",
    question: "Shopping for 4 people. Each needs 2 eggs. How many eggs total?",
    correct: "8",
    options: ["8", "6", "10", "4"],
    hint: "4 × 2 = ?"
  },
  {
    type: "quantity",
    question: "You have $10. Bread costs $3. How much left?",
    correct: "$7",
    options: ["$7", "$6", "$8", "$13"],
    hint: "10 - 3 = ?"
  },
  {
    type: "quantity",
    question: "Need 6 apples. Pack has 10. How many extra?",
    correct: "4",
    options: ["4", "3", "5", "6"],
    hint: "10 - 6 = ?"
  }
];

class ShoppingListGame {
  constructor() {
    this.currentTaskIndex = 0;
    this.score = 0;
    this.level = 1;
    this.correctAnswers = 0;
    this.totalAttempts = 0;
    this.tasks = this.shuffleArray([...shoppingTasks]);
    // Session timer
    this.sessionStartTs = null;
    this.timerInterval = null;
    this.elapsedSeconds = 0;
  }

 shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  getCurrentTask() {
    return this.tasks[this.currentTaskIndex];
  }

  loadTask() {
    const task = this.getCurrentTask();
    const taskContent = document.getElementById("taskContent");
    const taskType = document.getElementById("taskType");
  
    // Update task type badge
    if (task.type === "spelling") {
      taskType.textContent = "✏️ Spelling Fix";
      taskType.style.background = "linear-gradient(135deg, #3b82f6, #8b5cf6)";
    } else if (task.type === "category") {
      taskType.textContent = "📦 Categorization";
      taskType.style.background = "linear-gradient(135deg, #10b981, #06b6d4)";
    } else if (task.type === "quantity") {
      taskType.textContent = "🔢 Quantity";
      taskType.style.background = "linear-gradient(135deg, #f59e0b, #ef4444)";
    }
  
    // Display question
    if (task.type === "spelling") {
      taskContent.innerHTML = `
        <div class="shopping-item-display">
          <div class="incorrect-item">❌ ${task.incorrect}</div>
          <p class="task-question">${task.question}</p>
        </div>
        <div class="options-grid" id="optionsGrid"></div>
        <button class="hint-button" onclick="game.showHint()">💡 Need a Hint?</button>
        <div class="hint-display" id="hintDisplay" style="display:none;"></div>
      `;
    } else {
      taskContent.innerHTML = `
        <p class="task-question">${task.question}</p>
        <div class="options-grid" id="optionsGrid"></div>
        <button class="hint-button" onclick="game.showHint()">💡 Need a Hint?</button>
        <div class="hint-display" id="hintDisplay" style="display:none;"></div>
      `;
    }
  
    // Display options - SHUFFLE THEM HERE!
    const optionsGrid = document.getElementById("optionsGrid");
    const shuffledOptions = this.shuffleArray([...message.options]);
    shuffledOptions.options.forEach((option) => {
      const btn = document.createElement("button");
      btn.className = "option-button";
      btn.textContent = option;
      btn.onclick = () => this.checkAnswer(option);
      optionsGrid.appendChild(btn);
    });
  
    this.updateProgress();
  }

  showHint() {
    const task = this.getCurrentTask();
    const hintDisplay = document.getElementById("hintDisplay");
    hintDisplay.textContent = `💡 ${task.hint}`;
    hintDisplay.style.display = "block";
    this.score = Math.max(0, this.score - 2);
    this.updateScore();
  }

  checkAnswer(selectedAnswer) {
    const task = this.getCurrentTask();
    this.totalAttempts++;

    const optionButtons = document.querySelectorAll(".option-button");
    optionButtons.forEach((btn) => (btn.disabled = true));

    if (selectedAnswer === task.correct) {
      this.correctAnswers++;
      this.score += 10;
      this.showFeedback(true, "✅ Correct! Great job!");
      this.updateScore();

      setTimeout(() => {
        this.nextTask();
      }, 1500);
    } else {
      this.showFeedback(false, `❌ Not quite. The correct answer is: ${task.correct}`);
      this.score = Math.max(0, this.score - 3);
      this.updateScore();

      setTimeout(() => {
        this.nextTask();
      }, 2500);
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

  nextTask() {
    this.currentTaskIndex++;

    if (this.currentTaskIndex >= this.tasks.length) {
      this.endGame();
    } else {
      if (this.currentTaskIndex % 5 === 0) {
        this.level++;
        document.getElementById("level").textContent = this.level;
      }
      this.loadTask();
    }
  }

  updateScore() {
    document.getElementById("score").textContent = this.score;
  }

  updateProgress() {
    const progress = ((this.currentTaskIndex + 1) / this.tasks.length) * 100;
    document.getElementById("progressFill").style.width = `${progress}%`;
    document.getElementById("progressText").textContent = `${this.currentTaskIndex + 1}/${this.tasks.length}`;
    document.getElementById("taskNumber").textContent = this.currentTaskIndex + 1;
  }

  endGame() {
    document.getElementById("gamePlayArea").style.display = "none";
    document.getElementById("gameOverScreen").style.display = "block";

    // stop timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    const accuracy = Math.round((this.correctAnswers / this.totalAttempts) * 100);

    document.getElementById("finalScore").textContent = this.score;
    document.getElementById("tasksCompleted").textContent = this.correctAnswers;
    document.getElementById("accuracy").textContent = `${accuracy}%`;

    // Save to database
    if (window.saveGameResult) {
      const gameData = {
        score: this.score,
        difficulty: "medium",
        questionsAnswered: this.totalAttempts,
        correctAnswers: this.correctAnswers,
        accuracy: accuracy,
        hintsUsed: 0,
        timeTaken: this.elapsedSeconds,
      };
      window.saveGameResult("shopping-list", gameData);
    }
  }
}

let game;

function startGame() {
  document.getElementById("instructionsCard").style.display = "none";
  document.getElementById("gamePlayArea").style.display = "flex";

  game = new ShoppingListGame();
  game.loadTask();

  // start session timer
  game.sessionStartTs = Date.now();
  const timerEl = document.getElementById("gameTimer");
  game.timerInterval = setInterval(() => {
    game.elapsedSeconds = Math.floor((Date.now() - game.sessionStartTs) / 1000);
    // auto end at 300s
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

