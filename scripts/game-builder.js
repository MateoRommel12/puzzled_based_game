// Game Builder Logic
console.log('game-builder.js loaded!');

let questionCount = 0;
let fillBlanksPassageCount = 0;
let isEditMode = false;
let editGameId = null;

// Filter category options based on learning type
function filterCategoryOptions() {
    const learningType = document.getElementById('gameType').value;
    const gameCategorySelect = document.getElementById('gameCategory');
    const allOptions = gameCategorySelect.querySelectorAll('option');
    
    // Show/hide options based on learning type
    allOptions.forEach(option => {
        const value = option.value;
        
        if (!value) {
            // Keep the "Select category..." option visible
            return;
        }
        
        if (learningType === 'literacy') {
            // Hide math challenge for literacy
            option.style.display = value === 'math' ? 'none' : '';
        } else if (learningType === 'math') {
            // Hide fill in the blanks for math
            option.style.display = value === 'fill_blanks' ? 'none' : '';
        } else {
            // Show all if no learning type selected
            option.style.display = '';
        }
    });
}

// Toggle game type specific fields
function toggleGameTypeSpecificFields() {
    const gameCategory = document.getElementById('gameCategory').value;
    const fillBlanksSection = document.getElementById('fillBlanksSection');
    const jumbledSentencesSection = document.getElementById('jumbledSentencesSection');
    const questionsSection = document.getElementById('questionsSection');
    
    // Hide all sections first
    if (fillBlanksSection) fillBlanksSection.style.display = 'none';
    if (jumbledSentencesSection) jumbledSentencesSection.style.display = 'none';
    if (questionsSection) questionsSection.style.display = 'none';
    
    if (gameCategory === 'fill_blanks') {
        fillBlanksSection.style.display = 'block';
        
        // Clear other sections
        const questionsList = document.getElementById('questionsList');
        if (questionsList) {
            questionsList.innerHTML = '';
            questionCount = 0;
        }
        const jumbledList = document.getElementById('jumbledSentencesList');
        if (jumbledList) {
            jumbledList.innerHTML = '';
        }
        
        // Add first fill-blanks passage if none exist
        const fillBlanksPassagesList = document.getElementById('fillBlanksPassagesList');
        if (fillBlanksPassagesList && fillBlanksPassagesList.children.length === 0) {
            addFillBlanksPassage();
        }
    } else if (gameCategory === 'jumbled_sentences') {
        jumbledSentencesSection.style.display = 'block';
        
        // Clear other sections
        const questionsList = document.getElementById('questionsList');
        if (questionsList) {
            questionsList.innerHTML = '';
            questionCount = 0;
        }
        const fillBlanksPassagesList = document.getElementById('fillBlanksPassagesList');
        if (fillBlanksPassagesList) {
            fillBlanksPassagesList.innerHTML = '';
            fillBlanksPassageCount = 0;
        }
        
        // Add first jumbled sentence if none exist
        const jumbledList = document.getElementById('jumbledSentencesList');
        if (jumbledList && jumbledList.children.length === 0) {
            addJumbledSentence();
        }
    } else {
        questionsSection.style.display = 'block';
        
        // Clear other sections
        const fillBlanksPassagesList = document.getElementById('fillBlanksPassagesList');
        if (fillBlanksPassagesList) {
            fillBlanksPassagesList.innerHTML = '';
            fillBlanksPassageCount = 0;
        }
        const jumbledList = document.getElementById('jumbledSentencesList');
        if (jumbledList) {
            jumbledList.innerHTML = '';
        }
        
        // Re-enable question validation for regular games
        const existingQuestions = document.querySelectorAll('.question-item');
        existingQuestions.forEach(question => {
            const textarea = question.querySelector('.question-text');
            if (textarea) {
                textarea.setAttribute('required', 'required');
                textarea.disabled = false;
            }
        });
        
        // Add a question if none exist
        if (existingQuestions.length === 0) {
            addQuestion();
        }
    }
}

