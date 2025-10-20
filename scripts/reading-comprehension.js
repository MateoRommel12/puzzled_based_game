// Reading Comprehension Game Logic

const readingPassages = [
  {
    title: "The Solar System",
    passage: "Our solar system consists of eight planets that orbit around the Sun. The four inner planets—Mercury, Venus, Earth, and Mars—are rocky planets with solid surfaces. The four outer planets—Jupiter, Saturn, Uranus, and Neptune—are gas giants with thick atmospheres. Earth is the only planet known to support life, thanks to its perfect distance from the Sun and the presence of water. The Sun is a star that provides light and heat to all the planets in our solar system.",
    questions: [
      {
        question: "How many planets are in our solar system?",
        options: ["Seven", "Eight", "Nine", "Ten"],
        correct: "Eight",
        explanation: "The passage clearly states that our solar system consists of eight planets."
      },
      {
        question: "What type of planets are Mercury, Venus, Earth, and Mars?",
        options: ["Gas giants", "Rocky planets", "Ice planets", "Dwarf planets"],
        correct: "Rocky planets",
        explanation: "The passage explains that the four inner planets are rocky planets with solid surfaces."
      },
      {
        question: "Why is Earth special compared to other planets?",
        options: ["It is the largest planet", "It is the closest to the Sun", "It is the only planet with life", "It has the most moons"],
        correct: "It's the only planet with life",
        explanation: "The passage states that Earth is the only planet known to support life."
      },
      {
        question: "What provides light and heat to all planets?",
        options: ["The Moon", "The Sun", "Jupiter", "The stars"],
        correct: "The Sun",
        explanation: "The passage mentions that the Sun is a star that provides light and heat to all the planets."
      }
    ]
  },
  {
    title: "The Water Cycle",
    passage: "The water cycle is a continuous process that moves water throughout Earth's atmosphere, land, and oceans. It begins when the Sun heats up water in oceans, lakes, and rivers, causing it to evaporate and rise into the atmosphere as water vapor. As the water vapor cools down, it condenses to form clouds. When clouds become heavy with water droplets, precipitation occurs in the form of rain, snow, or hail. This water then flows back to rivers, lakes, and oceans, completing the cycle. The water cycle is essential for life on Earth as it distributes fresh water around the planet.",
    questions: [
      {
        question: "What causes water to evaporate in the water cycle?",
        options: ["Wind", "The Suns heat", "Cold temperatures", "Gravity"],
        correct: "The Suns heat",
        explanation: "The passage explains that the Sun heats up water, causing it to evaporate."
      },
      {
        question: "What happens when water vapor cools down?",
        options: ["It freezes", "It forms clouds", "It disappears", "It becomes heavier"],
        correct: "It forms clouds",
        explanation: "The passage states that when water vapor cools down, it condenses to form clouds."
      },
      {
        question: "What is precipitation?",
        options: ["Water evaporation", "Cloud formation", "Rain, snow, or hail", "Water vapor"],
        correct: "Rain, snow, or hail",
        explanation: "The passage defines precipitation as rain, snow, or hail that falls from clouds."
      },
      {
        question: "Why is the water cycle important?",
        options: ["It creates clouds", "It heats the Earth", "It distributes fresh water", "It causes storms"],
        correct: "It distributes fresh water",
        explanation: "The passage explains that the water cycle is essential for distributing fresh water around the planet."
      }
    ]
  },
  {
    title: "The Life of a Butterfly",
    passage: "Butterflies go through a fascinating transformation called metamorphosis, which has four distinct stages. The first stage is the egg, which the female butterfly lays on a plant leaf. After a few days, a tiny caterpillar emerges from the egg and begins eating the plant leaves. This is the larva stage, where the caterpillar grows rapidly and sheds its skin several times. When the caterpillar is fully grown, it forms a chrysalis or cocoon around itself. Inside this protective covering, the caterpillar transforms into a butterfly during the pupa stage. Finally, a beautiful adult butterfly emerges from the chrysalis, ready to find a mate and continue the cycle.",
    questions: [
      {
        question: "How many stages are in a butterfly's metamorphosis?",
        options: ["Two", "Three", "Four", "Five"],
        correct: "Four",
        explanation: "The passage clearly states that metamorphosis has four distinct stages."
      },
      {
        question: "What does the caterpillar do during the larva stage?",
        options: ["Sleeps", "Flies", "Eats plant leaves", "Makes a cocoon"],
        correct: "Eats plant leaves",
        explanation: "The passage explains that the caterpillar eats plant leaves and grows rapidly during the larva stage."
      },
      {
        question: "What is a chrysalis?",
        options: ["A butterfly egg", "A protective covering", "A plant leaf", "A butterfly wing"],
        correct: "A protective covering",
        explanation: "The passage describes the chrysalis as a protective covering that the caterpillar forms around itself."
      },
      {
        question: "What happens inside the chrysalis?",
        options: ["The caterpillar sleeps", "The caterpillar eats", "The caterpillar transforms into a butterfly", "The caterpillar dies"],
        correct: "The caterpillar transforms into a butterfly",
        explanation: "The passage explains that inside the chrysalis, the caterpillar transforms into a butterfly during the pupa stage."
      }
    ]
  }
];

