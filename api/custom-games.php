<?php
/**
 * Custom Games API
 * Handle CRUD operations for admin-created games
 * SECURITY: Production-ready with CSRF, rate limiting, and validation
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/middleware.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$method = $_SERVER['REQUEST_METHOD'];

// Apply security middleware for API requests
SecurityManager::validateAPIRequest();

try {
    $db = getDBConnection();
    
    switch ($method) {
        case 'GET':
            handleGet($db);
            break;
        case 'POST':
            handlePost($db);
            break;
        case 'PUT':
            handlePut($db);
            break;
        case 'DELETE':
            handleDelete($db);
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}

// GET - Fetch games or specific game
function handleGet($db) {
    $gameId = $_GET['gameId'] ?? null;
    $includeQuestions = isset($_GET['includeQuestions']);
    
    if ($gameId) {
        // Get specific game
        $stmt = $db->prepare("
            SELECT cg.*, a.username as creator_username
            FROM custom_games cg
            LEFT JOIN admins a ON cg.created_by = a.admin_id
            WHERE cg.game_id = ? AND cg.is_active = 1
        ");
        $stmt->execute([$gameId]);
        $game = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$game) {
            echo json_encode(['success' => false, 'message' => 'Game not found']);
            return;
        }
        
        if ($includeQuestions) {
            // Handle different game categories
            if ($game['game_category'] === 'fill_blanks') {
                // Load fill-blanks questions
                $stmt = $db->prepare("
                    SELECT fbq.*, 
                           (SELECT GROUP_CONCAT(
                               CONCAT(fbp.blank_number, ':', fbp.blank_text, ':', fbp.position_in_text, ':', fbp.length)
                               ORDER BY fbp.blank_number
                               SEPARATOR '|'
                           ) FROM fill_blanks_positions fbp WHERE fbp.question_id = fbq.question_id) as blanks,
                           (SELECT GROUP_CONCAT(
                               CONCAT(fbc.choice_text, ':', fbc.is_correct, ':', fbc.order_index)
                               ORDER BY fbc.position_id, fbc.order_index
                               SEPARATOR '|'
                           ) FROM fill_blanks_positions fbp2 
                           LEFT JOIN fill_blanks_choices fbc ON fbp2.position_id = fbc.position_id 
                           WHERE fbp2.question_id = fbq.question_id) as choices
                    FROM fill_blanks_questions fbq
                    WHERE fbq.game_id = ?
                    ORDER BY fbq.question_id ASC
                ");
                $stmt->execute([$gameId]);
                $fillBlanksQuestions = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Debug: Log the raw fill-blanks data
                error_log("Fill-blanks questions loaded: " . json_encode($fillBlanksQuestions));
                
                // Transform fill-blanks data into question format
                $game['questions'] = [];
                foreach ($fillBlanksQuestions as $fbq) {
                    $question = [
                        'question_id' => $fbq['question_id'],
                        'question_text' => $fbq['question_text'],
                        'question_type' => 'fill_blanks',
                        'difficulty' => $fbq['difficulty'],
                        'time_limit' => $fbq['time_limit'],
                        'points' => $fbq['points'],
                        'hint' => $fbq['hint'],
                        'blanks' => $fbq['blanks'],
                        'choices' => $fbq['choices']
                    ];
                    $game['questions'][] = $question;
                }
            } else {
                // Load regular custom game questions
                $stmt = $db->prepare("
                    SELECT * FROM custom_game_questions 
                    WHERE game_id = ? 
                    ORDER BY order_number ASC
                ");
                $stmt->execute([$gameId]);
                $game['questions'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
        }
        
        echo json_encode(['success' => true, 'game' => $game]);
        
    } else {
        // Get all games with question counts
        $stmt = $db->query("
            SELECT cg.*, 
                   a.username as creator_username,
                   CASE 
                       WHEN cg.game_category = 'fill_blanks' THEN 
                           (SELECT COUNT(*) FROM fill_blanks_questions WHERE game_id = cg.game_id)
                       ELSE 
                           COUNT(DISTINCT cgq.question_id)
                   END as total_questions,
                   COALESCE(COUNT(DISTINCT gs.session_id), 0) as play_count
            FROM custom_games cg
            LEFT JOIN admins a ON cg.created_by = a.admin_id
            LEFT JOIN custom_game_questions cgq ON cg.game_id = cgq.game_id
            LEFT JOIN game_sessions gs ON CONCAT('custom_', cg.game_id) = gs.game_type
            WHERE cg.is_active = 1
            GROUP BY cg.game_id
            ORDER BY cg.created_at DESC
        ");
        $games = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'games' => $games]);
    }
}

// POST - Create new game
function handlePost($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        SecurityManager::logSecurityEvent('Invalid data in game creation', [
            'ip' => $_SERVER['REMOTE_ADDR'],
            'user_id' => $_SESSION['user_id'] ?? 'unknown'
        ]);
        echo json_encode(['success' => false, 'message' => 'Invalid data']);
        return;
    }
    
    // Rate limiting for game creation
    $userId = $_SESSION['user_id'] ?? $_SERVER['REMOTE_ADDR'];
    if (!RateLimitMiddleware::checkGameCreation($userId)) {
        SecurityManager::logSecurityEvent('Game creation rate limit exceeded', [
            'user_id' => $userId,
            'ip' => $_SERVER['REMOTE_ADDR']
        ]);
        echo json_encode([
            'success' => false,
            'message' => 'Too many game creation attempts. Please try again later.'
        ]);
        return;
    }
    
    // Apply input validation middleware
    $errors = ValidationMiddleware::validate($data, 'create_game');
    if (!empty($errors)) {
        echo json_encode(ValidationMiddleware::handleValidationError($errors));
        return;
    }
    
    // Sanitize input
    $data = ValidationMiddleware::sanitizeInput($data);
    
    // Handle fill-blanks games differently
    if ($data['gameCategory'] === 'fill_blanks') {
        handleFillBlanksGame($db, $data);
        return;
    }
    
    // Validate required fields for regular games
    $required = ['gameName', 'gameType', 'gameCategory', 'difficulty', 'questions'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            SecurityManager::logSecurityEvent('Missing field in game creation', [
                'field' => $field,
                'user_id' => $_SESSION['user_id'] ?? 'unknown',
                'ip' => $_SERVER['REMOTE_ADDR']
            ]);
            echo json_encode(['success' => false, 'message' => "Missing field: $field"]);
            return;
        }
    }
    
    $db->beginTransaction();
    
    try {
        // Create game slug
        $slug = generateUniqueSlug($db, $data['gameName']);
        
        // Insert game
        $stmt = $db->prepare("
            INSERT INTO custom_games 
            (game_name, game_slug, game_type, game_category, description, icon_emoji, difficulty, time_limit, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['gameName'],
            $slug,
            $data['gameType'],
            $data['gameCategory'],
            $data['description'] ?? null,
            $data['iconEmoji'] ?? '🎮',
            $data['difficulty'],
            $data['timeLimit'] ?? null,
            1 // TODO: Get from session
        ]);
        
        $gameId = $db->lastInsertId();
        
        // Insert questions
        $stmt = $db->prepare("
            INSERT INTO custom_game_questions 
            (game_id, question_text, question_type, correct_answer, option_a, option_b, option_c, option_d, hint, points, order_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($data['questions'] as $question) {
            $stmt->execute([
                $gameId,
                $question['questionText'],
                $question['questionType'],
                $question['correctAnswer'],
                $question['optionA'] ?? null,
                $question['optionB'] ?? null,
                $question['optionC'] ?? null,
                $question['optionD'] ?? null,
                $question['hint'] ?? null,
                $question['points'] ?? 10,
                $question['orderNumber']
            ]);
        }
        
        $db->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Game created successfully',
            'gameId' => $gameId,
            'slug' => $slug
        ]);
        
    } catch (Exception $e) {
        $db->rollBack();
        echo json_encode(['success' => false, 'message' => 'Failed to create game: ' . $e->getMessage()]);
    }
}

// PUT - Update game
function handlePut($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['gameId'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid data or missing game ID']);
        return;
    }
    
    $gameId = $data['gameId'];
    
    // Validate required fields
    $required = ['gameName', 'gameType', 'gameCategory', 'difficulty'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            echo json_encode(['success' => false, 'message' => "Missing field: $field"]);
            return;
        }
    }
    
    $db->beginTransaction();
    
    try {
        // Check if game exists
        $stmt = $db->prepare("SELECT game_id, game_category FROM custom_games WHERE game_id = ? AND is_active = 1");
        $stmt->execute([$gameId]);
        $existingGame = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$existingGame) {
            echo json_encode(['success' => false, 'message' => 'Game not found']);
            return;
        }
        
        // Update game basic info
        $stmt = $db->prepare("
            UPDATE custom_games 
            SET game_name = ?, 
                game_type = ?, 
                game_category = ?, 
                description = ?, 
                icon_emoji = ?, 
                difficulty = ?, 
                time_limit = ?,
                updated_at = NOW()
            WHERE game_id = ?
        ");
        
        $stmt->execute([
            $data['gameName'],
            $data['gameType'],
            $data['gameCategory'],
            $data['description'] ?? null,
            $data['iconEmoji'] ?? '🎮',
            $data['difficulty'],
            $data['timeLimit'] ?? null,
            $gameId
        ]);
        
        // Delete existing questions based on game category
        if ($data['gameCategory'] === 'fill_blanks') {
            // Delete fill-blanks data
            $stmt = $db->prepare("SELECT question_id FROM fill_blanks_questions WHERE game_id = ?");
            $stmt->execute([$gameId]);
            $questions = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            if (!empty($questions)) {
                $questionIds = implode(',', array_map('intval', $questions));
                
                // Get position IDs
                $stmt = $db->query("SELECT position_id FROM fill_blanks_positions WHERE question_id IN ($questionIds)");
                $positions = $stmt->fetchAll(PDO::FETCH_COLUMN);
                
                if (!empty($positions)) {
                    $positionIds = implode(',', array_map('intval', $positions));
                    $db->exec("DELETE FROM fill_blanks_choices WHERE position_id IN ($positionIds)");
                }
                
                $db->exec("DELETE FROM fill_blanks_positions WHERE question_id IN ($questionIds)");
                $db->exec("DELETE FROM fill_blanks_questions WHERE game_id = $gameId");
            }
            
            // Insert new fill-blanks passages
            if (!empty($data['passages'])) {
                foreach ($data['passages'] as $index => $passage) {
                    // Insert question
                    $stmt = $db->prepare("
                        INSERT INTO fill_blanks_questions 
                        (game_id, question_text, difficulty, time_limit, points, hint)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ");
                    
                    $stmt->execute([
                        $gameId,
                        $passage['passageText'],
                        $data['difficulty'],
                        $data['timeLimit'] ?? null,
                        10,
                        $passage['hintText'] ?? null
                    ]);
                    
                    $questionId = $db->lastInsertId();
                    
                    // Parse and insert blanks
                    $passageText = $passage['passageText'];
                    $correctWords = array_map('trim', explode(',', $passage['correctWords']));
                    $wordBank = array_map('trim', explode(',', $passage['wordBank']));
                    
                    $blankPositions = [];
                    $position = 0;
                    $blankNumber = 1;
                    
                    while (($pos = strpos($passageText, '[BLANK]', $position)) !== false) {
                        $blankPositions[] = [
                            'position' => $pos,
                            'number' => $blankNumber,
                            'word' => isset($correctWords[$blankNumber - 1]) ? $correctWords[$blankNumber - 1] : ''
                        ];
                        $position = $pos + 7;
                        $blankNumber++;
                    }
                    
                    foreach ($blankPositions as $blank) {
                        $stmt = $db->prepare("
                            INSERT INTO fill_blanks_positions 
                            (question_id, blank_number, blank_text, position_in_text, length)
                            VALUES (?, ?, ?, ?, ?)
                        ");
                        
                        $stmt->execute([
                            $questionId,
                            $blank['number'],
                            $blank['word'],
                            $blank['position'],
                            strlen($blank['word'])
                        ]);
                        
                        $positionId = $db->lastInsertId();
                        $distractorCount = intval($passage['distractorCount'] ?? 3);
                        
                        // Add correct word
                        $stmt = $db->prepare("
                            INSERT INTO fill_blanks_choices 
                            (position_id, choice_text, is_correct, order_index)
                            VALUES (?, ?, 1, 1)
                        ");
                        $stmt->execute([$positionId, $blank['word']]);
                        
                        // Add distractors
                        $distractorIndex = 2;
                        foreach ($wordBank as $word) {
                            if ($word !== $blank['word'] && $distractorIndex <= $distractorCount + 1) {
                                $stmt = $db->prepare("
                                    INSERT INTO fill_blanks_choices 
                                    (position_id, choice_text, is_correct, order_index)
                                    VALUES (?, ?, 0, ?)
                                ");
                                $stmt->execute([$positionId, $word, $distractorIndex]);
                                $distractorIndex++;
                            }
                        }
                    }
                }
            }
        } else {
            // Delete regular questions
            $stmt = $db->prepare("DELETE FROM custom_game_questions WHERE game_id = ?");
            $stmt->execute([$gameId]);
            
            // Insert new questions
            if (!empty($data['questions'])) {
                $stmt = $db->prepare("
                    INSERT INTO custom_game_questions 
                    (game_id, question_text, question_type, correct_answer, option_a, option_b, option_c, option_d, hint, points, order_number)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                
                foreach ($data['questions'] as $question) {
                    $stmt->execute([
                        $gameId,
                        $question['questionText'],
                        $question['questionType'],
                        $question['correctAnswer'],
                        $question['optionA'] ?? null,
                        $question['optionB'] ?? null,
                        $question['optionC'] ?? null,
                        $question['optionD'] ?? null,
                        $question['hint'] ?? null,
                        $question['points'] ?? 10,
                        $question['orderNumber']
                    ]);
                }
            }
        }
        
        $db->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Game updated successfully',
            'gameId' => $gameId
        ]);
        
    } catch (Exception $e) {
        $db->rollBack();
        error_log("Error updating game: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to update game: ' . $e->getMessage()]);
    }
}

// DELETE - Delete game
function handleDelete($db) {
    $gameId = $_GET['gameId'] ?? null;
    
    if (!$gameId) {
        echo json_encode(['success' => false, 'message' => 'Game ID required']);
        return;
    }
    
    $db->beginTransaction();
    
    try {
        // Check if this is a fill-blanks game
        $stmt = $db->prepare("SELECT game_category FROM custom_games WHERE game_id = ?");
        $stmt->execute([$gameId]);
        $game = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$game) {
            echo json_encode(['success' => false, 'message' => 'Game not found']);
            return;
        }
        
        // If it's a fill-blanks game, delete related records
        if ($game['game_category'] === 'fill_blanks') {
            // Get question IDs for this game
            $stmt = $db->prepare("SELECT question_id FROM fill_blanks_questions WHERE game_id = ?");
            $stmt->execute([$gameId]);
            $questions = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            if (!empty($questions)) {
                $questionIds = implode(',', array_map('intval', $questions));
                
                // Get position IDs
                $stmt = $db->query("SELECT position_id FROM fill_blanks_positions WHERE question_id IN ($questionIds)");
                $positions = $stmt->fetchAll(PDO::FETCH_COLUMN);
                
                if (!empty($positions)) {
                    $positionIds = implode(',', array_map('intval', $positions));
                    
                    // Delete choices
                    $db->exec("DELETE FROM fill_blanks_choices WHERE position_id IN ($positionIds)");
                }
                
                // Delete positions
                $db->exec("DELETE FROM fill_blanks_positions WHERE question_id IN ($questionIds)");
                
                // Delete questions
                $db->exec("DELETE FROM fill_blanks_questions WHERE game_id = $gameId");
            }
        } else {
            // Delete regular custom game questions
            $stmt = $db->prepare("DELETE FROM custom_game_questions WHERE game_id = ?");
            $stmt->execute([$gameId]);
        }
        
        // Delete game sessions associated with this game
        $gameType = "custom_" . $gameId;
        $stmt = $db->prepare("DELETE FROM game_sessions WHERE game_type = ?");
        $stmt->execute([$gameType]);
        
        // Finally, delete the game itself (or soft delete)
        $stmt = $db->prepare("DELETE FROM custom_games WHERE game_id = ?");
        // For soft delete, use: UPDATE custom_games SET is_active = 0 WHERE game_id = ?
        $stmt->execute([$gameId]);
        
        $db->commit();
        
        echo json_encode(['success' => true, 'message' => 'Game deleted successfully']);
        
    } catch (Exception $e) {
        $db->rollBack();
        echo json_encode(['success' => false, 'message' => 'Failed to delete game: ' . $e->getMessage()]);
    }
}

/**
 * Handle saving fill-in-the-blanks games with multiple passages
 */
