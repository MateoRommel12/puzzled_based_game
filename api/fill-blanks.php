<?php
/**
 * Fill in the Blanks Game API
 * Handle loading and playing fill-in-the-blanks games
 */

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    $db = getDBConnection();
    
    switch ($action) {
        case 'get-game':
            handleGetGame($db);
            break;
        case 'save-answer':
            handleSaveAnswer($db);
            break;
        case 'get-games':
            handleGetGames($db);
            break;
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

/**
 * Get fill-in-the-blanks game data
 */
function handleGetGame($db) {
    $gameId = $_GET['gameId'] ?? 1;
    
    // Get the game
    $stmt = $db->prepare("
        SELECT cg.game_id, cg.game_name, cg.description, cg.game_category,
               fbq.question_id, fbq.question_text, fbq.difficulty, 
               fbq.time_limit, fbq.points, fbq.hint
        FROM custom_games cg
        JOIN fill_blanks_questions fbq ON cg.game_id = fbq.game_id
        WHERE cg.game_id = ? AND cg.game_category = 'fill_blanks' AND cg.is_active = 1
        LIMIT 1
    ");
    $stmt->execute([$gameId]);
    $game = $stmt->fetch();
    
    if (!$game) {
        throw new Exception('Game not found');
    }
    
    // Get blank positions and choices
    $stmt = $db->prepare("
        SELECT fbp.position_id, fbp.blank_number, fbp.blank_text, 
               fbp.position_in_text, fbp.length,
               fbc.choice_id, fbc.choice_text, fbc.is_correct, fbc.order_index
        FROM fill_blanks_positions fbp
        LEFT JOIN fill_blanks_choices fbc ON fbp.position_id = fbc.position_id
        WHERE fbp.question_id = ?
        ORDER BY fbp.blank_number, fbc.order_index
    ");
    $stmt->execute([$game['question_id']]);
    $choices = $stmt->fetchAll();
    
    // Organize data by position
    $positions = [];
    foreach ($choices as $choice) {
        $posId = $choice['position_id'];
        if (!isset($positions[$posId])) {
            $positions[$posId] = [
                'position_id' => $choice['position_id'],
                'blank_number' => $choice['blank_number'],
                'blank_text' => $choice['blank_text'],
                'position_in_text' => $choice['position_in_text'],
                'length' => $choice['length'],
                'choices' => []
            ];
        }
        
        if ($choice['choice_id']) {
            $positions[$posId]['choices'][] = [
                'choice_id' => $choice['choice_id'],
                'choice_text' => $choice['choice_text'],
                'is_correct' => (bool)$choice['is_correct'],
                'order_index' => $choice['order_index']
            ];
        }
    }
    
    // Add positions to game data
    $game['positions'] = array_values($positions);
    
    echo json_encode([
        'success' => true,
        'data' => $game
    ]);
}

/**
 * Save student answer
 */
function handleSaveAnswer($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON data');
    }
    
    $required = ['sessionId', 'positionId', 'answer'];
    foreach ($required as $field) {
        if (!isset($input[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }
    
    // Check if answer is correct
    $stmt = $db->prepare("
        SELECT blank_text, choice_id 
        FROM fill_blanks_positions fbp
        LEFT JOIN fill_blanks_choices fbc ON fbp.position_id = fbc.position_id 
            AND fbc.choice_text = ? AND fbc.is_correct = 1
        WHERE fbp.position_id = ?
    ");
    $stmt->execute([$input['answer'], $input['positionId']]);
    $result = $stmt->fetch();
    
    $isCorrect = !empty($result['choice_id']);
    
    // Save the answer
    $stmt = $db->prepare("
        INSERT INTO fill_blanks_answers (session_id, position_id, user_answer, is_correct, time_taken)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $input['sessionId'],
        $input['positionId'],
        $input['answer'],
        $isCorrect ? 1 : 0,
        $input['timeTaken'] ?? 0
    ]);
    
    echo json_encode([
        'success' => true,
        'isCorrect' => $isCorrect,
        'message' => $isCorrect ? 'Correct!' : 'Incorrect. Try again.'
    ]);
}

/**
 * Get list of available fill-in-the-blanks games
 */
function handleGetGames($db) {
    $stmt = $db->prepare("
        SELECT cg.game_id, cg.game_name, cg.description, cg.difficulty,
               COUNT(fbq.question_id) as question_count,
               AVG(fbq.points) as avg_points
        FROM custom_games cg
        LEFT JOIN fill_blanks_questions fbq ON cg.game_id = fbq.game_id
        WHERE cg.game_category = 'fill_blanks' AND cg.is_active = 1
        GROUP BY cg.game_id
        ORDER BY cg.created_at DESC
    ");
    $stmt->execute();
    $games = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'games' => $games
    ]);
}
?>
