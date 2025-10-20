// Word Scramble Game Logic

const scrambleWords = [
  {
    word: "COMPUTER",
    hint: "A device used for processing information and running programs",
    category: "Technology"
  },
  {
    word: "ELEPHANT",
    hint: "A large mammal with a trunk and big ears",
    category: "Animals"
  },
  {
    word: "BASKETBALL",
    hint: "A sport played with a round ball and hoops",
    category: "Sports"
  },
  {
    word: "MOUNTAIN",
    hint: "A very high natural elevation of land",
    category: "Geography"
  },
  {
    word: "BUTTERFLY",
    hint: "A colorful insect that flies and has wings",
    category: "Animals"
  },
  {
    word: "SANDWICH",
    hint: "Food made with bread and fillings",
    category: "Food"
  },
  {
    word: "RAINBOW",
    hint: "A colorful arc in the sky after rain",
    category: "Nature"
  },
  {
    word: "TELEPHONE",
    hint: "A device used to talk to people far away",
    category: "Technology"
  },
  {
    word: "ADVENTURE",
    hint: "An exciting or unusual experience",
    category: "General"
  },
  {
    word: "CHOCOLATE",
    hint: "A sweet treat made from cocoa beans",
    category: "Food"
  },
  {
    word: "FIREWORKS",
    hint: "Colorful explosions in the sky for celebrations",
    category: "Celebrations"
  },
  {
    word: "WATERFALL",
    hint: "Water falling from a high place",
    category: "Nature"
  },
  {
    word: "TREASURE",
    hint: "Valuable items hidden or buried",
    category: "General"
  },
  {
    word: "JOURNEY",
    hint: "A trip from one place to another",
    category: "Travel"
  },
  {
    word: "DIAMOND",
    hint: "A precious gemstone that is very hard",
    category: "Jewelry"
  }
];

