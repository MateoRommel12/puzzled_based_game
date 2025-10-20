/**
 * Fill in the Blanks Game Logic
 * Drag and drop word completion game
 */

class FillBlanksGame {
    constructor() {
        this.gameId = null;
        this.questionId = null;
        this.passageData = null;
        this.wordChoices = [];
        this.correctAnswers = [];
        this.userAnswers = {};
        this.score = 0;
        this.timeLimit = 60;
        this.timeRemaining = 60;
        this.timer = null;
        this.gameStarted = false;
        this.gameCompleted = false;
        this.hintsUsed = 0;
        this.startTime = null;
        
        this.init();
    }

    init() {
        
        // Get game ID from URL or use default
        const urlParams = new URLSearchParams(window.location.search);
        this.gameId = urlParams.get('gameId') || 1; // Default to game ID 1
        
        this.loadGameData();
    }

    async loadGameData() {
        try {
            
            // Load fill-in-the-blanks game data
            const response = await fetch(`../api/fill-blanks.php?action=get-game&gameId=${this.gameId}`);
            const result = await response.json();
            
            if (result.success) {
                this.passageData = result.data;
                this.questionId = result.data.question_id;
                this.timeLimit = result.data.time_limit || 60;
                this.timeRemaining = this.timeLimit;
                
                this.setupGame();
            } else {
                console.error('[FillBlanksGame] Failed to load game data:', result.message);
                this.showError('Failed to load game data. Please try again.');
            }
        } catch (error) {
            console.error('[FillBlanksGame] Error loading game data:', error);
            this.showError('Error loading game. Please check your connection.');
        }
    }

    setupGame() {
        // Update time limit display
        document.getElementById('timeLimit').textContent = this.timeLimit;
        document.getElementById('timer').textContent = this.timeRemaining;
        
        // Setup hint if available
        if (this.passageData.hint) {
            document.getElementById('hintText').textContent = this.passageData.hint;
        }
        
    }

    startGame() {
        
        // Hide instructions and show game area
        document.getElementById('instructionsCard').style.display = 'none';
        document.getElementById('gamePlayArea').style.display = 'block';
        
        // Build the passage with blank spaces
        this.buildPassage();
        
        // Build the word bank
        this.buildWordBank();
        
        // Start timer
        this.startTimer();
        
        this.gameStarted = true;
        this.startTime = Date.now();
        
    }

    buildPassage() {
        const passageContainer = document.getElementById('passageText');
        const passageText = this.passageData.question_text;
        
        // Replace [BLANK] with draggable blank spaces
        let htmlContent = passageText.replace(/\[BLANK\]/g, (match, offset) => {
            const blankIndex = (passageText.substring(0, offset).match(/\[BLANK\]/g) || []).length;
            return `<span class="blank-space" data-blank-index="${blankIndex}" onclick="game.fillBlank(${blankIndex})"></span>`;
        });
        
        passageContainer.innerHTML = htmlContent;
        
        // Store correct answers
        this.correctAnswers = this.passageData.positions.map(pos => pos.blank_text);
        
    }

    buildWordBank() {
        const wordBankContainer = document.getElementById('wordBank');
        
        // Collect all unique word choices
        const allWords = new Set();
        this.passageData.positions.forEach(position => {
            position.choices.forEach(choice => {
                allWords.add(choice.choice_text);
            });
        });
        
        // Shuffle the words
        this.wordChoices = Array.from(allWords).sort(() => Math.random() - 0.5);
        
        // Build word bank HTML
        wordBankContainer.innerHTML = this.wordChoices.map((word, index) => `
            <div class="word-choice" data-word="${word}" data-choice-index="${index}" 
                 draggable="true" ondragstart="game.dragStart(event)" ondragend="game.dragEnd(event)">
                ${word}
            </div>
        `).join('');
        
    }

    dragStart(event) {
        if (!this.gameStarted || this.gameCompleted) return;
        
        event.dataTransfer.setData('text/plain', event.target.dataset.word);
        event.target.style.opacity = '0.5';
        
    }

    dragEnd(event) {
        event.target.style.opacity = '1';
    }

    fillBlank(blankIndex) {
        if (!this.gameStarted || this.gameCompleted) return;
        
        // This will be called when a word is dropped on a blank
    }

