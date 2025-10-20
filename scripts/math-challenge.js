// Math Challenge Game Logic

class MathChallengeGame {
  constructor() {
    this.currentProblemIndex = 0;
    this.score = 0;
    this.level = 1;
    this.correctAnswers = 0;
    this.totalAttempts = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.difficulty = 'easy';
    this.timeLeft = 30;
    this.timer = null;
    this.problems = [];
    this.currentProblem = null;
    // Session timer (ascending)
    this.sessionStartTs = null;
    this.sessionInterval = null;
    this.elapsedSeconds = 0;
  }

  generateProblems(difficulty) {
    this.problems = [];
    const count = 20;
    
    for (let i = 0; i < count; i++) {
      this.problems.push(this.generateProblem(difficulty));
    }
  }

  generateProblem(difficulty) {
    let problem;
    
    switch(difficulty) {
      case 'easy':
        problem = this.generateEasyProblem();
        break;
      case 'medium':
        problem = this.generateMediumProblem();
        break;
      case 'hard':
        problem = this.generateHardProblem();
        break;
    }
    
    return problem;
  }

  generateEasyProblem() {
    const operations = ['+', '-'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    if (operation === '+') {
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
      answer = num1 + num2;
    } else {
      num1 = Math.floor(Math.random() * 50) + 20;
      num2 = Math.floor(Math.random() * num1);
      answer = num1 - num2;
    }
    
    return {
      question: `${num1} ${operation} ${num2} = ?`,
      answer: answer,
      options: this.generateOptions(answer, 'easy')
    };
  }

  generateMediumProblem() {
    const operations = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    if (operation === '+') {
      num1 = Math.floor(Math.random() * 100) + 1;
      num2 = Math.floor(Math.random() * 100) + 1;
      answer = num1 + num2;
    } else if (operation === '-') {
      num1 = Math.floor(Math.random() * 100) + 50;
      num2 = Math.floor(Math.random() * num1);
      answer = num1 - num2;
    } else {
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      answer = num1 * num2;
    }
    
    return {
      question: `${num1} ${operation} ${num2} = ?`,
      answer: answer,
      options: this.generateOptions(answer, 'medium')
    };
  }

  generateHardProblem() {
    const operations = ['+', '-', '×', '÷'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    if (operation === '+') {
      num1 = Math.floor(Math.random() * 200) + 50;
      num2 = Math.floor(Math.random() * 200) + 50;
      answer = num1 + num2;
    } else if (operation === '-') {
      num1 = Math.floor(Math.random() * 200) + 100;
      num2 = Math.floor(Math.random() * num1);
      answer = num1 - num2;
    } else if (operation === '×') {
      num1 = Math.floor(Math.random() * 15) + 5;
      num2 = Math.floor(Math.random() * 15) + 5;
      answer = num1 * num2;
    } else {
      // Division - make sure it divides evenly
      num2 = Math.floor(Math.random() * 12) + 2;
      answer = Math.floor(Math.random() * 20) + 1;
      num1 = num2 * answer;
    }
    
    return {
      question: `${num1} ${operation} ${num2} = ?`,
      answer: answer,
      options: this.generateOptions(answer, 'hard')
    };
  }

  generateOptions(correctAnswer, difficulty) {
    const options = [correctAnswer];
    const range = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15;
    
    while (options.length < 4) {
      let option;
      if (Math.random() < 0.5) {
        option = correctAnswer + Math.floor(Math.random() * range) + 1;
      } else {
        option = Math.max(0, correctAnswer - Math.floor(Math.random() * range) - 1);
      }
      
      if (!options.includes(option)) {
        options.push(option);
      }
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    return options;
  }

  getCurrentProblem() {
    return this.problems[this.currentProblemIndex];
  }

  loadProblem() {
    this.currentProblem = this.getCurrentProblem();
    const taskContent = document.getElementById("taskContent");
    
    taskContent.innerHTML = `
      <div class="problem-container">
        <div class="problem-display">
          <h2 class="problem-question">${this.currentProblem.question}</h2>
        </div>
        
        <div class="options-grid">
          ${this.currentProblem.options.map((option, index) => 
            `<button class="option-button" onclick="game.selectAnswer(${option})">
              <span class="option-number">${index + 1}</span>
              <span class="option-value">${option}</span>
            </button>`
          ).join('')}
        </div>
      </div>
    `;

    this.updateProgress();
    this.startTimer();
  }

  selectAnswer(selectedAnswer) {
    this.totalAttempts++;
    this.stopTimer();
    
    const optionButtons = document.querySelectorAll(".option-button");
    optionButtons.forEach((btn) => (btn.disabled = true));

    if (selectedAnswer === this.currentProblem.answer) {
      this.correctAnswers++;
      this.streak++;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
      
      // Calculate score based on time left and streak
      let baseScore = 10;
      let timeBonus = Math.floor(this.timeLeft * 2);
      let streakBonus = Math.min(this.streak * 5, 50);
      
      this.score += baseScore + timeBonus + streakBonus;
      
      this.showFeedback(true, `✅ Correct! +${baseScore + timeBonus + streakBonus} points!`);
      this.updateScore();
      this.updateStreak();

      // Highlight correct answer
      optionButtons.forEach(btn => {
        if (parseInt(btn.querySelector('.option-value').textContent) === selectedAnswer) {
          btn.classList.add('correct');
        }
      });

      setTimeout(() => {
        this.nextProblem();
      }, 1500);
    } else {
      this.streak = 0;
      this.score = Math.max(0, this.score - 5);
      
      this.showFeedback(false, `❌ Incorrect. The answer is ${this.currentProblem.answer}`);
      this.updateScore();
      this.updateStreak();

      // Highlight correct and incorrect answers
      optionButtons.forEach(btn => {
        const value = parseInt(btn.querySelector('.option-value').textContent);
        if (value === selectedAnswer) {
          btn.classList.add('incorrect');
        }
        if (value === this.currentProblem.answer) {
          btn.classList.add('correct');
        }
      });

      setTimeout(() => {
        this.nextProblem();
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

  startTimer() {
    this.timeLeft = 30;
    this.updateTimerDisplay();
    
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateTimerDisplay();
      
      if (this.timeLeft <= 0) {
        this.stopTimer();
        this.timeOut();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  updateTimerDisplay() {
    const timerEl = document.getElementById("timer");
    timerEl.textContent = `${this.timeLeft}s`;
    
    if (this.timeLeft <= 10) {
      timerEl.classList.add('warning');
    } else {
      timerEl.classList.remove('warning');
    }
  }

  timeOut() {
    const optionButtons = document.querySelectorAll(".option-button");
    optionButtons.forEach((btn) => (btn.disabled = true));

    this.streak = 0;
    this.showFeedback(false, `⏰ Time's up! The answer was ${this.currentProblem.answer}`);
    this.updateStreak();

    // Highlight correct answer
    optionButtons.forEach(btn => {
      const value = parseInt(btn.querySelector('.option-value').textContent);
      if (value === this.currentProblem.answer) {
        btn.classList.add('correct');
      }
    });

    setTimeout(() => {
      this.nextProblem();
    }, 2000);
  }

  nextProblem() {
    this.currentProblemIndex++;

    if (this.currentProblemIndex >= this.problems.length) {
      this.endGame();
    } else {
      if (this.currentProblemIndex % 5 === 0) {
        this.level++;
        document.getElementById("level").textContent = this.level;
      }
      this.loadProblem();
    }
  }

  updateScore() {
    document.getElementById("score").textContent = this.score;
  }

  updateStreak() {
    document.getElementById("streak").textContent = this.streak;
  }

  updateProgress() {
    const progress = ((this.currentProblemIndex + 1) / this.problems.length) * 100;
    document.getElementById("progressFill").style.width = `${progress}%`;
    document.getElementById("progressText").textContent = `${this.currentProblemIndex + 1}/${this.problems.length}`;
    document.getElementById("taskNumber").textContent = this.currentProblemIndex + 1;
  }

  endGame() {
    this.stopTimer();
    document.getElementById("gamePlayArea").style.display = "none";
    document.getElementById("gameOverScreen").style.display = "block";

    const accuracy = Math.round((this.correctAnswers / this.totalAttempts) * 100);

    document.getElementById("finalScore").textContent = this.score;
    document.getElementById("problemsCompleted").textContent = this.correctAnswers;
    document.getElementById("accuracy").textContent = `${accuracy}%`;
    document.getElementById("bestStreak").textContent = this.bestStreak;
    document.getElementById("finalDifficulty").textContent = this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1);

    // Save to database
    if (window.saveGameResult) {
      const gameData = {
        score: this.score,
        difficulty: this.difficulty,
        questionsAnswered: this.totalAttempts,
        correctAnswers: this.correctAnswers,
        accuracy: accuracy,
        hintsUsed: 0,
        timeTaken: this.elapsedSeconds,
      };
      window.saveGameResult("math-challenge", gameData);
    }
  }
}

let game;
let selectedDifficulty = null;

function selectDifficulty(difficulty) {
  selectedDifficulty = difficulty;
  game = new MathChallengeGame();
  game.difficulty = difficulty;
  game.generateProblems(difficulty);
  
  // Update UI
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  document.querySelector(`[data-level="${difficulty}"]`).classList.add('selected');
  
  const startButton = document.getElementById('startButton');
  startButton.disabled = false;
  startButton.textContent = `Start ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Challenge`;
}

function startGame() {
  if (!selectedDifficulty) return;
  
  document.getElementById("instructionsCard").style.display = "none";
  document.getElementById("gamePlayArea").style.display = "flex";

  game.loadProblem();

  // Start ascending session timer
  game.sessionStartTs = Date.now();
  const timerEl = document.getElementById("gameTimer");
  game.sessionInterval = setInterval(() => {
    game.elapsedSeconds = Math.floor((Date.now() - game.sessionStartTs) / 1000);
    if (game.elapsedSeconds >= 300) {
      clearInterval(game.sessionInterval);
      game.sessionInterval = null;
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
  selectedDifficulty = null;
  game = null;
  
  // Reset UI
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  const startButton = document.getElementById('startButton');
  startButton.disabled = true;
  startButton.textContent = 'Select Difficulty First';
}