class ReadingComprehensionGame {
  constructor() {
    this.currentPassageIndex = 0;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.level = 1;
    this.correctAnswers = 0;
    this.totalAttempts = 0;
    this.passages = this.shuffleArray([...readingPassages]);
    this.currentPassage = null;
    this.currentQuestion = null;
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

  getCurrentPassage() {
    return this.passages[this.currentPassageIndex];
  }

  getCurrentQuestion() {
    return this.currentPassage.questions[this.currentQuestionIndex];
  }

  loadPassage() {
    this.currentPassage = this.getCurrentPassage();
    this.currentQuestionIndex = 0;
    this.loadQuestion();
  }

  loadQuestion() {
    this.currentQuestion = this.getCurrentQuestion();
    const taskContent = document.getElementById("taskContent");
    
    taskContent.innerHTML = `
      <div class="passage-section">
        <h3 class="passage-title">${this.currentPassage.title}</h3>
        <div class="passage-text">
          ${this.currentPassage.passage}
        </div>
      </div>
      
      <div class="question-section">
        <h4 class="question-title">Question ${this.currentQuestionIndex + 1} of ${this.currentPassage.questions.length}</h4>
        <p class="question-text">${this.currentQuestion.question}</p>
        
        <div class="options-container">
          ${this.currentQuestion.options.map((option, index) => 
            `<button class="option-button" onclick="game.selectAnswer('${option}')">
              <span class="option-letter">${String.fromCharCode(65 + index)}</span>
              <span class="option-text">${option}</span>
            </button>`
          ).join('')}
        </div>
      </div>
    `;

    this.updateProgress();
  }

  selectAnswer(selectedAnswer) {
    this.totalAttempts++;
    
    const optionButtons = document.querySelectorAll(".option-button");
    optionButtons.forEach((btn) => (btn.disabled = true));

    if (selectedAnswer === this.currentQuestion.correct) {
      this.correctAnswers++;
      this.score += 10;
      this.showFeedback(true, `✅ Correct! ${this.currentQuestion.explanation}`);
      this.updateScore();

      // Highlight correct answer
      optionButtons.forEach(btn => {
        if (btn.textContent.trim().includes(selectedAnswer)) {
          btn.classList.add('correct');
        }
      });

      setTimeout(() => {
        this.nextQuestion();
      }, 2000);
    } else {
      this.showFeedback(false, `❌ Incorrect. ${this.currentQuestion.explanation}`);
      this.score = Math.max(0, this.score - 3);
      this.updateScore();

      // Highlight correct and incorrect answers
      optionButtons.forEach(btn => {
        if (btn.textContent.trim().includes(selectedAnswer)) {
          btn.classList.add('incorrect');
        }
        if (btn.textContent.trim().includes(this.currentQuestion.correct)) {
          btn.classList.add('correct');
        }
      });

      setTimeout(() => {
        this.nextQuestion();
      }, 3000);
    }
  }

  showFeedback(isCorrect, message) {
    const feedbackEl = document.getElementById("feedbackMessage");
    feedbackEl.innerHTML = `<div class="feedback-content">${message}</div>`;
    feedbackEl.className = `feedback-message ${isCorrect ? "correct" : "incorrect"}`;
    feedbackEl.style.display = "block";

    setTimeout(() => {
      feedbackEl.style.display = "none";
    }, 2500);
  }

  nextQuestion() {
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex >= this.currentPassage.questions.length) {
      this.nextPassage();
    } else {
      this.loadQuestion();
    }
  }

  nextPassage() {
    this.currentPassageIndex++;

    if (this.currentPassageIndex >= this.passages.length) {
      this.endGame();
    } else {
      if (this.currentPassageIndex % 2 === 0) {
        this.level++;
        document.getElementById("level").textContent = this.level;
      }
      this.loadPassage();
    }
  }

  updateScore() {
    document.getElementById("score").textContent = this.score;
  }

  updateProgress() {
    const totalQuestions = this.passages.length * 4; // Each passage has 4 questions
    const completedQuestions = this.currentPassageIndex * 4 + this.currentQuestionIndex + 1;
    const progress = (completedQuestions / totalQuestions) * 100;
    
    document.getElementById("progressFill").style.width = `${progress}%`;
    document.getElementById("progressText").textContent = `${completedQuestions}/${totalQuestions}`;
    document.getElementById("taskNumber").textContent = completedQuestions;
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
    document.getElementById("questionsCompleted").textContent = this.correctAnswers;
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
      window.saveGameResult("reading_comprehension", gameData);
    }
  }
}

let game;

function startGame() {
  document.getElementById("instructionsCard").style.display = "none";
  document.getElementById("gamePlayArea").style.display = "flex";

  game = new ReadingComprehensionGame();
  game.loadPassage();

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
