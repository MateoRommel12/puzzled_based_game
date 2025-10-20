/**
 * Universal Game Completion System
 * Provides consistent game completion screens across all games
 */

class GameCompleteManager {
  constructor() {
    this.particleColors = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];
  }

  /**
   * Show the universal game completion screen
   * @param {Object} gameData - Game completion data
   * @param {number} gameData.score - Final score
   * @param {number} gameData.correctAnswers - Number of correct answers
   * @param {number} gameData.totalQuestions - Total questions attempted
   * @param {number} gameData.accuracy - Accuracy percentage
   * @param {string} gameData.gameType - Type of game (for saving)
   * @param {Function} gameData.onPlayAgain - Callback for play again
   * @param {Function} gameData.onBackToDashboard - Callback for back to dashboard
   */
  showGameComplete(gameData) {
    // Create overlay
    const overlay = this.createOverlay();
    
    // Create completion screen
    const screen = this.createCompletionScreen(gameData);
    
    // Add to DOM
    overlay.appendChild(screen);
    document.body.appendChild(overlay);
    
    // Create celebration effects
    this.createCelebrationEffects();
    
    // Animate score counting
    this.animateScoreCounting(gameData.score, gameData.accuracy);
    
    // Save game data
    this.saveGameData(gameData);
  }

  /**
   * Create the overlay backdrop
   */
  createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'game-complete-overlay';
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        this.closeGameComplete();
      }
    };
    return overlay;
  }

  /**
   * Create the main completion screen
   */
  createCompletionScreen(gameData) {
    const screen = document.createElement('div');
    screen.className = 'game-complete-screen';
    
    screen.innerHTML = `
      <div class="game-complete-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
      </div>
      
      <h1 class="game-complete-title">Game Complete!</h1>
      <p class="game-complete-subtitle">Congratulations! You've finished the game!</p>
      
      <div class="final-score-container">
        <div class="final-score-number" id="final-score-display">0</div>
        <div class="final-score-label">Final Score</div>
      </div>
      
      <div class="game-stats-grid">
        <div class="stat-card">
          <span class="stat-label">Correct Answers</span>
          <span class="stat-value">${gameData.correctAnswers}/${gameData.totalQuestions}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Accuracy</span>
          <span class="stat-value" id="accuracy-display">0%</span>
        </div>
      </div>
      
      <div class="game-complete-actions">
        <button class="action-button secondary" onclick="gameCompleteManager.closeGameComplete(); ${gameData.onBackToDashboard ? gameData.onBackToDashboard() : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </button>
        <button class="action-button primary" onclick="gameCompleteManager.closeGameComplete(); ${gameData.onPlayAgain ? gameData.onPlayAgain() : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
          Play Again
        </button>
      </div>
    `;
    
    return screen;
  }

  /**
   * Create celebration particle effects
   */
  createCelebrationEffects() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'success-particles';
    document.body.appendChild(particleContainer);
    
    // Create 50 particles
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        this.createParticle(particleContainer);
      }, i * 50);
    }
    
    // Remove particle container after animation
    setTimeout(() => {
      if (particleContainer.parentNode) {
        particleContainer.parentNode.removeChild(particleContainer);
      }
    }, 4000);
  }

  /**
   * Create individual particle
   */
  createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random position at bottom of screen
    particle.style.left = Math.random() * 100 + '%';
    particle.style.bottom = '0px';
    
    // Random color
    particle.style.background = this.particleColors[Math.floor(Math.random() * this.particleColors.length)];
    
    // Random size
    const size = Math.random() * 8 + 4;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    // Random animation duration
    particle.style.animationDuration = (Math.random() * 2 + 2) + 's';
    
    container.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 4000);
  }

  /**
   * Animate score counting up
   */
  animateScoreCounting(finalScore, finalAccuracy) {
    const scoreElement = document.getElementById('final-score-display');
    const accuracyElement = document.getElementById('accuracy-display');
    
    if (scoreElement) {
      this.animateNumber(scoreElement, 0, finalScore, 1500);
    }
    
    if (accuracyElement) {
      setTimeout(() => {
        this.animateNumber(accuracyElement, 0, finalAccuracy, 1000, '%');
      }, 500);
    }
  }

  /**
   * Animate number counting
   */
  animateNumber(element, start, end, duration, suffix = '') {
    const startTime = Date.now();
    const difference = end - start;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (difference * easeOut));
      
      element.textContent = current + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  /**
   * Save game data to database
   */
  saveGameData(gameData) {
    if (window.saveGameResult && gameData.gameType) {
      const gameResult = {
        score: gameData.score,
        difficulty: gameData.difficulty || "medium",
        questionsAnswered: gameData.totalQuestions,
        correctAnswers: gameData.correctAnswers,
        accuracy: gameData.accuracy,
        hintsUsed: gameData.hintsUsed || 0,
        timeSpent: gameData.timeSpent || 0
      };
      
      window.saveGameResult(gameData.gameType, gameResult);
    }
  }

  /**
   * Close the game completion screen
   */
  closeGameComplete() {
    const overlay = document.querySelector('.game-complete-overlay');
    if (overlay) {
      overlay.style.animation = 'overlayFadeOut 0.3s ease-in forwards';
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 300);
    }
  }
}

// Global instance
window.gameCompleteManager = new GameCompleteManager();

// Debug logging

// Add fade out animation
const style = document.createElement('style');
style.textContent = `
  @keyframes overlayFadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