class WordScrambleGame {
  constructor() {
    this.currentWordIndex = 0;
    this.score = 0;
    this.level = 1;
    this.correctAnswers = 0;
    this.totalAttempts = 0;
    this.words = this.shuffleArray([...scrambleWords]);
    this.currentWord = null;
    this.scrambledLetters = [];
    this.answerLetters = [];
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

  scrambleWord(word) {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters;
  }

  getCurrentWord() {
    return this.words[this.currentWordIndex];
  }

  loadWord() {
    this.currentWord = this.getCurrentWord();
    this.scrambledLetters = this.scrambleWord(this.currentWord.word);
    this.answerLetters = [];
    
    const taskContent = document.getElementById("taskContent");
    
    taskContent.innerHTML = `
      <div class="hint-section">
        <div class="hint-display">
          <span class="hint-label">💡 Hint:</span>
          <span class="hint-text">${this.currentWord.hint}</span>
        </div>
        <div class="category-badge">${this.currentWord.category}</div>
      </div>
      
      <div class="scramble-area">
        <div class="scrambled-letters" id="scrambledLetters">
          ${this.scrambledLetters.map((letter, index) => 
            `<span class="letter-tile" data-letter="${letter}" data-index="${index}">${letter}</span>`
          ).join('')}
        </div>
        
        <div class="answer-area">
          <div class="answer-letters" id="answerLetters"></div>
          <div class="clear-answer" onclick="game.clearAnswer()">Clear</div>
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="submit-button" onclick="game.checkAnswer()">Submit Answer</button>
        <button class="shuffle-button" onclick="game.shuffleLetters()">Shuffle Letters</button>
      </div>
    `;

    this.setupLetterInteraction();
    this.updateProgress();
  }

  setupLetterInteraction() {
    const letterTiles = document.querySelectorAll('.letter-tile');
    const answerArea = document.getElementById('answerLetters');
    
    letterTiles.forEach(tile => {
      tile.addEventListener('click', () => {
        this.moveLetterToAnswer(tile);
      });
    });
  }

  moveLetterToAnswer(letterTile) {
    if (letterTile.classList.contains('used')) return;
    
    const letter = letterTile.dataset.letter;
    this.answerLetters.push(letter);
    
    // Add to answer area
    const answerDiv = document.getElementById('answerLetters');
    const answerTile = document.createElement('span');
    answerTile.className = 'answer-letter-tile';
    answerTile.textContent = letter;
    answerTile.onclick = () => this.moveLetterBack(answerTile, letterTile);
    answerDiv.appendChild(answerTile);
    
    // Mark as used
    letterTile.classList.add('used');
    letterTile.style.opacity = '0.3';
    
    // Update submit button state
    this.updateSubmitButton();
  }

  moveLetterBack(answerTile, originalTile) {
    // Remove from answer
    answerTile.remove();
    this.answerLetters.pop();
    
    // Restore original tile
    originalTile.classList.remove('used');
    originalTile.style.opacity = '1';
    
    // Update submit button state
    this.updateSubmitButton();
  }

  clearAnswer() {
    const answerDiv = document.getElementById('answerLetters');
    answerDiv.innerHTML = '';
    
    // Restore all letter tiles
    const letterTiles = document.querySelectorAll('.letter-tile');
    letterTiles.forEach(tile => {
      tile.classList.remove('used');
      tile.style.opacity = '1';
    });
    
    this.answerLetters = [];
    this.updateSubmitButton();
  }

  shuffleLetters() {
    this.scrambledLetters = this.scrambleWord(this.currentWord.word);
    const scrambledDiv = document.getElementById('scrambledLetters');
    scrambledDiv.innerHTML = this.scrambledLetters.map((letter, index) => 
      `<span class="letter-tile ${document.querySelector(`[data-index="${index}"]`)?.classList.contains('used') ? 'used' : ''}" 
             data-letter="${letter}" 
             data-index="${index}" 
             style="opacity: ${document.querySelector(`[data-index="${index}"]`)?.classList.contains('used') ? '0.3' : '1'}">${letter}</span>`
    ).join('');
    
    this.setupLetterInteraction();
  }

  updateSubmitButton() {
    const submitBtn = document.querySelector('.submit-button');
    if (this.answerLetters.length === this.currentWord.word.length) {
      submitBtn.disabled = false;
      submitBtn.classList.add('ready');
    } else {
      submitBtn.disabled = true;
      submitBtn.classList.remove('ready');
    }
  }

  checkAnswer() {
    const userAnswer = this.answerLetters.join('');
    this.totalAttempts++;

    if (userAnswer === this.currentWord.word) {
      this.correctAnswers++;
      this.score += 10;
      this.showFeedback(true, `✅ Correct! "${this.currentWord.word}" is right!`);
      this.updateScore();

      setTimeout(() => {
        this.nextWord();
      }, 2000);
    } else {
      this.showFeedback(false, `❌ Not quite. The correct word is: "${this.currentWord.word}"`);
      this.score = Math.max(0, this.score - 3);
      this.updateScore();

      setTimeout(() => {
        this.nextWord();
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

  nextWord() {
    this.currentWordIndex++;

    if (this.currentWordIndex >= this.words.length) {
      this.endGame();
    } else {
      if (this.currentWordIndex % 5 === 0) {
        this.level++;
        document.getElementById("level").textContent = this.level;
      }
      this.loadWord();
    }
  }

  updateScore() {
    document.getElementById("score").textContent = this.score;
  }

  updateProgress() {
    const progress = ((this.currentWordIndex + 1) / this.words.length) * 100;
    document.getElementById("progressFill").style.width = `${progress}%`;
    document.getElementById("progressText").textContent = `${this.currentWordIndex + 1}/${this.words.length}`;
    document.getElementById("taskNumber").textContent = this.currentWordIndex + 1;
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
    document.getElementById("wordsCompleted").textContent = this.correctAnswers;
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
      window.saveGameResult("word_scramble", gameData);
    }
  }
}

let game;

function startGame() {
  document.getElementById("instructionsCard").style.display = "none";
  document.getElementById("gamePlayArea").style.display = "flex";

  game = new WordScrambleGame();
  game.loadWord();

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
