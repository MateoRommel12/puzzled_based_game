# Database Deployment Guide

This guide explains how to set up the Clustering Game Platform database on a new laptop or server.

## Files Overview

- `setup-complete.sql` - Complete database setup from scratch
- `update-custom-game-types.sql` - Migration for existing databases
- `fill-blanks-schema.sql` - Fill-in-the-blanks game tables
- `schema.sql` - Original schema (for reference)

## Setup Options

### Option 1: Fresh Installation (New Database)

If you're setting up the database for the first time:

```bash
# 1. Create the database
mysql -u root -p -e "CREATE DATABASE clustering_game_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Run the complete setup
mysql -u root -p clustering_game_db < database/setup-complete.sql
```

### Option 2: Update Existing Database

If you already have the database but need to add new features:

```bash
# Run the migration script
mysql -u root -p clustering_game_db < database/update-custom-game-types.sql
```

### Option 3: Add Fill-Blanks Support Only

If you only need to add fill-in-the-blanks functionality:

```bash
# Run the fill-blanks schema
mysql -u root -p clustering_game_db < database/fill-blanks-schema.sql
```

## Important Notes

### Default Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Note**: Change this password in production!

### Character Set and Collation
- Database uses `utf8mb4` character set with `utf8mb4_unicode_ci` collation
- This ensures proper support for international characters and emojis

### Custom Game Types Support
- The database now supports custom game types in the format `custom_X` (where X is the game ID)
- Game type fields have been changed from ENUM to VARCHAR(50) to support this

### Stored Procedures
- `update_student_progress` - Updates student statistics after game completion
- `award_achievement` - Awards achievements to students
- Both procedures are created with correct collation to avoid MySQL errors

## Troubleshooting

### Collation Errors
If you encounter "Illegal mix of collations" errors:
1. Run `update-custom-game-types.sql` to recreate procedures with correct collation
2. Ensure all tables use `utf8mb4_unicode_ci` collation

### Missing Tables
If tables are missing:
1. Check if you ran the correct SQL file
2. Verify the database exists: `SHOW DATABASES;`
3. Check table creation: `SHOW TABLES;`

### Permission Issues
If you get permission errors:
1. Ensure the MySQL user has CREATE, DROP, and ALTER privileges
2. Try running as root: `mysql -u root -p`

## Verification

After setup, verify everything is working:

```sql
-- Check tables exist
SHOW TABLES;

-- Check stored procedures exist
SHOW PROCEDURE STATUS WHERE Db = 'clustering_game_db';

-- Check triggers exist
SHOW TRIGGERS;

-- Check game_sessions table structure
DESCRIBE game_sessions;

-- Check custom games tables
DESCRIBE custom_games;
DESCRIBE fill_blanks_questions;
```

## Production Deployment

For production deployment:

1. **Change default passwords**:
   ```sql
   UPDATE admins SET password_hash = '$2y$10$NEW_HASH_HERE' WHERE username = 'admin';
   ```

2. **Create production admin account**:
   ```sql
   INSERT INTO admins (username, password_hash, full_name, email) 
   VALUES ('your_admin', 'your_hashed_password', 'Your Name', 'your@email.com');
   ```

3. **Remove sample data** (optional):
   ```sql
   DELETE FROM users WHERE email LIKE '%@example.com';
   ```

4. **Set up proper backups**:
   ```bash
   mysqldump -u root -p clustering_game_db > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

## Support

If you encounter issues:
1. Check the error logs in your web server
2. Verify database connection settings in `config/database.php`
3. Ensure all required PHP extensions are installed (PDO, MySQL)
4. Check file permissions on the project directory
