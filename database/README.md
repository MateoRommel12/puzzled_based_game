# Database Documentation
## Clustering Game Platform - Monolithic Architecture

### Overview
This database schema is designed to support a student learning platform with games, analytics, and ML-based student clustering.

---

## Database Structure

### Core Tables

#### 1. **users**
Stores student account information
- `user_id` (PK) - Unique identifier
- `full_name` - Student's full name
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `created_at` - Account creation timestamp
- `last_login` - Last login timestamp
- `is_active` - Account status

#### 2. **admins**
Stores administrator accounts
- `admin_id` (PK) - Unique identifier
- `username` - Unique admin username
- `password_hash` - Bcrypt hashed password
- `full_name` - Admin's full name
- `email` - Admin email
- `created_at` - Account creation timestamp
- `last_login` - Last login timestamp
- `is_active` - Account status

#### 3. **student_progress**
Tracks overall student progress and statistics
- `progress_id` (PK) - Unique identifier
- `user_id` (FK) - References users table
- `total_score` - Cumulative score across all games
- `games_played` - Total number of completed games
- `literacy_progress` - Literacy skill percentage (0-100)
- `math_progress` - Math skill percentage (0-100)
- `performance_level` - Classification: low, medium, high
- `updated_at` - Last update timestamp

#### 4. **game_sessions**
Records individual game play sessions
- `session_id` (PK) - Unique identifier
- `user_id` (FK) - References users table
- `game_type` - Type of game played (word_scramble, reading_comprehension, number_puzzle, math_challenge)
- `score` - Points earned in the session
- `difficulty_level` - easy, medium, hard
- `time_taken` - Duration in seconds
- `questions_answered` - Total questions attempted
- `correct_answers` - Number of correct answers
- `accuracy` - Percentage accuracy (0-100)
- `streak_count` - Consecutive correct answers
- `hints_used` - Number of hints requested
- `session_data` - JSON field for additional game-specific data
- `started_at` - Session start timestamp
- `completed_at` - Session completion timestamp

#### 5. **game_statistics**
Aggregate statistics per game type for each user
- `stat_id` (PK) - Unique identifier
- `user_id` (FK) - References users table
- `game_type` - Type of game
- `total_plays` - Number of times played
- `best_score` - Highest score achieved
- `total_score` - Cumulative score for this game
- `average_score` - Average score per play
- `average_accuracy` - Average accuracy percentage
- `total_time_played` - Total seconds spent playing
- `last_played` - Most recent play timestamp

#### 6. **achievements**
Tracks student achievements and badges
- `achievement_id` (PK) - Unique identifier
- `user_id` (FK) - References users table
- `achievement_type` - Category of achievement
- `achievement_name` - Name of the achievement
- `description` - Description of how it was earned
- `icon` - Emoji or icon identifier
- `earned_at` - Timestamp when earned

#### 7. **clustering_results**
Stores ML clustering analysis results
- `cluster_id` (PK) - Unique identifier
- `user_id` (FK) - References users table
- `cluster_number` - Cluster assignment (0, 1, 2, etc.)
- `cluster_label` - Human-readable label (e.g., "High Achiever")
- `literacy_score` - Literacy performance score
- `math_score` - Math performance score
- `overall_performance` - Combined performance metric
- `features` - JSON field storing feature vector
- `analysis_date` - When clustering was performed
- `is_current` - Whether this is the latest clustering

---

## Views

### v_student_performance
Combines user and progress data for easy access to student performance metrics.

### v_game_activity
Aggregates game activity statistics across all users.

### v_current_clustering
Summarizes current clustering distribution.

### v_recent_activity
Shows student activity in the last 30 days.

---

## Stored Procedures

### update_student_progress(user_id)
Automatically calculates and updates:
- Total score
- Games played count
- Literacy progress (from word scramble & reading comprehension)
- Math progress (from number puzzle & math challenge)
- Performance level classification
- Game statistics per game type

**Called automatically by triggers after game sessions are completed.**

### award_achievement(user_id, achievement_type, achievement_name, description, icon)
Awards an achievement to a student (prevents duplicates).

---

## Triggers

### after_game_session_insert
Automatically calls `update_student_progress()` when a new game session is completed.

### after_game_session_update
Automatically calls `update_student_progress()` when a game session is updated.

---

## Setup Instructions

### 1. Create Database
```bash
# Access XAMPP MySQL
mysql -u root -p
```

