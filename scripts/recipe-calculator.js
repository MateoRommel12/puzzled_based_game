// Recipe Calculator Game Logic

const recipeChallenges = [
  // Scaling Recipes
  {
    type: "scaling",
    recipe: "Chocolate Chip Cookies",
    servings: "Original: 12 cookies",
    scenario: "Recipe calls for 2 cups of flour for 12 cookies.",
    question: "How much flour for 24 cookies (double)?",
    correct: "4 cups",
    options: ["4 cups", "3 cups", "5 cups", "2 cups"],
    explanation: "Double the recipe = double all ingredients. 2 × 2 = 4 cups.",
    image: "🍪"
  },
  {
    type: "scaling",
    recipe: "Pancakes",
    servings: "Original: 4 servings",
    scenario: "Recipe needs 3 eggs for 4 servings.",
    question: "How many eggs for 8 servings (double)?",
    correct: "6 eggs",
    options: ["6 eggs", "5 eggs", "7 eggs", "4 eggs"],
    explanation: "8 servings ÷ 4 servings = 2. So 3 × 2 = 6 eggs.",
    image: "🥞"
  },
  {
    type: "scaling",
    recipe: "Lemonade",
    servings: "Original: 4 glasses",
    scenario: "Recipe uses 2 lemons for 4 glasses.",
    question: "How many lemons for 2 glasses (half)?",
    correct: "1 lemon",
    options: ["1 lemon", "2 lemons", "3 lemons", "4 lemons"],
    explanation: "Half the recipe = half the ingredients. 2 ÷ 2 = 1 lemon.",
    image: "🍋"
  },

  // Fractions
  {
    type: "fractions",
    recipe: "Brownies",
    servings: "Making: 1 pan",
    scenario: "Recipe needs 1/2 cup butter + 1/4 cup butter.",
    question: "What's the total butter needed?",
    correct: "3/4 cup",
    options: ["3/4 cup", "1/2 cup", "1 cup", "1/4 cup"],
    explanation: "1/2 + 1/4 = 2/4 + 1/4 = 3/4. Convert to same denominator.",
    image: "🍫"
  },
  {
    type: "fractions",
    recipe: "Smoothie",
    servings: "Making: 2 servings",
    scenario: "You need 1/3 cup yogurt per serving.",
    question: "How much yogurt for 2 servings?",
    correct: "2/3 cup",
    options: ["2/3 cup", "1/3 cup", "1 cup", "1/2 cup"],
    explanation: "1/3 × 2 = 2/3. Multiply fraction by number of servings.",
    image: "🥤"
  },

  // Measurement Conversion
  {
    type: "conversion",
    recipe: "Pasta Sauce",
    servings: "Conversion needed",
    scenario: "Recipe calls for 2 cups of tomato sauce.",
    question: "How many pints? (2 cups = 1 pint)",
    correct: "1 pint",
    options: ["1 pint", "2 pints", "3 pints", "4 pints"],
    explanation: "2 cups = 1 pint. Know your conversions!",
    image: "🍝"
  },
  {
    type: "conversion",
    recipe: "Fruit Salad",
    servings: "Conversion needed",
    scenario: "You need 4 cups of mixed fruit.",
    question: "How many quarts? (4 cups = 1 quart)",
    correct: "1 quart",
    options: ["1 quart", "2 quarts", "3 quarts", "4 quarts"],
    explanation: "4 cups = 1 quart. This helps with larger quantities.",
    image: "🍉"
  },

  // Timing Calculations
  {
    type: "timing",
    recipe: "Roasted Chicken",
    servings: "Cooking time",
    scenario: "Chicken needs 20 minutes per pound. You have a 3-pound chicken.",
    question: "How long to cook?",
    correct: "60 minutes",
    options: ["60 minutes", "40 minutes", "80 minutes", "50 minutes"],
    explanation: "20 minutes × 3 pounds = 60 minutes (1 hour).",
    image: "🍗"
  },
  {
    type: "timing",
    recipe: "Cookies",
    servings: "Baking time",
    scenario: "Cookies bake 12 minutes. You have 3 batches.",
    question: "Total baking time?",
    correct: "36 minutes",
    options: ["36 minutes", "30 minutes", "24 minutes", "48 minutes"],
    explanation: "12 minutes × 3 batches = 36 minutes total.",
    image: "🍪"
  },

  // Portions
  {
    type: "portions",
    recipe: "Pizza",
    servings: "Dividing portions",
    scenario: "A pizza has 8 slices. You have 4 people.",
    question: "How many slices per person?",
    correct: "2 slices",
    options: ["2 slices", "3 slices", "1 slice", "4 slices"],
    explanation: "8 slices ÷ 4 people = 2 slices each.",
    image: "🍕"
  },
  {
    type: "portions",
    recipe: "Cake",
    servings: "Dividing portions",
    scenario: "Cake serves 12. You cut it into equal pieces for 6 people.",
    question: "How many servings per person?",
    correct: "2 servings",
    options: ["2 servings", "3 servings", "1 serving", "4 servings"],
    explanation: "12 servings ÷ 6 people = 2 servings per person.",
    image: "🎂"
  },

  // Temperature
  {
    type: "temperature",
    recipe: "Baking Bread",
    servings: "Temperature check",
    scenario: "Bread bakes at 350°F. Your oven shows 325°F.",
    question: "How many degrees to increase?",
    correct: "25°F",
    options: ["25°F", "50°F", "15°F", "35°F"],
    explanation: "350 - 325 = 25. Always check oven temperature!",
    image: "🍞"
  },
  {
    type: "temperature",
    recipe: "Grilled Cheese",
    servings: "Temperature adjustment",
    scenario: "Recipe says medium heat (300°F). You're at 250°F.",
    question: "Increase by how much?",
    correct: "50°F",
    options: ["50°F", "25°F", "75°F", "100°F"],
    explanation: "300 - 250 = 50°F increase needed.",
    image: "🧀"
  }
];

