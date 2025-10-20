-- ============================================
-- Student Clustering Game Platform Database
-- Monolithic Architecture Schema
-- ============================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS clustering_results;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS game_sessions;
DROP TABLE IF EXISTS student_progress;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS users;

-- ============================================
-- 1. USERS TABLE
-- Stores student account information
-- ============================================
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_active (is_active),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. ADMINS TABLE
-- Stores admin account information
-- ============================================
CREATE TABLE admins (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. STUDENT_PROGRESS TABLE
-- Tracks overall student progress and statistics
-- ============================================
CREATE TABLE student_progress (
    progress_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_score INT DEFAULT 0,
    games_played INT DEFAULT 0,
    literacy_progress DECIMAL(5,2) DEFAULT 0.00, -- Percentage (0-100)
    math_progress DECIMAL(5,2) DEFAULT 0.00,     -- Percentage (0-100)
    performance_level ENUM('low', 'medium', 'high') DEFAULT 'low',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_progress (user_id),
    INDEX idx_performance (performance_level),
    INDEX idx_total_score (total_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. GAME_SESSIONS TABLE
-- Records each game play session
-- ============================================
CREATE TABLE game_sessions (
    session_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    game_type ENUM('word_scramble', 'reading_comprehension', 'number_puzzle', 'math_challenge') NOT NULL,
    score INT DEFAULT 0,
    difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    time_taken INT, -- Time in seconds
    questions_answered INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    accuracy DECIMAL(5,2), -- Percentage (0-100)
    streak_count INT DEFAULT 0,
    hints_used INT DEFAULT 0,
    session_data JSON, -- Store additional game-specific data
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_game (user_id, game_type),
    INDEX idx_game_type (game_type),
    INDEX idx_score (score),
    INDEX idx_completed (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. ACHIEVEMENTS TABLE
-- Tracks student achievements and badges
-- ============================================
CREATE TABLE achievements (
    achievement_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    achievement_type VARCHAR(100) NOT NULL,
    achievement_name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- Emoji or icon identifier
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_achievements (user_id),
    INDEX idx_achievement_type (achievement_type),
    INDEX idx_earned_at (earned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. CLUSTERING_RESULTS TABLE
-- Stores ML clustering analysis results
-- ============================================
CREATE TABLE clustering_results (
    cluster_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    cluster_number INT NOT NULL,
    cluster_label VARCHAR(100), -- e.g., 'High Achiever', 'Needs Support', etc.
    literacy_score DECIMAL(5,2),
    math_score DECIMAL(5,2),
    overall_performance DECIMAL(5,2),
    features JSON, -- Store feature vector used for clustering
    analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_current BOOLEAN DEFAULT TRUE, -- Mark the most recent clustering
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_cluster (user_id, is_current),
    INDEX idx_cluster_number (cluster_number),
    INDEX idx_analysis_date (analysis_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. GAME_STATISTICS TABLE
-- Aggregate statistics per game type for each user
-- ============================================
CREATE TABLE game_statistics (
    stat_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    game_type ENUM('word_scramble', 'reading_comprehension', 'number_puzzle', 'math_challenge') NOT NULL,
    total_plays INT DEFAULT 0,
    best_score INT DEFAULT 0,
    total_score INT DEFAULT 0,
    average_score DECIMAL(8,2) DEFAULT 0.00,
    average_accuracy DECIMAL(5,2) DEFAULT 0.00,
    total_time_played INT DEFAULT 0, -- Total seconds
    last_played TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_game (user_id, game_type),
    INDEX idx_game_stats (game_type, best_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT ADMIN ACCOUNT
-- Username: admin, Password: admin123
-- ============================================
INSERT INTO admins (username, password_hash, full_name, email) VALUES 
('admin', 'pakantot_09', 'System Administrator', 'alvinsantiago12344@gmail.com');
-- Note: Password hash is for 'admin123' - should be regenerated with proper hashing

-- ============================================
-- VIEWS FOR EASY DATA ACCESS
-- ============================================

-- View: Student Performance Overview
CREATE OR REPLACE VIEW v_student_performance AS
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    sp.total_score,
    sp.games_played,
    sp.literacy_progress,
    sp.math_progress,
    sp.performance_level,
    u.last_login,
    u.created_at
FROM users u
LEFT JOIN student_progress sp ON u.user_id = sp.user_id
WHERE u.is_active = TRUE;

-- View: Game Activity Summary
CREATE OR REPLACE VIEW v_game_activity AS
SELECT 
    gs.game_type,
    COUNT(DISTINCT gs.user_id) as unique_players,
    COUNT(gs.session_id) as total_sessions,
    AVG(gs.score) as average_score,
    AVG(gs.accuracy) as average_accuracy,
    SUM(gs.time_taken) as total_time_played
FROM game_sessions gs
WHERE gs.completed_at IS NOT NULL
GROUP BY gs.game_type;

-- View: Current Clustering Distribution
CREATE OR REPLACE VIEW v_current_clustering AS
SELECT 
    cr.cluster_number,
    cr.cluster_label,
    COUNT(DISTINCT cr.user_id) as student_count,
    AVG(cr.literacy_score) as avg_literacy_score,
    AVG(cr.math_score) as avg_math_score,
    AVG(cr.overall_performance) as avg_overall_performance
FROM clustering_results cr
WHERE cr.is_current = TRUE
GROUP BY cr.cluster_number, cr.cluster_label;

-- View: Recent Activity (Last 30 days)
CREATE OR REPLACE VIEW v_recent_activity AS
SELECT 
    u.user_id,
    u.full_name,
    COUNT(gs.session_id) as sessions_last_30_days,
    SUM(gs.score) as total_score_last_30_days
FROM users u
LEFT JOIN game_sessions gs ON u.user_id = gs.user_id 
    AND gs.started_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.user_id, u.full_name;

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Procedure: Update Student Progress
DELIMITER $$
CREATE PROCEDURE update_student_progress(IN p_user_id INT)
BEGIN
    DECLARE v_total_score INT;
    DECLARE v_games_played INT;
    DECLARE v_literacy_score DECIMAL(5,2);
    DECLARE v_math_score DECIMAL(5,2);
    DECLARE v_performance_level VARCHAR(10);
    
    -- Calculate total score and games played
    SELECT 
        COALESCE(SUM(score), 0),
        COUNT(session_id)
    INTO v_total_score, v_games_played
    FROM game_sessions
    WHERE user_id = p_user_id AND completed_at IS NOT NULL;
    
    -- Calculate literacy progress (from word_scramble and reading_comprehension)
    SELECT 
        COALESCE(AVG(accuracy), 0)
    INTO v_literacy_score
    FROM game_sessions
    WHERE user_id = p_user_id 
        AND game_type IN ('word_scramble', 'reading_comprehension')
        AND completed_at IS NOT NULL;
    
    -- Calculate math progress (from number_puzzle and math_challenge)
    SELECT 
        COALESCE(AVG(accuracy), 0)
    INTO v_math_score
    FROM game_sessions
    WHERE user_id = p_user_id 
        AND game_type IN ('number_puzzle', 'math_challenge')
        AND completed_at IS NOT NULL;
    
    -- Determine performance level
    SET v_performance_level = CASE
        WHEN (v_literacy_score + v_math_score) / 2 >= 80 THEN 'high'
        WHEN (v_literacy_score + v_math_score) / 2 >= 50 THEN 'medium'
        ELSE 'low'
    END;
    
    -- Update or insert student progress
    INSERT INTO student_progress 
        (user_id, total_score, games_played, literacy_progress, math_progress, performance_level)
    VALUES 
        (p_user_id, v_total_score, v_games_played, v_literacy_score, v_math_score, v_performance_level)
    ON DUPLICATE KEY UPDATE
        total_score = v_total_score,
        games_played = v_games_played,
        literacy_progress = v_literacy_score,
        math_progress = v_math_score,
        performance_level = v_performance_level,
        updated_at = CURRENT_TIMESTAMP;
        
    -- Update game statistics
    INSERT INTO game_statistics (user_id, game_type, total_plays, best_score, total_score, average_score, average_accuracy, total_time_played, last_played)
    SELECT 
        user_id,
        game_type,
        COUNT(*) as total_plays,
        MAX(score) as best_score,
        SUM(score) as total_score,
        AVG(score) as average_score,
        AVG(accuracy) as average_accuracy,
        SUM(COALESCE(time_taken, 0)) as total_time_played,
        MAX(completed_at) as last_played
    FROM game_sessions
    WHERE user_id = p_user_id AND completed_at IS NOT NULL
    GROUP BY user_id, game_type
    ON DUPLICATE KEY UPDATE
        total_plays = VALUES(total_plays),
        best_score = VALUES(best_score),
        total_score = VALUES(total_score),
        average_score = VALUES(average_score),
        average_accuracy = VALUES(average_accuracy),
        total_time_played = VALUES(total_time_played),
        last_played = VALUES(last_played);
END$$
DELIMITER ;

-- Procedure: Award Achievement
DELIMITER $$
CREATE PROCEDURE award_achievement(
    IN p_user_id INT,
    IN p_achievement_type VARCHAR(100),
    IN p_achievement_name VARCHAR(255),
    IN p_description TEXT,
    IN p_icon VARCHAR(50)
)
BEGIN
    -- Check if achievement already exists
    IF NOT EXISTS (
        SELECT 1 FROM achievements 
        WHERE user_id = p_user_id AND achievement_type = p_achievement_type
    ) THEN
        INSERT INTO achievements (user_id, achievement_type, achievement_name, description, icon)
        VALUES (p_user_id, p_achievement_type, p_achievement_name, p_description, p_icon);
    END IF;
END$$
DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: After inserting a game session, update student progress
DELIMITER $$
CREATE TRIGGER after_game_session_insert
AFTER INSERT ON game_sessions
FOR EACH ROW
BEGIN
    IF NEW.completed_at IS NOT NULL THEN
        CALL update_student_progress(NEW.user_id);
    END IF;
END$$
DELIMITER ;

-- Trigger: After updating a game session, update student progress
DELIMITER $$
CREATE TRIGGER after_game_session_update
AFTER UPDATE ON game_sessions
FOR EACH ROW
BEGIN
    IF NEW.completed_at IS NOT NULL THEN
        CALL update_student_progress(NEW.user_id);
    END IF;
END$$
DELIMITER ;

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert sample users
INSERT INTO users (full_name, email, password_hash) VALUES
('John Doe', 'john.doe@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('Jane Smith', 'jane.smith@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('Bob Johnson', 'bob.johnson@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
-- Password for all sample users is 'password'

-- ============================================
-- DATABASE INDICES FOR PERFORMANCE
-- ============================================

-- Additional composite indices for common queries
CREATE INDEX idx_session_user_date ON game_sessions(user_id, completed_at);
CREATE INDEX idx_session_game_score ON game_sessions(game_type, score DESC);
CREATE INDEX idx_progress_performance ON student_progress(performance_level, total_score DESC);

-- ============================================
-- END OF SCHEMA
-- ============================================