// Add a new fill-blanks passage
function addFillBlanksPassage() {
    fillBlanksPassageCount++;
    const passagesList = document.getElementById("fillBlanksPassagesList");
    
    if (!passagesList) {
        return;
    }
    
    const passageItem = document.createElement("div");
    passageItem.className = "question-item";
    passageItem.id = `fillblanks-passage-${fillBlanksPassageCount}`;
    
    passageItem.innerHTML = `
        <div class="question-header">
            <span class="question-number">Passage ${fillBlanksPassageCount}</span>
            <button type="button" class="remove-btn" onclick="removeFillBlanksPassage(${fillBlanksPassageCount})">
                Remove
            </button>
        </div>

        <div class="form-group">
            <label for="passageText-${fillBlanksPassageCount}">Passage Text *</label>
            <textarea id="passageText-${fillBlanksPassageCount}" class="passage-text" required placeholder="Type your passage here. Use [BLANK] to mark where words should be filled in. Example: The quick [BLANK] fox jumps over the lazy [BLANK]."></textarea>
            <small style="color: #888; margin-top: 0.5rem; display: block;">
                💡 Use [BLANK] to mark blank spaces. Students will drag words to fill these spaces.
            </small>
        </div>

        <div class="form-group">
            <label for="wordBank-${fillBlanksPassageCount}">Word Bank *</label>
            <textarea id="wordBank-${fillBlanksPassageCount}" class="word-bank" required placeholder="Enter words separated by commas. Example: quick, brown, fox, lazy, dog, cat, bird"></textarea>
            <small style="color: #888; margin-top: 0.5rem; display: block;">
                💡 Provide multiple word options. The correct words will be automatically matched to [BLANK] positions.
            </small>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="correctWords-${fillBlanksPassageCount}">Correct Words (in order) *</label>
                <input type="text" id="correctWords-${fillBlanksPassageCount}" class="correct-words" required placeholder="brown, dog (comma separated, in order of blanks)">
            </div>
            <div class="form-group">
                <label for="distractorCount-${fillBlanksPassageCount}">Number of Distractor Words</label>
                <select id="distractorCount-${fillBlanksPassageCount}" class="distractor-count">
                    <option value="2">2 Distractors</option>
                    <option value="3" selected>3 Distractors</option>
                    <option value="4">4 Distractors</option>
                    <option value="5">5 Distractors</option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label for="hintText-${fillBlanksPassageCount}">Hint (Optional)</label>
            <input type="text" id="hintText-${fillBlanksPassageCount}" class="hint-text" placeholder="e.g., Think about animals and descriptive words">
        </div>

        <button type="button" class="add-question-btn" onclick="previewFillBlanksPassage(${fillBlanksPassageCount})" style="margin-top: 1rem; width: auto; padding: 0.5rem 1rem;">
            👁️ Preview This Passage
        </button>
    `;
    
    passagesList.appendChild(passageItem);
}

// Remove a fill-blanks passage
function removeFillBlanksPassage(id) {
    const passage = document.getElementById(`fillblanks-passage-${id}`);
    if (passage) {
        passage.remove();
        renumberFillBlanksPassages();
    }
}

// Renumber fill-blanks passages after deletion
function renumberFillBlanksPassages() {
    const passages = document.querySelectorAll("#fillBlanksPassagesList .question-item");
    passages.forEach((p, index) => {
        const numberSpan = p.querySelector(".question-number");
        if (numberSpan) {
            numberSpan.textContent = `Passage ${index + 1}`;
        }
    });
}

// Add a new jumbled sentence
let jumbledSentenceCount = 0;

function addJumbledSentence() {
    jumbledSentenceCount++;
    const sentencesList = document.getElementById("jumbledSentencesList");
    
    if (!sentencesList) {
        return;
    }
    
    const sentenceItem = document.createElement("div");
    sentenceItem.className = "question-item";
    sentenceItem.id = `jumbled-sentence-${jumbledSentenceCount}`;
    
    sentenceItem.innerHTML = `
        <div class="question-header">
            <span class="question-number">Sentence ${jumbledSentenceCount}</span>
            <button type="button" class="remove-btn" onclick="removeJumbledSentence(${jumbledSentenceCount})">
                Remove
            </button>
        </div>

        <div class="form-group">
            <label for="sentenceText-${jumbledSentenceCount}">Correct Sentence *</label>
            <textarea id="sentenceText-${jumbledSentenceCount}" class="sentence-text" required placeholder="Type the correct sentence here. Example: The cat sat on the mat."></textarea>
            <small style="color: #888; margin-top: 0.5rem; display: block;">
                💡 Enter the complete correct sentence. Words will be automatically scrambled for the player.
            </small>
        </div>

        <div class="form-group">
            <label for="hint-${jumbledSentenceCount}">Hint (Optional)</label>
            <input type="text" id="hint-${jumbledSentenceCount}" class="hint-text" placeholder="e.g., Think about subject-verb-object order">
        </div>

        <div class="form-group">
            <label for="points-${jumbledSentenceCount}">Points</label>
            <input type="number" id="points-${jumbledSentenceCount}" class="points-input" value="10" min="1" max="100">
        </div>
    `;
    
    sentencesList.appendChild(sentenceItem);
}