class RecipeCalculatorGame {
  constructor() {
    this.currentChallengeIndex = 0;
    this.score = 0;
    this.correctAnswers = 0;
    this.totalAttempts = 0;
    this.challenges = this.shuffleArray([...recipeChallenges]);
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

  getCurrentChallenge() {
    return this.challenges[this.currentChallengeIndex];
  }

  loadChallenge() {
    const challenge = this.getCurrentChallenge();
    const recipeContent = document.getElementById("recipeContent");
    const recipeType = document.getElementById("recipeType");

    // Update type badge
    recipeType.textContent = `${this.getTypeEmoji(challenge.type)} ${this.getTypeName(challenge.type)}`;
    recipeType.style.background = this.getTypeColor(challenge.type);

    // Display challenge
    recipeContent.innerHTML = `
      <div class="recipe-display">
        <div class="recipe-icon">${challenge.image}</div>
        <div class="recipe-name">${challenge.recipe}</div>
        <div class="recipe-servings">${challenge.servings}</div>
      </div>
      <div class="scenario-box">
        <div class="scenario-label">Scenario:</div>
        <div class="scenario-text">${challenge.scenario}</div>
      </div>
      <p class="challenge-question">${challenge.question}</p>
      <div class="options-grid" id="optionsGrid"></div>
      <button class="hint-button" onclick="game.showExplanation()">💡 Show Solution</button>
      <div class="explanation-display" id="explanationDisplay" style="display:none;"></div>
    `;

    // Display options
    const optionsGrid = document.getElementById("optionsGrid");
    const shuffledOptions = this.shuffleArray([...challenge.options]); // Create shuffled copy
    shuffledOptions.forEach((option) => {
      const btn = document.createElement("button");
      btn.className = "option-button";
      btn.textContent = option;
      btn.onclick = () => this.checkAnswer(option);
      optionsGrid.appendChild(btn);
    });
  

    this.updateProgress();
  }

  getTypeEmoji(type) {
    const emojis = {
      scaling: "📏",
      fractions: "🧮",
      conversion: "⚖️",
      timing: "⏰",
      portions: "🍽️",
      temperature: "🌡️"
    };
    return emojis[type] || "🍳";
  }

  getTypeName(type) {
    const names = {
      scaling: "Scaling Recipe",
      fractions: "Fractions",
      conversion: "Conversion",
      timing: "Timing",
      portions: "Portions",
      temperature: "Temperature"
    };
    return names[type] || "Recipe Math";
  }

  getTypeColor(type) {
    const colors = {
      scaling: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
      fractions: "linear-gradient(135deg, #10b981, #059669)",
      conversion: "linear-gradient(135deg, #f59e0b, #eab308)",
      timing: "linear-gradient(135deg, #ef4444, #f59e0b)",
      portions: "linear-gradient(135deg, #8b5cf6, #ec4899)",
      temperature: "linear-gradient(135deg, #06b6d4, #3b82f6)"
    };
    return colors[type] || "linear-gradient(135deg, #667eea, #764ba2)";
  }

  showExplanation() {
    const challenge = this.getCurrentChallenge();
    const explanationDisplay = document.getElementById("explanationDisplay");
    explanationDisplay.innerHTML = `💡 <strong>Solution:</strong> ${challenge.explanation}`;
    explanationDisplay.style.display = "block";
    this.score = Math.max(0, this.score - 3);
    this.updateScore();
  }

  checkAnswer(selectedAnswer) {
    const challenge = this.getCurrentChallenge();
    this.totalAttempts++;

    const optionButtons = document.querySelectorAll(".option-button");
    optionButtons.forEach((btn) => (btn.disabled = true));

    if (selectedAnswer === challenge.correct) {
      this.correctAnswers++;
      this.score += 20;
      this.showFeedback(true, "✅ Perfect! You nailed the recipe math!");
      this.updateScore();

      setTimeout(() => {
        this.nextChallenge();
      }, 1500);
    } else {
      this.showFeedback(false, `❌ Not quite. The correct answer is: ${challenge.correct}`);
      this.score = Math.max(0, this.score - 5);
      this.updateScore();
      this.showExplanation();

      setTimeout(() => {
        this.nextChallenge();
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
    }, 2000);
  }

  nextChallenge() {
    this.currentChallengeIndex++;

    if (this.currentChallengeIndex >= this.challenges.length) {
      this.endGame();
    } else {
      this.loadChallenge();
    }
  }

  updateScore() {
    document.getElementById("score").textContent = this.score;
    document.getElementById("recipesCompleted").textContent = this.correctAnswers;
  }

  updateProgress() {
    const progress = ((this.currentChallengeIndex + 1) / this.challenges.length) * 100;
    document.getElementById("progressFill").style.width = `${progress}%`;
    document.getElementById("progressText").textContent = `${this.currentChallengeIndex + 1}/${this.challenges.length}`;
    document.getElementById("challengeNumber").textContent = this.currentChallengeIndex + 1;
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
    document.getElementById("recipesMastered").textContent = this.correctAnswers;
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
      window.saveGameResult("recipe-calculator", gameData);
    }
  }
}

let game;

function startGame() {
  document.getElementById("instructionsCard").style.display = "none";
  document.getElementById("gamePlayArea").style.display = "flex";

  game = new RecipeCalculatorGame();
  game.loadChallenge();

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