### 2. Run Setup Script
Navigate to: `http://localhost/ClusteringGame/database/setup.php`

This will:
- Create the database
- Create all tables
- Insert default admin account
- Insert sample users
- Create views, procedures, and triggers

### 3. Default Credentials

**Admin Login:**
- Username: `admin`
- Password: `admin123`

**Sample User:**
- Email: `john.doe@example.com`
- Password: `password`

**⚠️ Important:** Change these credentials in production!

---

## API Endpoints

### Authentication (`api/auth.php`)
- `POST /api/auth.php?action=register` - Register new user
- `POST /api/auth.php?action=login` - User login
- `POST /api/auth.php?action=logout` - User logout
- `GET /api/auth.php?action=check-session` - Check session validity

### Admin Authentication (`api/admin-auth.php`)
- `POST /api/admin-auth.php?action=login` - Admin login
- `POST /api/admin-auth.php?action=logout` - Admin logout
- `GET /api/admin-auth.php?action=check-session` - Check admin session

### Game Sessions (`api/game-session.php`)
- `POST /api/game-session.php?action=save` - Save game session
- `GET /api/game-session.php?action=get-stats` - Get user statistics

### Admin Dashboard (`api/admin-dashboard.php`)
- `GET /api/admin-dashboard.php?action=overview` - Get dashboard overview
- `GET /api/admin-dashboard.php?action=students` - Get all students
- `GET /api/admin-dashboard.php?action=clustering` - Get clustering data
- `GET /api/admin-dashboard.php?action=student-details&userId=X` - Get student details

---

## Database Performance

### Indices
The schema includes optimized indices on:
- Email lookups (users, admins)
- User-game relationships
- Date-based queries
- Score-based queries
- Performance level filtering

### Expected Performance
- User authentication: < 50ms
- Game session save: < 100ms
- Dashboard queries: < 200ms
- Clustering analysis: < 500ms (depends on data size)

---

## Clustering Implementation

### Feature Extraction
The clustering algorithm should use these features:
1. Literacy progress score
2. Math progress score
3. Overall accuracy
4. Games played
5. Average session duration
6. Hint usage frequency

### Recommended Algorithm
**K-Means Clustering** with k=3 (High, Medium, Low performers)

### Implementation Steps
1. Extract features from `student_progress` and `game_sessions`
2. Normalize features (0-1 scale)
3. Apply K-Means clustering
4. Label clusters based on centroids
5. Store results in `clustering_results` table
6. Set `is_current = FALSE` for old results
7. Set `is_current = TRUE` for new results

---

## Maintenance

### Regular Tasks
1. **Backup Database** - Weekly
2. **Archive Old Sessions** - Monthly (sessions older than 1 year)
3. **Update Clustering** - Weekly or when significant data changes
4. **Monitor Performance** - Check slow query log

### Backup Command
```bash
mysqldump -u root -p clustering_game_db > backup_$(date +%Y%m%d).sql
```

### Restore Command
```bash
mysql -u root -p clustering_game_db < backup_20250112.sql
```

---

## Troubleshooting

### Issue: Cannot connect to database
**Solution:** Check XAMPP MySQL is running, verify credentials in `config/database.php`

### Issue: Triggers not working
**Solution:** Ensure you have TRIGGER privileges: `GRANT TRIGGER ON clustering_game_db.* TO 'root'@'localhost';`

### Issue: Stored procedures failing
**Solution:** Check delimiter settings, re-run schema.sql

### Issue: JSON fields not working
**Solution:** MySQL 5.7+ required for JSON support

---

## Security Considerations

1. **Password Hashing:** All passwords use bcrypt (PASSWORD_BCRYPT)
2. **SQL Injection:** All queries use prepared statements
3. **Session Security:** HTTP-only cookies, strict mode enabled
4. **Input Validation:** All API endpoints validate input
5. **CORS:** Restrict in production (currently set to *)

---

## Future Enhancements

1. **Add password reset functionality**
2. **Implement email verification**
3. **Add parent/teacher accounts**
4. **Create detailed analytics dashboards**
5. **Add real-time leaderboards**
6. **Implement adaptive difficulty**
7. **Add social features (friends, challenges)**

---

## Support

For issues or questions:
- Check the troubleshooting section
- Review API error messages
- Check MySQL error logs: `xampp/mysql/data/mysql_error.log`
- Check PHP error logs: `xampp/apache/logs/error.log`