    // Handle drop events on blank spaces
    handleBlankDrop(blankIndex, word) {
        if (!this.gameStarted || this.gameCompleted) return;
        
        
        // Find the blank space element
        const blankElement = document.querySelector(`[data-blank-index="${blankIndex}"]`);
        if (!blankElement) return;
        
        // Check if blank is already filled
        if (blankElement.classList.contains('filled')) {
            // Remove the existing word from word bank
            const existingWord = blankElement.dataset.filledWord;
            this.returnWordToBank(existingWord);
        }
        
        // Fill the blank
        blankElement.innerHTML = `<span class="blank-word">${word}</span>`;
        blankElement.classList.add('filled');
        blankElement.dataset.filledWord = word;
        
        // Remove word from word bank
        this.removeWordFromBank(word);
        
        // Store user answer
        this.userAnswers[blankIndex] = word;
        
    }

    removeWordFromBank(word) {
        const wordElement = document.querySelector(`[data-word="${word}"]`);
        if (wordElement) {
            wordElement.classList.add('used');
            wordElement.style.display = 'none';
        }
    }

    returnWordToBank(word) {
        const wordElement = document.querySelector(`[data-word="${word}"]`);
        if (wordElement) {
            wordElement.classList.remove('used');
            wordElement.style.display = 'block';
        }
    }

    showHint() {
        if (!this.gameStarted || this.gameCompleted) return;
        
        const hintContainer = document.getElementById('hintContainer');
        hintContainer.style.display = 'block';
        this.hintsUsed++;
        
    }

    async checkAnswers() {
        if (!this.gameStarted || this.gameCompleted) return;
        
        // Check if all blanks are filled
        const totalBlanks = this.correctAnswers.length;
        const filledBlanks = Object.keys(this.userAnswers).length;
        
        if (filledBlanks < totalBlanks) {
            if (window.confirmModal) {
                const confirmed = await window.confirmModal(
                    `You have only filled ${filledBlanks} out of ${totalBlanks} blanks. Are you sure you want to check your answers now?`,
                    'Incomplete Answers'
                );
                if (!confirmed) return;
            }
        } else {
            if (window.confirmModal) {
                const confirmed = await window.confirmModal(
                    'Are you ready to check your answers? This will end the game.',
                    'Check Answers'
                );
                if (!confirmed) return;
            }
        }
        
        let correctCount = 0;
        
        // Check each blank
        for (let i = 0; i < totalBlanks; i++) {
            const userAnswer = this.userAnswers[i];
            const correctAnswer = this.correctAnswers[i];
            
            const blankElement = document.querySelector(`[data-blank-index="${i}"]`);
            if (blankElement) {
                if (userAnswer === correctAnswer) {
                    blankElement.classList.add('correct');
                    correctCount++;
                } else {
                    blankElement.classList.add('incorrect');
                }
            }
        }
        
        // Calculate score
        this.score = Math.round((correctCount / totalBlanks) * 100);
        
        // Stop timer
        this.stopTimer();
        
        // Complete the game
        this.endGame(correctCount, totalBlanks);
    }

    async endGame(correctAnswers, totalBlanks) {
        this.gameCompleted = true;
        
        // Show success message based on performance
        let message = '';
        let title = '';
        
        if (this.score >= 90) {
            title = 'Excellent Work! 🌟';
            message = `Amazing! You got ${correctAnswers}/${totalBlanks} correct (${this.score}%)!`;
        } else if (this.score >= 70) {
            title = 'Good Job! 👍';
            message = `Well done! You got ${correctAnswers}/${totalBlanks} correct (${this.score}%)!`;
        } else if (this.score >= 50) {
            title = 'Not Bad! 📚';
            message = `You got ${correctAnswers}/${totalBlanks} correct (${this.score}%). Keep practicing!`;
        } else {
            title = 'Keep Trying! 💪';
            message = `You got ${correctAnswers}/${totalBlanks} correct (${this.score}%). Don't give up!`;
        }
        
        // Show success modal
        if (window.successModal) {
            await window.successModal(message, title);
        }
        
        // Hide game area and show game over screen
        document.getElementById('gamePlayArea').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'block';
        
        // Update game over screen
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('correctAnswers').textContent = correctAnswers;
        document.getElementById('totalBlanks').textContent = totalBlanks;
        document.getElementById('accuracy').textContent = `${this.score}%`;
        
        const timeTaken = this.timeLimit - this.timeRemaining;
        document.getElementById('timeTaken').textContent = `${timeTaken}s`;
        
        // Save game result
        this.saveGameResult();
    }