// Remove a jumbled sentence
function removeJumbledSentence(id) {
    const sentence = document.getElementById(`jumbled-sentence-${id}`);
    if (sentence) {
        sentence.remove();
        renumberJumbledSentences();
    }
}

// Renumber jumbled sentences after deletion
function renumberJumbledSentences() {
    const sentences = document.querySelectorAll("#jumbledSentencesList .question-item");
    sentences.forEach((s, index) => {
        const numberSpan = s.querySelector(".question-number");
        if (numberSpan) {
            numberSpan.textContent = `Sentence ${index + 1}`;
        }
    });
}

// Preview a specific fill-blanks passage
async function previewFillBlanksPassage(passageId) {
    const passageText = document.getElementById(`passageText-${passageId}`).value;
    const wordBank = document.getElementById(`wordBank-${passageId}`).value;
    const correctWords = document.getElementById(`correctWords-${passageId}`).value;
    
    if (!passageText || !wordBank || !correctWords) {
        await errorModal('Please fill in all required fields: Passage Text, Word Bank, and Correct Words.', 'Validation Error');
        return;
    }
    
    // Count blanks in passage
    const blankCount = (passageText.match(/\[BLANK\]/g) || []).length;
    const correctWordsArray = correctWords.split(',').map(word => word.trim());
    
    if (blankCount !== correctWordsArray.length) {
        await errorModal(`Mismatch: Found ${blankCount} [BLANK] markers but ${correctWordsArray.length} correct words. Please make sure they match.`, 'Validation Error');
        return;
    }
    
    // Create preview
    const previewText = passageText.replace(/\[BLANK\]/g, '___');
    const wordBankArray = wordBank.split(',').map(word => word.trim());
    
    await infoModal(
        `Passage: ${previewText}\n\nWord Bank: ${wordBankArray.join(', ')}\n\nCorrect Answers: ${correctWordsArray.join(', ')}\n\nBlanks Found: ${blankCount}`,
        'Passage Preview'
    );
}

