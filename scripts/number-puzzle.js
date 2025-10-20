// Number Puzzle Game Logic

const numberPuzzles = [
  // Number Sequence Puzzles
  {
    type: "sequence",
    question: "Complete the sequence: 2, 4, 8, 16, ?",
    options: ["24", "32", "20", "28"],
    correct: "32",
    explanation: "Each number is doubled: 2×2=4, 4×2=8, 8×2=16, 16×2=32"
  },
  {
    type: "sequence",
    question: "What comes next: 1, 4, 9, 16, ?",
    options: ["20", "25", "24", "18"],
    correct: "25",
    explanation: "These are perfect squares: 1²=1, 2²=4, 3²=9, 4²=16, 5²=25"
  },
  {
    type: "sequence",
    question: "Complete the pattern: 5, 10, 20, 40, ?",
    options: ["60", "80", "70", "50"],
    correct: "80",
    explanation: "Each number is doubled: 5×2=10, 10×2=20, 20×2=40, 40×2=80"
  },
  {
    type: "sequence",
    question: "What's the next number: 1, 1, 2, 3, 5, ?",
    options: ["6", "7", "8", "9"],
    correct: "8",
    explanation: "Fibonacci sequence: each number is the sum of the two previous ones"
  },
  {
    type: "sequence",
    question: "Complete: 3, 6, 12, 24, ?",
    options: ["36", "48", "30", "42"],
    correct: "48",
    explanation: "Each number is doubled: 3×2=6, 6×2=12, 12×2=24, 24×2=48"
  },

  // Arithmetic Puzzles
  {
    type: "arithmetic",
    question: "If 7 × ? = 49, what is the missing number?",
    options: ["6", "7", "8", "9"],
    correct: "7",
    explanation: "7 × 7 = 49. The missing number is 7."
  },
  {
    type: "arithmetic",
    question: "What is 15 + ? = 23?",
    options: ["6", "7", "8", "9"],
    correct: "8",
    explanation: "15 + 8 = 23. The missing number is 8."
  },
  {
    type: "arithmetic",
    question: "If 36 ÷ ? = 9, what is the missing number?",
    options: ["3", "4", "5", "6"],
    correct: "4",
    explanation: "36 ÷ 4 = 9. The missing number is 4."
  },
  {
    type: "arithmetic",
    question: "What is 25 - ? = 13?",
    options: ["10", "11", "12", "13"],
    correct: "12",
    explanation: "25 - 12 = 13. The missing number is 12."
  },
  {
    type: "arithmetic",
    question: "If ? × 6 = 54, what is the missing number?",
    options: ["7", "8", "9", "10"],
    correct: "9",
    explanation: "9 × 6 = 54. The missing number is 9."
  },

  // Logic Puzzles
  {
    type: "logic",
    question: "In a row of 5 boxes, the first box has 3 balls, each next box has 2 more balls than the previous. How many balls are in the 4th box?",
    options: ["7", "8", "9", "10"],
    correct: "9",
    explanation: "Box 1: 3 balls, Box 2: 5 balls, Box 3: 7 balls, Box 4: 9 balls"
  },
  {
    type: "logic",
    question: "If you have 12 apples and give away 3, then buy 5 more, how many apples do you have?",
    options: ["12", "13", "14", "15"],
    correct: "14",
    explanation: "12 - 3 + 5 = 14 apples"
  },
  {
    type: "logic",
    question: "A number is doubled and then 4 is added. The result is 18. What was the original number?",
    options: ["6", "7", "8", "9"],
    correct: "7",
    explanation: "If x is the number: 2x + 4 = 18, so 2x = 14, x = 7"
  },
  {
    type: "logic",
    question: "How many sides does a hexagon have?",
    options: ["5", "6", "7", "8"],
    correct: "6",
    explanation: "A hexagon has 6 sides. 'Hexa' means six."
  },
  {
    type: "logic",
    question: "If today is Monday and it's been 10 days since it last rained, what day did it rain?",
    options: ["Thursday", "Friday", "Saturday", "Sunday"],
    correct: "Friday",
    explanation: "10 days ago from Monday would be Friday (counting backwards)"
  }
];

