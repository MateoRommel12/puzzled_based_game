<?php
/**
 * Game Session API
 * Handles saving game scores and session data
 */

require_once __DIR__ . '/../config/database.php';

    header('Content-Type: application/json; charset=utf-8');

    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';

    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');

    if ($method === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    // Check authentication
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Not authenticated'
        ]);
        exit();
    }

    try {
        $db = getDBConnection();
        
        
        switch ($action) {
            case 'save':
                handleSaveGameSession($db);
                break;
                
            case 'get-stats':
                handleGetStats($db);
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
     * Save game session
     */
    function handleSaveGameSession($db) {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            throw new Exception('Method not allowed');
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $userId = $_SESSION['user_id'];
        
        if (!$data) {
            throw new Exception('Invalid JSON data received');
        }
        
        // Validate user exists (user_id is an integer, no collation needed)
        try {
            $stmt = $db->prepare("SELECT user_id, full_name, email FROM users WHERE user_id = ?");
            $stmt->execute([$userId]);
            $userData = $stmt->fetch();
            
            if (!$userData) {
                throw new Exception("User ID $userId not found in database");
            }
            
        } catch (Exception $e) {
            throw new Exception("User validation failed: " . $e->getMessage());
        }
        
        // Validate input
        $gameType = $data['gameType'] ?? '';
        $score = (int)($data['score'] ?? 0);
        $difficulty = $data['difficulty'] ?? 'medium';
        $timeTaken = isset($data['timeTaken']) ? (int)$data['timeTaken'] : null;
        $questionsAnswered = (int)($data['questionsAnswered'] ?? 0);
        $correctAnswers = (int)($data['correctAnswers'] ?? 0);
        $streakCount = (int)($data['streakCount'] ?? 0);
        $hintsUsed = (int)($data['hintsUsed'] ?? 0);
        $sessionData = isset($data['sessionData']) ? json_encode($data['sessionData']) : null;
        
        // For custom games, determine the proper game type based on category/subject
        if ($gameType === 'fill_blanks' || preg_match('/^custom_\d+$/', $gameType)) {
            $gameCategory = $data['gameCategory'] ?? $data['subject'] ?? '';
            
            if ($gameCategory === 'math' || $gameCategory === 'mathematics') {
                $gameType = 'fill_blanks_math';
            } elseif ($gameCategory === 'literacy' || $gameCategory === 'reading' || $gameCategory === 'english') {
                $gameType = 'fill_blanks_literacy';
            } else {
                $gameType = 'custom_game';
            }
        }
        
        // Calculate accuracy
        $accuracy = $questionsAnswered > 0 
            ? round(($correctAnswers / $questionsAnswered) * 100, 2) 
            : 0;
        
        // Valid game types
        $validGameTypes = ['word_scramble', 'reading_comprehension', 'number_puzzle', 'math_challenge', 'budget_manager', 'shopping_list', 'message_composer', 'recipe_calculator', 'fill_blanks', 'fill_blanks_math', 'fill_blanks_literacy', 'custom_game'];
        
        // Check if it's a valid game type or a custom game (custom_X format)
        $isValidGameType = in_array($gameType, $validGameTypes);
        $isCustomGame = preg_match('/^custom_\d+$/', $gameType);
        
        if (!$isValidGameType && !$isCustomGame) {
            throw new Exception('Invalid game type');
        }
        
    // Determine game category for proper math/literacy tracking
    $gameCategory = null;
    if ($gameType === 'fill_blanks' || $gameType === 'fill_blanks_literacy') {
        // Fill in the blanks is always literacy
        $gameCategory = 'literacy';
    } elseif ($gameType === 'fill_blanks_math' || in_array($gameType, ['number_puzzle', 'math_challenge', 'budget_manager', 'recipe_calculator'])) {
        $gameCategory = 'math';
    } elseif (in_array($gameType, ['word_scramble', 'reading_comprehension', 'shopping_list', 'message_composer'])) {
        $gameCategory = 'literacy';
    } elseif ($gameType === 'custom_game' || preg_match('/^custom_\d+$/', $gameType)) {
            // Get category from the subject field (already sent by frontend)
            $subject = $data['subject'] ?? $data['gameCategory'] ?? null;
            
            if ($subject && in_array($subject, ['math', 'literacy'])) {
                $gameCategory = $subject;
            } else {
                // Fallback: try to get game_type (math/literacy) from custom_games table
                $gameId = $data['gameId'] ?? null;
                if ($gameId) {
                    $stmt = $db->prepare("SELECT game_type FROM custom_games WHERE game_id = ?");
                    $stmt->execute([$gameId]);
                    $customGame = $stmt->fetch();
                    if ($customGame) {
                        $gameCategory = $customGame['game_type'];
                    }
                } else {
                    // Last fallback: try by game_name
                    $gameName = $data['gameName'] ?? null;
                    if ($gameName) {
                        $stmt = $db->prepare("SELECT game_type FROM custom_games WHERE game_name = ? LIMIT 1");
                        $stmt->execute([$gameName]);
                        $customGame = $stmt->fetch();
                        if ($customGame) {
                            $gameCategory = $customGame['game_type'];
                        }
                    }
                }
            }
            
        }
        
        // Insert game session
        $stmt = $db->prepare("
            INSERT INTO game_sessions (
                user_id, game_type, game_category, score, difficulty_level, time_taken,
                questions_answered, correct_answers, accuracy, streak_count,
                hints_used, session_data, completed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $userId, $gameType, $gameCategory, $score, $difficulty, $timeTaken,
            $questionsAnswered, $correctAnswers, $accuracy, $streakCount,
            $hintsUsed, $sessionData
        ]);
        
        $sessionId = $db->lastInsertId();
        
        // Update student progress (trigger will handle this, but we can also do it manually)
        $stmt = $db->prepare("CALL update_student_progress(?)");
        $stmt->execute([$userId]);
        
        // Check for achievements
        checkAndAwardAchievements($db, $userId, $gameType, $score, $accuracy);
        
    // Check if clustering should run automatically
    // TEMPORARILY DISABLED - Hostinger has old version without created_at
    /*
    try {
        if (shouldRunClustering($db)) {
            runClusteringAsync();
        }
    } catch (Exception $e) {
        // Log clustering error but don't fail the game session
        error_log("Automatic clustering failed: " . $e->getMessage());
    }
    */
        
        echo json_encode([
            'success' => true,
            'message' => 'Game session saved',
            'sessionId' => $sessionId
        ]);
    }

    /**
     * Get user statistics
     */
    function handleGetStats($db) {
        $userId = $_SESSION['user_id'];
        
        // Get overall progress
        $stmt = $db->prepare("
            SELECT * FROM student_progress WHERE user_id = ?
        ");
        $stmt->execute([$userId]);
        $progress = $stmt->fetch();
        
        // Get game statistics
        $stmt = $db->prepare("
            SELECT * FROM game_statistics WHERE user_id = ?
        ");
        $stmt->execute([$userId]);
        $gameStats = $stmt->fetchAll();
        
        // Get achievements
        $stmt = $db->prepare("
            SELECT * FROM achievements WHERE user_id = ? ORDER BY earned_at DESC
        ");
        $stmt->execute([$userId]);
        $achievements = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'progress' => $progress,
            'gameStats' => $gameStats,
            'achievements' => $achievements
        ]); 
    }

    /**
     * Check and award achievements
     */
    function checkAndAwardAchievements($db, $userId, $gameType, $score, $accuracy) {
        // First game achievement
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM game_sessions WHERE user_id = ?");
        $stmt->execute([$userId]);
        $result = $stmt->fetch();
        
        if ($result['count'] == 1) {
            $db->prepare("CALL award_achievement(?, ?, ?, ?, ?)")->execute([
                $userId,
                'first_game',
                'Getting Started',
                'Completed your first game!',
                '🎮'
            ]);
        }
        
        // Perfect score achievement
        if ($accuracy == 100) {
            $db->prepare("CALL award_achievement(?, ?, ?, ?, ?)")->execute([
                $userId,
                'perfect_score',
                'Perfectionist',
                'Achieved 100% accuracy!',
                '💯'
            ]);
        }
        
        // High scorer achievement
        if ($score >= 100) {
            $db->prepare("CALL award_achievement(?, ?, ?, ?, ?)")->execute([
                $userId,
                'high_scorer',
                'High Scorer',
                'Scored 100 or more points!',
                '⭐'
            ]);
        }
    }

    /**
     * Check if clustering should run automatically
     */
    function shouldRunClustering($db) {
        // Get last clustering time
        $stmt = $db->prepare("SELECT MAX(created_at) as last_clustering FROM clustering_results");
        $stmt->execute();
        $result = $stmt->fetch();
        $lastClustering = $result['last_clustering'];
        
        // If never run before, run it
        if (!$lastClustering) {
            return true;
        }
        
        // Check if it's been more than 24 hours
        $stmt = $db->prepare("SELECT TIMESTAMPDIFF(HOUR, ?, NOW()) as hours_since");
        $stmt->execute([$lastClustering]);
        $result = $stmt->fetch();
        $hoursSince = $result['hours_since'];
        
        // Run if more than 24 hours have passed
        if ($hoursSince >= 24) {
            return true;
        }
        
        // Check if there are enough new games (threshold: 10 games)
        $stmt = $db->prepare("
            SELECT COUNT(*) as new_games
            FROM game_sessions 
            WHERE completed_at > ?
        ");
        $stmt->execute([$lastClustering]);
        $result = $stmt->fetch();
        
        return $result['new_games'] >= 10;
    }

    /**
     * Run clustering asynchronously
     */
    function runClusteringAsync() {
        // Get project root directory
        $projectRoot = dirname(__DIR__);
        $clusteringApi = 'http://localhost' . str_replace($_SERVER['DOCUMENT_ROOT'], '', $projectRoot) . '/api/clustering.php?action=run';
        
        // Make async HTTP request to clustering API
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 1, // Very short timeout for async
                'ignore_errors' => true
            ]
        ]);
        
        // This will start the clustering but not wait for it
        file_get_contents($clusteringApi, false, $context);
    }

