<?php
// Start session and generate CSRF token before any output
require_once '../config/security.php';
$csrfToken = SecurityManager::generateCSRFToken();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Custom Game - Admin Panel</title>
    <link rel="stylesheet" href="../styles/main.css">
    <link rel="stylesheet" href="../styles/admin.css">
    <link rel="stylesheet" href="../styles/modal.css">
    <style>
        .game-builder-container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 2rem;
        }

        .builder-header {
            text-align: center;
            margin-bottom: 3rem;
        }

        .builder-header h1 {
            font-size: 2.5rem;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }

        .builder-sections {
            display: grid;
            gap: 2rem;
        }

        .builder-section {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 2rem;
        }

        .section-title {
            font-size: 1.5rem;
            color: #60a5fa;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .form-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .form-group label {
            color: #a0a0a0;
            font-size: 0.9rem;
            font-weight: 600;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #a0a0a0;
            font-size: 1rem;
        }

        .form-group textarea {
            min-height: 100px;
            resize: vertical;
        }

        .questions-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-top: 1rem;
        }

        .question-item {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 1.5rem;
        }

        .question-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .question-number {
            font-weight: 700;
            color: #3b82f6;
        }

        .remove-btn {
            padding: 0.5rem 1rem;
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            color: #ef4444;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .remove-btn:hover {
            background: rgba(239, 68, 68, 0.3);
        }

        .add-question-btn {
            width: 100%;
            padding: 1rem;
            background: rgba(59, 130, 246, 0.2);
            border: 2px dashed rgba(59, 130, 246, 0.4);
            border-radius: 12px;
            color: #60a5fa;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .add-question-btn:hover {
            background: rgba(59, 130, 246, 0.3);
            border-color: #3b82f6;
        }

        .action-buttons {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
        }

        .btn-primary {
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }

        .btn-secondary {
            padding: 1rem 2rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            color: white;
            font-size: 1.1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
        }
    </style>
</head>
<body>
    <script src="../scripts/admin-auth.js"></script>
    <script src="../scripts/admin-auth-check.js"></script>
    <script src="../scripts/admin-check.js"></script>

    <div class="container">
        <div class="game-builder-container">
            <div class="builder-header">
                <h1>🎮 Create Custom Learning Game</h1>
                <p style="color: #a0a0a0;">Design your own educational game for students</p>
            </div>

            <form id="gameBuilderForm">
                <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($csrfToken); ?>">
                <!-- Game Information Section -->
                <div class="builder-section">
                    <h2 class="section-title">📋 Game Information</h2>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="gameName">Game Name *</label>
                            <input type="text" id="gameName" required placeholder="e.g., Science Quiz">
                        </div>

                        <div class="form-group">
                            <label for="gameType">Learning Type *</label>
                            <select id="gameType" required onchange="filterCategoryOptions()">
                                <option value="">Select type...</option>
                                <option value="literacy">Literacy</option>
                                <option value="math">Math</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="gameCategory">Category *</label>
                            <select id="gameCategory" required onchange="toggleGameTypeSpecificFields()">
                                <option value="">Select category...</option>
                                <option value="quiz">Quiz</option>
                                <option value="puzzle">Puzzle</option>
                                <option value="word">Word Game</option>
                                <option value="fill_blanks">Fill in the Blanks</option>
                                <option value="jumbled_sentences">Jumbled Sentences</option>
                                <option value="math">Math Challenge</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="difficulty">Difficulty *</label>
                            <select id="difficulty" required>
                                <option value="">Select difficulty...</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="timeLimit">Time Limit (seconds)</label>
                            <input type="number" id="timeLimit" placeholder="e.g., 300" min="0">
                        </div>

                        <div class="form-group">
                            <label for="iconEmoji">Icon Emoji</label>
                            <input type="text" id="iconEmoji" placeholder="e.g., 🧪" maxlength="2">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="description">Description</label>
                        <textarea id="description" placeholder="Describe what students will learn..."></textarea>
                    </div>
                </div>

                <!-- Fill in the Blanks Specific Section -->
                <div class="builder-section" id="fillBlanksSection" style="display: none;">
                    <h2 class="section-title">📝 Fill in the Blanks Passages</h2>
                    
                    <div id="fillBlanksPassagesList" class="questions-list">
                        <!-- Fill-blanks passages will be added here dynamically -->
                    </div>

                    <button type="button" class="add-question-btn" onclick="addFillBlanksPassage()">
                        + Add Passage
                    </button>
                </div>

                <!-- Jumbled Sentences Specific Section -->
                <div class="builder-section" id="jumbledSentencesSection" style="display: none;">
                    <h2 class="section-title">🔀 Jumbled Sentences</h2>
                    
                    <div id="jumbledSentencesList" class="questions-list">
                        <!-- Jumbled sentences will be added here dynamically -->
                    </div>

                    <button type="button" class="add-question-btn" onclick="addJumbledSentence()">
                        + Add Jumbled Sentence
                    </button>
                </div>

                <!-- Questions Section -->
                <div class="builder-section" id="questionsSection" style="display: none;">
                    <h2 class="section-title">❓ Questions</h2>
                    
                    <div id="questionsList" class="questions-list">
                        <!-- Questions will be added here dynamically -->
                    </div>

                    <button type="button" class="add-question-btn" onclick="addQuestion()">
                        + Add Question
                    </button>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                    <button type="button" class="btn-secondary" onclick="window.location.href='admin-dashboard.php'">
                        Cancel
                    </button>
                    <button type="submit" class="btn-primary">
                        💾 Save Game
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script src="../scripts/modal.js"></script>
    <script src="../scripts/game-builder.js"></script>
</body>
</html>