    async saveGameResult() {
        try {
            const gameData = {
                score: this.score,
                difficulty: this.passageData.difficulty || 'medium',
                questionsAnswered: this.correctAnswers.length,
                correctAnswers: Object.keys(this.userAnswers).length,
                accuracy: this.score,
                hintsUsed: this.hintsUsed,
                timeTaken: this.timeLimit - this.timeRemaining
            };
            
            
            if (window.saveGameResult) {
                await window.saveGameResult('fill_blanks', gameData);
            }
        } catch (error) {
            console.error('[FillBlanksGame] Error saving game result:', error);
        }
    }

    async resetGame() {
        if (window.confirmModal) {
            const confirmed = await window.confirmModal(
                'Are you sure you want to reset the game? This will clear all your answers and restart the timer.',
                'Reset Game'
            );
            if (!confirmed) return;
        }
        
        // Reset game state
        this.userAnswers = {};
        this.score = 0;
        this.hintsUsed = 0;
        this.timeRemaining = this.timeLimit;
        this.gameCompleted = false;
        
        // Stop timer if running
        this.stopTimer();
        
        // Reset UI
        document.getElementById('score').textContent = '0';
        document.getElementById('timer').textContent = this.timeRemaining;
        document.getElementById('hintContainer').style.display = 'none';
        
        // Reset blank spaces
        const blankSpaces = document.querySelectorAll('.blank-space');
        blankSpaces.forEach(blank => {
            blank.innerHTML = '';
            blank.classList.remove('filled', 'correct', 'incorrect');
            blank.removeAttribute('data-filled-word');
        });
        
        // Reset word bank
        const wordChoices = document.querySelectorAll('.word-choice');
        wordChoices.forEach(choice => {
            choice.classList.remove('used');
            choice.style.display = 'block';
        });
        
        // Restart timer
        this.startTimer();
    }

    async restartGame() {
        if (window.confirmModal) {
            const confirmed = await window.confirmModal(
                'Are you sure you want to restart the game? This will clear all your progress and start over.',
                'Restart Game'
            );
            if (!confirmed) return;
        }
        
        // Hide game over screen
        document.getElementById('gameOverScreen').style.display = 'none';
        
        // Reset and start game
        await this.resetGame();
        this.startGame();
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeRemaining--;
            document.getElementById('timer').textContent = this.timeRemaining;
            
            if (this.timeRemaining <= 0) {
                this.stopTimer();
                this.handleTimeUp(); // Handle time up with modal
            }
        }, 1000);
    }
    
    async handleTimeUp() {
        if (window.infoModal) {
            await window.infoModal(
                'Time\'s up! Your answers will be checked automatically.',
                'Time\'s Up! ⏰'
            );
        }
        this.checkAnswers(); // Auto-submit when time runs out
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    showError(message) {
        if (window.errorModal) {
            window.errorModal(message, 'Game Error');
        } else {
            alert('Error: ' + message);
        }
    }
}

// Global functions for HTML onclick events
function startGame() {
    if (window.game) {
        window.game.startGame();
    }
}

function showHint() {
    if (window.game) {
        window.game.showHint();
    }
}

function checkAnswers() {
    if (window.game) {
        window.game.checkAnswers();
    }
}

function resetGame() {
    if (window.game) {
        window.game.resetGame();
    }
}

function restartGame() {
    if (window.game) {
        window.game.restartGame();
    }
}

async function goBackToDashboard() {
    if (window.confirmModal) {
        const confirmed = await window.confirmModal(
            'Are you sure you want to go back to the dashboard? Your current game progress will be lost.',
            'Leave Game'
        );
        if (!confirmed) return;
    }
    window.location.href = '../index.php';
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    
    // Check if required elements exist
    const gamePlayArea = document.getElementById('gamePlayArea');
    const instructionsCard = document.getElementById('instructionsCard');
    
    if (!gamePlayArea || !instructionsCard) {
        console.error('[FillBlanksGame] Required elements not found');
        return;
    }
    
    // Initialize the game
    window.game = new FillBlanksGame();
    
    // Add drop event listeners to blank spaces
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        
        if (e.target.classList.contains('blank-space')) {
            const word = e.dataTransfer.getData('text/plain');
            const blankIndex = parseInt(e.target.dataset.blankIndex);
            
            if (window.game) {
                window.game.handleBlankDrop(blankIndex, word);
            }
        }
    });
    
});