// Save fill in the blanks game
async function saveFillBlanksGame(gameData) {
    try {
        const method = isEditMode ? 'PUT' : 'POST';
        // Get CSRF token from form
        const csrfToken = document.querySelector('input[name="csrf_token"]')?.value;
        
        const response = await fetch('/ClusteringGame/api/custom-games.php', {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(gameData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            await successModal(
                isEditMode ? 'Fill in the Blanks game updated successfully!' : 'Fill in the Blanks game saved successfully!',
                'Success'
            );
            window.location.href = 'admin-dashboard.php';
        } else {
            await errorModal('Error: ' + result.message, 'Error');
        }
    } catch (error) {
        console.error('Error saving fill in the blanks game:', error);
        await errorModal('Failed to save game. Please try again.', 'Network Error');
    }
}

async function saveJumbledSentencesGame(gameData) {
    console.log('saveJumbledSentencesGame called with:', gameData);
    try {
        // Validate required fields before sending
        console.log('Validating game data...');
        if (!gameData.gameName || !gameData.gameName.trim()) {
            console.error('Validation failed: Missing game name');
            await errorModal('Please enter a game name.', 'Validation Error');
            return;
        }
        
        if (!gameData.gameType || !gameData.gameType.trim()) {
            await errorModal('Please select a learning type (Math or Literacy).', 'Validation Error');
            return;
        }
        
        if (!gameData.difficulty || !gameData.difficulty.trim()) {
            await errorModal('Please select a difficulty level.', 'Validation Error');
            return;
        }
        
        if (!gameData.sentences || gameData.sentences.length === 0) {
            await errorModal('Please add at least one jumbled sentence.', 'Validation Error');
            return;
        }
        
        const method = isEditMode ? 'PUT' : 'POST';
        const csrfToken = document.querySelector('input[name="csrf_token"]')?.value;
        
        console.log('Sending request to API...', {
            method: method,
            url: '/ClusteringGame/api/custom-games.php',
            hasToken: !!csrfToken,
            dataSize: JSON.stringify(gameData).length
        });
        
        const response = await fetch('/ClusteringGame/api/custom-games.php', {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(gameData)
        });
        
        console.log('Response received:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });
        
        // Check if response is OK before parsing JSON
        if (!response.ok) {
            const errorText = await response.text();
            console.error('HTTP error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText.substring(0, 200)}`);
        }
        
        const result = await response.json();
        console.log('API response:', result);
        
        if (result.success) {
            await successModal(
                isEditMode ? 'Jumbled Sentences game updated successfully!' : 'Jumbled Sentences game saved successfully!',
                'Success'
            );
            window.location.href = 'admin-dashboard.php';
        } else {
            const errorMsg = result.message || 'Unknown error occurred';
            console.error('Backend error:', errorMsg);
            console.error('Game data sent:', gameData);
            await errorModal('Error: ' + errorMsg, 'Error');
        }
    } catch (error) {
        console.error('Error saving jumbled sentences game:', error);
        console.error('Game data:', gameData);
        await errorModal('Failed to save game: ' + error.message, 'Network Error');
    }
}

// Add a new question form
function addQuestion() {
  questionCount++;
  const questionsList = document.getElementById("questionsList");
  
  const questionItem = document.createElement("div");
  questionItem.className = "question-item";
  questionItem.id = `question-${questionCount}`;
  
  questionItem.innerHTML = `
    <div class="question-header">
      <span class="question-number">Question ${questionCount}</span>
      <button type="button" class="remove-btn" onclick="removeQuestion(${questionCount})">
        Remove
      </button>
    </div>

    <div class="form-group">
      <label for="question-type-${questionCount}">Question Type *</label>
      <select id="question-type-${questionCount}" name="question-type-${questionCount}" class="question-type" required onchange="updateQuestionFields(${questionCount})">
        <option value="">Select type...</option>
        <option value="multiple_choice">Multiple Choice</option>
        <option value="true_false">True/False</option>
        <option value="fill_blank">Fill in the Blank</option>
      </select>
    </div>

    <div class="form-group">
      <label for="question-text-${questionCount}">Question Text *</label>
      <textarea id="question-text-${questionCount}" name="question-text-${questionCount}" class="question-text" required placeholder="Enter your question..."></textarea>
    </div>

    <div id="options-container-${questionCount}" class="options-container">
      <!-- Options will be inserted here based on question type -->
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="correct-answer-${questionCount}">Correct Answer *</label>
        <input type="text" id="correct-answer-${questionCount}" name="correct-answer-${questionCount}" class="correct-answer" required placeholder="Enter correct answer">
      </div>

      <div class="form-group">
        <label for="question-points-${questionCount}">Points</label>
        <input type="number" id="question-points-${questionCount}" name="question-points-${questionCount}" class="question-points" value="10" min="1">
      </div>
    </div>

    <div class="form-group">
      <label for="question-hint-${questionCount}">Hint (Optional)</label>
      <input type="text" id="question-hint-${questionCount}" name="question-hint-${questionCount}" class="question-hint" placeholder="Give students a helpful hint...">
    </div>
  `;
  
  questionsList.appendChild(questionItem);
}

// Remove a question
function removeQuestion(id) {
  const question = document.getElementById(`question-${id}`);
  if (question) {
    question.remove();
    renumberQuestions();
  }
}

// Renumber questions after deletion
function renumberQuestions() {
  const questions = document.querySelectorAll(".question-item");
  questions.forEach((q, index) => {
    const numberSpan = q.querySelector(".question-number");
    if (numberSpan) {
      numberSpan.textContent = `Question ${index + 1}`;
    }
  });
}

// Update question fields based on type
function updateQuestionFields(questionId) {
  const questionItem = document.getElementById(`question-${questionId}`);
  const questionType = questionItem.querySelector(".question-type").value;
  const optionsContainer = document.getElementById(`options-container-${questionId}`);
  
  if (questionType === "multiple_choice") {
    optionsContainer.innerHTML = `
      <div class="form-group">
        <label for="option-a-${questionId}">Options</label>
        <input type="text" id="option-a-${questionId}" name="option-a-${questionId}" class="option-a" placeholder="Option A" required>
        <input type="text" id="option-b-${questionId}" name="option-b-${questionId}" class="option-b" placeholder="Option B" required>
        <input type="text" id="option-c-${questionId}" name="option-c-${questionId}" class="option-c" placeholder="Option C" required>
        <input type="text" id="option-d-${questionId}" name="option-d-${questionId}" class="option-d" placeholder="Option D" required>
      </div>
    `;
  } else if (questionType === "true_false") {
    optionsContainer.innerHTML = `
      <div class="form-group">
        <label for="tf-answer-${questionId}">Options</label>
        <select id="tf-answer-${questionId}" name="tf-answer-${questionId}" class="correct-answer" required>
          <option value="">Select answer...</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>
    `;
  } else {
    optionsContainer.innerHTML = "";
  }
}

// Load game data for editing
async function loadGameForEdit(gameId) {
  try {
    const response = await fetch(`/ClusteringGame/api/custom-games.php?gameId=${gameId}&includeQuestions=1`);
    const result = await response.json();
    
    if (result.success && result.game) {
      const game = result.game;
      
      // Populate basic game information
      document.getElementById('gameName').value = game.game_name || '';
      document.getElementById('gameType').value = game.game_type || '';
      document.getElementById('gameCategory').value = game.game_category || '';
      document.getElementById('difficulty').value = game.difficulty || '';
      document.getElementById('timeLimit').value = game.time_limit || '';
      document.getElementById('iconEmoji').value = game.icon_emoji || '';
      document.getElementById('description').value = game.description || '';
      
      // Trigger category change to show correct section
      toggleGameTypeSpecificFields();
      
      // Load questions based on game category
      if (game.game_category === 'fill_blanks' && game.questions && game.questions.length > 0) {
        // Clear existing passages
        document.getElementById('fillBlanksPassagesList').innerHTML = '';
        fillBlanksPassageCount = 0;
        
        // Add each passage
        game.questions.forEach((question, index) => {
          addFillBlanksPassage();
          
          // Populate passage data
          const passageId = fillBlanksPassageCount;
          document.getElementById(`passageText-${passageId}`).value = question.question_text || '';
          document.getElementById(`hintText-${passageId}`).value = question.hint || '';
          
          // Parse blanks to get correct words
          if (question.blanks) {
            const blanks = question.blanks.split('|').map(blank => {
              const [number, text] = blank.split(':');
              return text;
            });
            document.getElementById(`correctWords-${passageId}`).value = blanks.join(', ');
          }
          
          // Parse choices to get word bank
          if (question.choices) {
            const uniqueWords = new Set();
            question.choices.split('|').forEach(choice => {
              const [text] = choice.split(':');
              uniqueWords.add(text);
            });
            document.getElementById(`wordBank-${passageId}`).value = Array.from(uniqueWords).join(', ');
          }
        });
      } else if (game.questions && game.questions.length > 0) {
        // Clear existing questions
        document.getElementById('questionsList').innerHTML = '';
        questionCount = 0;
        
        // Add each question
        game.questions.forEach((question, index) => {
          addQuestion();
          
          // Populate question data
          const qNum = questionCount;
          document.getElementById(`question-type-${qNum}`).value = question.question_type || '';
          document.getElementById(`question-text-${qNum}`).value = question.question_text || '';
          document.getElementById(`correct-answer-${qNum}`).value = question.correct_answer || '';
          document.getElementById(`question-points-${qNum}`).value = question.points || 10;
          document.getElementById(`question-hint-${qNum}`).value = question.hint || '';
          
          // Update options based on question type
          updateQuestionFields(qNum);
          
          // Populate options if multiple choice
          if (question.question_type === 'multiple_choice') {
            setTimeout(() => {
              if (document.getElementById(`option-a-${qNum}`)) {
                document.getElementById(`option-a-${qNum}`).value = question.option_a || '';
                document.getElementById(`option-b-${qNum}`).value = question.option_b || '';
                document.getElementById(`option-c-${qNum}`).value = question.option_c || '';
                document.getElementById(`option-d-${qNum}`).value = question.option_d || '';
              }
            }, 100);
          }
        });
      }
      
      // Update page title
      const pageTitle = document.querySelector('.builder-header h1');
      if (pageTitle) {
        pageTitle.textContent = '✏️ Edit Custom Game';
      }
      
      // Update button text
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = '💾 Update Game';
      }
      
    } else {
      await errorModal('Failed to load game: ' + (result.message || 'Unknown error'), 'Load Error');
      window.location.href = 'admin-dashboard.php';
    }
  } catch (error) {
    console.error('Error loading game for edit:', error);
    await errorModal('Failed to load game for editing', 'Load Error');
    window.location.href = 'admin-dashboard.php';
  }
}

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded - Initializing game builder...');
  
  // Make functions globally accessible
  window.filterCategoryOptions = filterCategoryOptions;
  window.addFillBlanksPassage = addFillBlanksPassage;
  window.removeFillBlanksPassage = removeFillBlanksPassage;
  window.previewFillBlanksPassage = previewFillBlanksPassage;
  window.addJumbledSentence = addJumbledSentence;
  window.removeJumbledSentence = removeJumbledSentence;
  window.toggleGameTypeSpecificFields = toggleGameTypeSpecificFields;
  window.addQuestion = addQuestion;
  window.removeQuestion = removeQuestion;
  window.updateQuestionFields = updateQuestionFields;
  
  // Check if we're in edit mode
  const urlParams = new URLSearchParams(window.location.search);
  editGameId = urlParams.get('edit');
  
  if (editGameId) {
    isEditMode = true;
    loadGameForEdit(editGameId);
  } else {
    // Initialize the form based on current game category
    // Only show sections if category is already selected
    const gameCategory = document.getElementById('gameCategory');
    if (gameCategory && gameCategory.value) {
      toggleGameTypeSpecificFields();
    } else {
      // Hide all sections if no category selected yet
      const fillBlanksSection = document.getElementById('fillBlanksSection');
      const jumbledSentencesSection = document.getElementById('jumbledSentencesSection');
      const questionsSection = document.getElementById('questionsSection');
      if (fillBlanksSection) fillBlanksSection.style.display = 'none';
      if (jumbledSentencesSection) jumbledSentencesSection.style.display = 'none';
      if (questionsSection) questionsSection.style.display = 'none';
    }
    
    // Only add a question for regular quiz games (not fill-blanks or jumbled-sentences)
    if (gameCategory && 
        gameCategory.value !== 'fill_blanks' && 
        gameCategory.value !== 'jumbled_sentences' &&
        gameCategory.value !== '') {
      addQuestion();
    }
  }
  
  // Handle form submission
  const form = document.getElementById("gameBuilderForm");
  console.log('Form element found:', !!form);
  
  if (form) {
    console.log('Attaching form submit listener...');
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('=== FORM SUBMITTED ===');
      console.log('Form submitted!');
      const gameCategory = document.getElementById("gameCategory").value;
      console.log('Game category:', gameCategory);
  
  // Handle fill in the blanks games differently
  if (gameCategory === 'fill_blanks') {
    
    // Get all form values
    const gameName = document.getElementById("gameName").value;
    const gameType = document.getElementById("gameType").value;
    // Use the main difficulty field from Game Information section
    const difficultyElement = document.getElementById("difficulty");
    const difficultyValue = difficultyElement ? difficultyElement.value : null;
    const timeLimit = document.getElementById("timeLimit").value || null;
    const iconEmoji = document.getElementById("iconEmoji").value || "📝";
    const description = document.getElementById("description").value;
    
    if (!difficultyValue) {
      await errorModal('Please select a difficulty level. The difficulty field is required.', 'Validation Error');
      return;
    }
    
    // Collect all fill-blanks passages
    const passageItems = document.querySelectorAll("#fillBlanksPassagesList .question-item");
    
    if (passageItems.length === 0) {
      await errorModal("Please add at least one passage!", 'Validation Error');
      return;
    }
    
    const passages = [];
    passageItems.forEach(async(item, index) => {
      const passageId = item.id.split('-').pop();
      const passageText = document.getElementById(`passageText-${passageId}`).value;
      const wordBank = document.getElementById(`wordBank-${passageId}`).value;
      const correctWords = document.getElementById(`correctWords-${passageId}`).value;
      const distractorCount = document.getElementById(`distractorCount-${passageId}`).value;
      const hintText = document.getElementById(`hintText-${passageId}`).value;
      
      // Validate each passage
      if (!passageText || !wordBank || !correctWords) {
        await errorModal(`Passage ${index + 1}: Please fill in all required fields (Passage Text, Word Bank, and Correct Words).`, 'Validation Error');
        return;
      }
      
      // Validate blanks count
      const blankCount = (passageText.match(/\[BLANK\]/g) || []).length;
      const correctWordsArray = correctWords.split(',').map(word => word.trim());
      
      if (blankCount !== correctWordsArray.length) {
        await errorModal(`Passage ${index + 1}: Found ${blankCount} [BLANK] markers but ${correctWordsArray.length} correct words. Please make sure they match.`, 'Validation Error');
        return;
      }
      
      passages.push({
        orderNumber: index + 1,
        passageText: passageText,
        wordBank: wordBank,
        correctWords: correctWords,
        distractorCount: distractorCount,
        hintText: hintText
      });
    });
    
    if (passages.length !== passageItems.length) {
      // Validation failed for one of the passages
      return;
    }
    
    const gameData = {
      gameName: gameName,
      gameType: gameType,
      gameCategory: gameCategory,
      difficulty: difficultyValue,
      timeLimit: timeLimit,
      iconEmoji: iconEmoji,
      description: description,
      passages: passages
    };
    
    // Add gameId if in edit mode
    if (isEditMode && editGameId) {
      gameData.gameId = editGameId;
    }
    
    await saveFillBlanksGame(gameData);
    return;
  }
  
  // Handle jumbled sentences games
  if (gameCategory === 'jumbled_sentences') {
    console.log('Processing jumbled sentences game...');
    const gameName = document.getElementById("gameName").value.trim();
    const gameType = document.getElementById("gameType").value;
    const difficultyValue = document.getElementById("difficulty").value;
    const timeLimit = document.getElementById("timeLimit").value || null;
    const iconEmoji = document.getElementById("iconEmoji").value || "🔀";
    const description = document.getElementById("description").value || null;
    
    // Validate required fields first
    if (!gameName || gameName === '') {
      await errorModal('Please enter a game name.', 'Validation Error');
      return;
    }
    
    if (!gameType || gameType === '') {
      await errorModal('Please select a learning type (Math or Literacy).', 'Validation Error');
      return;
    }
    
    if (!difficultyValue || difficultyValue === '') {
      await errorModal('Please select a difficulty level.', 'Validation Error');
      return;
    }
    
    // Collect all jumbled sentences
    const sentenceItems = document.querySelectorAll("#jumbledSentencesList .question-item");
    
    if (sentenceItems.length === 0) {
      await errorModal("Please add at least one jumbled sentence!", 'Validation Error');
      return;
    }
    
    const sentences = [];
    let validationFailed = false;
    
    for (let index = 0; index < sentenceItems.length; index++) {
      const item = sentenceItems[index];
      const sentenceId = item.id.split('-').pop();
      const sentenceTextEl = document.getElementById(`sentenceText-${sentenceId}`);
      const hintEl = document.getElementById(`hint-${sentenceId}`);
      const pointsEl = document.getElementById(`points-${sentenceId}`);
      
      if (!sentenceTextEl) {
        console.error(`Sentence ${index + 1}: Could not find sentenceText-${sentenceId} element`);
        await errorModal(`Sentence ${index + 1}: Form element not found. Please refresh and try again.`, 'Validation Error');
        validationFailed = true;
        break;
      }
      
      const sentenceText = sentenceTextEl.value ? sentenceTextEl.value.trim() : '';
      const hint = hintEl ? (hintEl.value ? hintEl.value.trim() : null) : null;
      const points = pointsEl ? (parseInt(pointsEl.value) || 10) : 10;
      
      if (!sentenceText || sentenceText === '') {
        await errorModal(`Sentence ${index + 1}: Please enter a sentence.`, 'Validation Error');
        validationFailed = true;
        break;
      }
      
      sentences.push({
        orderNumber: index + 1,
        sentenceText: sentenceText,
        hint: hint,
        points: points
      });
    }
    
    if (validationFailed || sentences.length === 0) {
      return;
    }
    
    const gameData = {
      gameName: gameName,
      gameType: gameType,
      gameCategory: gameCategory,
      difficulty: difficultyValue,
      timeLimit: timeLimit,
      iconEmoji: iconEmoji,
      description: description,
      sentences: sentences
    };
    
    if (isEditMode && editGameId) {
      gameData.gameId = parseInt(editGameId);
    }
    
    console.log('Sending jumbled sentences game data:', gameData);
    console.log('Game data validation:', {
      hasGameName: !!gameData.gameName,
      hasGameType: !!gameData.gameType,
      hasGameCategory: !!gameData.gameCategory,
      hasDifficulty: !!gameData.difficulty,
      hasSentences: !!gameData.sentences,
      sentencesCount: gameData.sentences ? gameData.sentences.length : 0
    });
    await saveJumbledSentencesGame(gameData);
    return;
  }
  
  // Collect game data for regular games
  const difficultyValue = document.getElementById("difficulty").value;
  
  // Validate difficulty field
  if (!difficultyValue) {
    await errorModal('Please select a difficulty level. The difficulty field is required.', 'Validation Error');
    return;
  }
  
  const gameData = {
    gameName: document.getElementById("gameName").value,
    gameType: document.getElementById("gameType").value,
    gameCategory: gameCategory,
    difficulty: difficultyValue,
    timeLimit: document.getElementById("timeLimit").value || null,
    iconEmoji: document.getElementById("iconEmoji").value || "🎮",
    description: document.getElementById("description").value,
    questions: []
  };
  
  // Add gameId if in edit mode
  if (isEditMode && editGameId) {
    gameData.gameId = editGameId;
  }
  
  // Collect questions
  const questionItems = document.querySelectorAll(".question-item");
  questionItems.forEach((item, index) => {
    const hintEl = item.querySelector(".question-hint");
    const hint = hintEl ? (hintEl.value ? hintEl.value.trim() : null) : null;
    
    const question = {
      orderNumber: index + 1,
      questionType: item.querySelector(".question-type").value,
      questionText: item.querySelector(".question-text").value,
      correctAnswer: item.querySelector(".correct-answer").value,
      hint: hint,
      points: parseInt(item.querySelector(".question-points").value) || 10,
      optionA: item.querySelector(".option-a")?.value || null,
      optionB: item.querySelector(".option-b")?.value || null,
      optionC: item.querySelector(".option-c")?.value || null,
      optionD: item.querySelector(".option-d")?.value || null
    };
    gameData.questions.push(question);
  });
  
  // Validate
  if (gameData.questions.length === 0) {
    await errorModal("Please add at least one question!", 'Validation Error');
    return;
  }
  
  // Send to backend
  try {
    const method = isEditMode ? "PUT" : "POST";
    // Get CSRF token from form
    const csrfToken = document.querySelector('input[name="csrf_token"]')?.value;
    
    const response = await fetch("/ClusteringGame/api/custom-games.php", {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken
      },
      body: JSON.stringify(gameData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      await successModal(
        isEditMode ? "Game updated successfully!" : "Game created successfully!",
        "Success"
      );
      window.location.href = "admin-dashboard.php";
    } else {
      await errorModal("Error: " + result.message, "Error");
    }
  } catch (error) {
    console.error(isEditMode ? "Error updating game:" : "Error creating game:", error);
    await errorModal(
      isEditMode ? "Failed to update game. Please try again." : "Failed to create game. Please try again.",
      "Network Error"
    );
  }
    });
  } else {
    console.error('Form not found! Cannot attach submit handler.');
  }
});