class NumberPuzzleGame {
  constructor() {
    this.currentPuzzleIndex = 0;
    this.score = 0;
    this.level = 1;
    this.correctAnswers = 0;
    this.totalAttempts = 0;
    this.puzzles = this.shuffleArray([...numberPuzzles]);
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

  getCurrentPuzzle() {
    return this.puzzles[this.currentPuzzleIndex];
  }

  loadPuzzle() {
    const puzzle = this.getCurrentPuzzle();
    const taskContent = document.getElementById("taskContent");
    const taskType = document.getElementById("taskType");

    // Update task type badge
    if (puzzle.type === "sequence") {
      taskType.textContent = "🔢 Number Sequence";
      taskType.style.background = "linear-gradient(135deg, #3b82f6, #8b5cf6)";
    } else if (puzzle.type === "arithmetic") {
      taskType.textContent = "➕ Arithmetic";
      taskType.style.background = "linear-gradient(135deg, #10b981, #06b6d4)";
    } else if (puzzle.type === "logic") {
      taskType.textContent = "🧠 Logic Puzzle";
      taskType.style.background = "linear-gradient(135deg, #f59e0b, #ef4444)";
    }

    // Display puzzle
    taskContent.innerHTML = `
      <div class="puzzle-container">
        <div class="puzzle-question">
          <h3>${puzzle.question}</h3>
        </div>
        
        <div class="options-grid">
          ${puzzle.options.map((option, index) => 
            `<button class="option-button" onclick="game.checkAnswer('${option}')">
              <span class="option-number">${index + 1}</span>
              <span class="option-value">${option}</span>
            </button>`
          ).join('')}
        </div>
      </div>
    `;

    this.updateProgress();
  }

  checkAnswer(selectedAnswer) {
    const puzzle = this.getCurrentPuzzle();
    this.totalAttempts++;

    const optionButtons = document.querySelectorAll(".option-button");
    optionButtons.forEach((btn) => (btn.disabled = true));

    if (selectedAnswer === puzzle.correct) {
      this.correctAnswers++;
      this.score += 10;
      this.showFeedback(true, `✅ Correct! ${puzzle.explanation}`);
      this.updateScore();

      // Highlight correct answer
      optionButtons.forEach(btn => {
        if (btn.textContent.trim().includes(selectedAnswer)) {
          btn.classList.add('correct');
        }
      });

      setTimeout(() => {
        this.nextPuzzle();
      }, 2000);
    } else {
      this.showFeedback(false, `❌ Not quite. ${puzzle.explanation}`);
      this.score = Math.max(0, this.score - 3);
      this.updateScore();

      // Highlight correct and incorrect answers
      optionButtons.forEach(btn => {
        if (btn.textContent.trim().includes(selectedAnswer)) {
          btn.classList.add('incorrect');
        }
        if (btn.textContent.trim().includes(puzzle.correct)) {
          btn.classList.add('correct');
        }
      });

      setTimeout(() => {
        this.nextPuzzle();
      }, 3000);
    }
  }

  showFeedback(isCorrect, message) {
    const feedbackEl = document.getElementById("feedbackMessage");
    feedbackEl.textContent = message;
    feedbackEl.className = `feedback-message ${isCorrect ? "correct" : "incorrect"}`;
    feedbackEl.style.display = "block";

    setTimeout(() => {
      feedbackEl.style.display = "none";
    }, 2500);
  }

  nextPuzzle() {
    this.currentPuzzleIndex++;

    if (this.currentPuzzleIndex >= this.puzzles.length) {
      this.endGame();
    } else {
      if (this.currentPuzzleIndex % 5 === 0) {
        this.level++;
        document.getElementById("level").textContent = this.level;
      }
      this.loadPuzzle();
    }
  }

  updateScore() {
    document.getElementById("score").textContent = this.score;
  }

  updateProgress() {
    const progress = ((this.currentPuzzleIndex + 1) / this.puzzles.length) * 100;
    document.getElementById("progressFill").style.width = `${progress}%`;
    document.getElementById("progressText").textContent = `${this.currentPuzzleIndex + 1}/${this.puzzles.length}`;
    document.getElementById("taskNumber").textContent = this.currentPuzzleIndex + 1;
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
    document.getElementById("puzzlesCompleted").textContent = this.correctAnswers;
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
      window.saveGameResult("number-puzzle", gameData);
    }
  }
}

let game;

function startGame() {
  document.getElementById("instructionsCard").style.display = "none";
  document.getElementById("gamePlayArea").style.display = "flex";

  game = new NumberPuzzleGame();
  game.loadPuzzle();

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