function handleFillBlanksGame($db, $data) {
    // Debug: Log received data
    error_log("Fill blanks data received: " . json_encode($data));
    
    // Validate required fields for fill-blanks games
    $required = ['gameName', 'gameType', 'gameCategory', 'difficulty', 'passages'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            error_log("Missing field: $field in data: " . json_encode($data));
            echo json_encode(['success' => false, 'message' => "Missing field: $field"]);
            return;
        }
    }
    
    // Validate that passages is an array and not empty
    if (!is_array($data['passages']) || count($data['passages']) === 0) {
        echo json_encode(['success' => false, 'message' => "At least one passage is required"]);
        return;
    }
    
    $db->beginTransaction();
    
    try {
        // 1. Save the custom game
        $stmt = $db->prepare("
            INSERT INTO custom_games 
            (game_name, game_slug, game_type, game_category, description, icon_emoji, difficulty, time_limit, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $gameSlug = generateUniqueSlug($db, $data['gameName']);
        $stmt->execute([
            $data['gameName'],
            $gameSlug,
            $data['gameType'],
            $data['gameCategory'],
            $data['description'] ?? null,
            $data['iconEmoji'] ?? '📝',
            $data['difficulty'],
            $data['timeLimit'] ?? null,
            1 // TODO: Get from session
        ]);
        
        $gameId = $db->lastInsertId();
        
        $totalBlanks = 0;
        $questionIds = [];
        
        // 2. Process each passage
        foreach ($data['passages'] as $index => $passage) {
            // Validate passage data
            if (empty($passage['passageText']) || empty($passage['wordBank']) || empty($passage['correctWords'])) {
                throw new Exception("Passage " . ($index + 1) . " is missing required fields");
            }
            
            // Save the fill-blanks question
            $stmt = $db->prepare("
                INSERT INTO fill_blanks_questions 
                (game_id, question_text, difficulty, time_limit, points, hint)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $gameId,
                $passage['passageText'],
                $data['difficulty'],
                $data['timeLimit'] ?? null,
                10, // Default points
                $passage['hintText'] ?? null
            ]);
            
            $questionId = $db->lastInsertId();
            $questionIds[] = $questionId;
            
            // 3. Parse blanks from passage text
            $passageText = $passage['passageText'];
            $correctWords = array_map('trim', explode(',', $passage['correctWords']));
            $wordBank = array_map('trim', explode(',', $passage['wordBank']));
            
            // Find [BLANK] positions in the text
            $blankPositions = [];
            $position = 0;
            $blankNumber = 1;
            
            while (($pos = strpos($passageText, '[BLANK]', $position)) !== false) {
                $blankPositions[] = [
                    'position' => $pos,
                    'number' => $blankNumber,
                    'word' => isset($correctWords[$blankNumber - 1]) ? $correctWords[$blankNumber - 1] : ''
                ];
                $position = $pos + 7; // Length of '[BLANK]'
                $blankNumber++;
            }
            
            $totalBlanks += count($blankPositions);
            
            // 4. Save blank positions for this passage
            foreach ($blankPositions as $blank) {
                $stmt = $db->prepare("
                    INSERT INTO fill_blanks_positions 
                    (question_id, blank_number, blank_text, position_in_text, length)
                    VALUES (?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $questionId,
                    $blank['number'],
                    $blank['word'],
                    $blank['position'],
                    strlen($blank['word'])
                ]);
                
                $positionId = $db->lastInsertId();
                
                // 5. Save word choices for this position
                $distractorCount = intval($passage['distractorCount'] ?? 3);
                $allWords = $wordBank;
                
                // Add correct word to choices
                $stmt = $db->prepare("
                    INSERT INTO fill_blanks_choices 
                    (position_id, choice_text, is_correct, order_index)
                    VALUES (?, ?, 1, 1)
                ");
                $stmt->execute([$positionId, $blank['word']]);
                
                // Add distractors (other words from word bank)
                $distractorIndex = 2;
                foreach ($allWords as $word) {
                    if ($word !== $blank['word'] && $distractorIndex <= $distractorCount + 1) {
                        $stmt = $db->prepare("
                            INSERT INTO fill_blanks_choices 
                            (position_id, choice_text, is_correct, order_index)
                            VALUES (?, ?, 0, ?)
                        ");
                        $stmt->execute([$positionId, $word, $distractorIndex]);
                        $distractorIndex++;
                    }
                }
            }
        }
        
        $db->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Fill in the blanks game created successfully',
            'gameId' => $gameId,
            'questionIds' => $questionIds,
            'totalPassages' => count($data['passages']),
            'totalBlanks' => $totalBlanks
        ]);
        
    } catch (Exception $e) {
        $db->rollBack();
        error_log("Error creating fill blanks game: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

/**
 * Generate a unique slug for the game
 */
function generateUniqueSlug($db, $gameName) {
    // Create base slug from game name
    $baseSlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $gameName));
    $baseSlug = trim($baseSlug, '-'); // Remove leading/trailing dashes
    
    // If empty, use a default
    if (empty($baseSlug)) {
        $baseSlug = 'game';
    }
    
    $slug = $baseSlug;
    $counter = 1;
    
    // Check if slug exists and increment counter until we find a unique one
    while (true) {
        $stmt = $db->prepare("SELECT COUNT(*) FROM custom_games WHERE game_slug = ?");
        $stmt->execute([$slug]);
        $count = $stmt->fetchColumn();
        
        if ($count == 0) {
            // Slug is unique
            break;
        }
            
        // Slug exists, try with counter
        $slug = $baseSlug . '-' . $counter;
        $counter++;
    }
    
    return $slug;
}
?>

