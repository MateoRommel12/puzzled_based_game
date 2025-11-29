  // Budget Manager Game Logic

  const budgetScenarios = [
    // Basic Addition/Subtraction
    {
      type: "spending",
      scenario: "You have $20 allowance. You want to buy a book for $8.",
      question: "How much money will you have left?",
      correct: "$12",
      options: ["$12", "$10", "$15", "$8"],
      explanation: "20 - 8 = 12. Always subtract spending from your total.",
      wallet: 20
    },
    {
      type: "spending",
      scenario: "You have $15. You buy snacks for $3 and a drink for $2.",
      question: "How much money remains?",
      correct: "$10",
      options: ["$10", "$12", "$8", "$13"],
      explanation: "15 - 3 - 2 = 10. Add all expenses first, then subtract.",
      wallet: 15
    },

    // Savings Goals
    {
      type: "saving",
      scenario: "You want to save $50 for a new game. You have $20.",
      question: "How much more do you need to save?",
      correct: "$30",
      options: ["$30", "$35", "$25", "$40"],
      explanation: "50 - 20 = 30. Goal minus current savings equals needed amount.",
      wallet: 20
    },
    {
      type: "saving",
      scenario: "You get $10 allowance each week. You want to save $60.",
      question: "How many weeks to reach your goal?",
      correct: "6 weeks",
      options: ["6 weeks", "5 weeks", "7 weeks", "8 weeks"],
      explanation: "60 ÷ 10 = 6. Divide goal by weekly savings.",
      wallet: 0
    },

    // Discounts & Deals
    {
      type: "discount",
      scenario: "A toy costs $40. It's 25% off.",
      question: "How much will you save?",
      correct: "$10",
      options: ["$10", "$15", "$8", "$12"],
      explanation: "40 × 0.25 = 10. Multiply price by decimal discount (25% = 0.25).",
      wallet: 50
    },
    {
      type: "discount",
      scenario: "Shirt is $30 with 50% off. How much do you pay?",
      question: "What's the final price?",
      correct: "$15",
      options: ["$15", "$20", "$10", "$25"],
      explanation: "30 × 0.50 = 15 saved, or 30 ÷ 2 = 15 to pay.",
      wallet: 30
    },

    // Budget Planning
    {
      type: "planning",
      scenario: "Weekly budget: $25. You spent $8 on Monday, $6 on Tuesday.",
      question: "How much left for the rest of the week?",
      correct: "$11",
      options: ["$11", "$13", "$9", "$15"],
      explanation: "25 - 8 - 6 = 11. Track all expenses during the period.",
      wallet: 25
    },
    {
      type: "planning",
      scenario: "You earn $12 from chores, get $8 allowance. You want to buy a $25 game.",
      question: "Can you afford it?",
      correct: "No, need $5 more",
      options: ["No, need $5 more", "Yes, exactly", "No, need $10 more", "Yes, with $5 left"],
      explanation: "12 + 8 = 20. You need 25, so 25 - 20 = 5 more needed.",
      wallet: 20
    },

    // Multiple Items
    {
      type: "multiple",
      scenario: "You buy 3 candy bars at $2 each.",
      question: "What's the total cost?",
      correct: "$6",
      options: ["$6", "$5", "$8", "$9"],
      explanation: "3 × 2 = 6. Multiply quantity by unit price.",
      wallet: 10
    },
    {
      type: "multiple",
      scenario: "Movie ticket: $10, popcorn: $5, drink: $3.",
      question: "Total cost for movies?",
      correct: "$18",
      options: ["$18", "$15", "$20", "$16"],
      explanation: "10 + 5 + 3 = 18. Add all items together.",
      wallet: 25
    },

    // Change Calculation
    {
      type: "change",
      scenario: "Item costs $7. You pay with a $10 bill.",
      question: "How much change do you get?",
      correct: "$3",
      options: ["$3", "$2", "$4", "$5"],
      explanation: "10 - 7 = 3. Subtract cost from payment.",
      wallet: 10
    },
    {
      type: "change",
      scenario: "You buy items totaling $23. You pay with $30.",
      question: "What's your change?",
      correct: "$7",
      options: ["$7", "$6", "$8", "$5"],
      explanation: "30 - 23 = 7. Always check your change!",
      wallet: 30
    }
  ];

  class BudgetManagerGame {
    constructor() {
      this.currentScenarioIndex = 0;
      this.score = 0;
      this.totalSaved = 0;
      this.correctAnswers = 0;
      this.totalAttempts = 0;
      this.scenarios = this.shuffleArray([...budgetScenarios]);
      this.currentWallet = 0;
      // Session timer
      this.sessionStartTs = null;
      this.timerInterval = null;
      this.elapsedSeconds = 0;
      // Hint tracking
      this.hintsUsed = 0;
      this.currentScenarioHintShown = false;
    }

    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    getCurrentScenario() {
      return this.scenarios[this.currentScenarioIndex];
    }

    loadScenario() {
      const scenario = this.getCurrentScenario();
      const budgetContent = document.getElementById("budgetContent");
      const budgetType = document.getElementById("budgetType");
    
      // Reset hint tracking for new scenario
      this.currentScenarioHintShown = false;
    
      // Update wallet
      this.currentWallet = scenario.wallet;
      this.updateWallet();
    
      // Update type badge
      budgetType.textContent = `${this.getTypeEmoji(scenario.type)} ${this.getTypeName(scenario.type)}`;
      budgetType.style.background = this.getTypeColor(scenario.type);
    
      // Display scenario
      budgetContent.innerHTML = `
        <div class="scenario-display">
          <div class="wallet-display">
            💵 Current Wallet: <strong>$${scenario.wallet}</strong>
          </div>
          <div class="scenario-text">${scenario.scenario}</div>
        </div>
        <p class="scenario-question">${scenario.question}</p>
        <div class="options-grid" id="optionsGrid"></div>
        <button class="hint-button" onclick="game.showExplanation(true)">💡 Show Explanation</button>
        <div class="explanation-display" id="explanationDisplay" style="display:none;"></div>
      `;
    
      // Display options - SHUFFLE THEM HERE!
      const optionsGrid = document.getElementById("optionsGrid");
      const shuffledOptions = this.shuffleArray([...scenario.options]); // Create shuffled copy
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
        spending: "💵",
        saving: "🏦",
        discount: "🏷️",
        planning: "📊",
        multiple: "🛒",
        change: "💱"
      };
      return emojis[type] || "💰";
    }

    getTypeName(type) {
      const names = {
        spending: "Spending",
        saving: "Saving Goal",
        discount: "Discount Deal",
        planning: "Budget Planning",
        multiple: "Multiple Items",
        change: "Making Change"
      };
      return names[type] || "Budget Challenge";
    }

    getTypeColor(type) {
      const colors = {
        spending: "linear-gradient(135deg, #ef4444, #f59e0b)",
        saving: "linear-gradient(135deg, #10b981, #059669)",
        discount: "linear-gradient(135deg, #8b5cf6, #ec4899)",
        planning: "linear-gradient(135deg, #3b82f6, #06b6d4)",
        multiple: "linear-gradient(135deg, #f59e0b, #eab308)",
        change: "linear-gradient(135deg, #06b6d4, #0891b2)"
      };
      return colors[type] || "linear-gradient(135deg, #667eea, #764ba2)";
    }

    showExplanation(userInitiated = false) {
      const scenario = this.getCurrentScenario();
      const explanationDisplay = document.getElementById("explanationDisplay");
      
      // Only track hint if user clicked the button (not auto-shown on wrong answer)
      if (userInitiated && !this.currentScenarioHintShown) {
        this.hintsUsed++;
        this.currentScenarioHintShown = true;
      }
      
      explanationDisplay.innerHTML = `💡 <strong>How to solve:</strong> ${scenario.explanation}`;
      explanationDisplay.style.display = "block";
      this.score = Math.max(0, this.score - 3);
      this.updateScore();
    }

    checkAnswer(selectedAnswer) {
      const scenario = this.getCurrentScenario();
      this.totalAttempts++;

      const optionButtons = document.querySelectorAll(".option-button");
      optionButtons.forEach((btn) => (btn.disabled = true));

      if (selectedAnswer === scenario.correct) {
        this.correctAnswers++;
        this.score += 20;
        this.totalSaved += 5;
        this.showFeedback(true, "✅ Perfect! You made the right decision!");
        this.updateScore();

        setTimeout(() => {
          this.nextScenario();
        }, 1500);
      } else {
        this.showFeedback(false, `❌ Not quite. The correct answer is: ${scenario.correct}`);
        this.score = Math.max(0, this.score - 5);
        this.updateScore();
        this.showExplanation();

        setTimeout(() => {
          this.nextScenario();
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

    nextScenario() {
      this.currentScenarioIndex++;

      if (this.currentScenarioIndex >= this.scenarios.length) {
        this.endGame();
      } else {
        this.loadScenario();
      }
    }

    updateScore() {
      document.getElementById("score").textContent = this.score;
    }

    updateWallet() {
      document.getElementById("wallet").textContent = `$${this.currentWallet}`;
    }

    updateProgress() {
      const progress = ((this.currentScenarioIndex + 1) / this.scenarios.length) * 100;
      document.getElementById("progressFill").style.width = `${progress}%`;
      document.getElementById("progressText").textContent = `${this.currentScenarioIndex + 1}/${this.scenarios.length}`;
      document.getElementById("scenarioNumber").textContent = this.currentScenarioIndex + 1;
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
      document.getElementById("moneySaved").textContent = `$${this.totalSaved}`;
      document.getElementById("accuracy").textContent = `${accuracy}%`;

      // Save to database
      if (window.saveGameResult) {
        const gameData = {
          score: this.score,
          difficulty: "medium",
          questionsAnswered: this.totalAttempts,
          correctAnswers: this.correctAnswers,
          accuracy: accuracy,
          hintsUsed: this.hintsUsed || 0,
          timeTaken: this.elapsedSeconds,
        };
        window.saveGameResult("budget-manager", gameData);
      }
    }
  }

  let game;

  function startGame() {
    document.getElementById("instructionsCard").style.display = "none";
    document.getElementById("gamePlayArea").style.display = "flex";

    game = new BudgetManagerGame();
    game.loadScenario();

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

