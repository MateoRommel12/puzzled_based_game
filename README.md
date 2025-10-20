# 🎮 Student Clustering Game Platform

A comprehensive educational gaming platform with machine learning-based student clustering for personalized learning analytics.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Games](#games)
- [Admin Dashboard](#admin-dashboard)
- [Clustering System](#clustering-system)
- [License](#license)

---

## 🎯 Overview

This platform is designed for educational institutions to:
- Engage students with interactive learning games
- Track student performance across literacy and math skills
- Use machine learning to cluster students based on performance
- Provide analytics for educators to personalize learning approaches

**Capstone Project:** Clustering Students Based on Puzzle-Based Games

---

## ✨ Features

### For Students
- 🎯 **4 Educational Games**
  - Word Scramble (Literacy)
  - Reading Comprehension (Literacy)
  - Number Puzzle (Math)
  - Math Challenge (Math)
- 📊 Real-time score tracking
- 🏆 Achievement system
- 📈 Progress monitoring
- 🎨 Beautiful, modern UI

### For Administrators
- 👥 Student management
- 📊 Performance analytics
- 🤖 ML-based student clustering
- 📈 Detailed reports
- 🎯 Identify students needing support

---

## 🛠 Technology Stack

### Frontend
- HTML5
- CSS3 (Modern, responsive design)
- Vanilla JavaScript (ES6+)

### Backend
- PHP 7.4+
- MySQL 5.7+ (with JSON support)
- RESTful API architecture

### Architecture
- **Monolithic Design** - All components in single codebase
- **MVC-inspired** - Separation of concerns
- **Database-centric** - MySQL as primary data store

---

## 📥 Installation

### Prerequisites
- XAMPP (Apache + MySQL + PHP)
- Modern web browser
- Text editor (VS Code recommended)

### Step 1: Install XAMPP
1. Download XAMPP from [https://www.apachefriends.org](https://www.apachefriends.org)
2. Install to `C:\xampp` (Windows) or `/Applications/XAMPP` (Mac)
3. Start Apache and MySQL services

### Step 2: Clone/Copy Project
```bash
# Navigate to XAMPP htdocs folder
cd C:\xampp\htdocs

# Create project folder (if not exists)
mkdir ClusteringGame

# Copy all project files to C:\xampp\htdocs\ClusteringGame
```

### Step 3: Configure Database
1. Open `config/database.php`
2. Update database credentials if needed (default XAMPP uses root with no password)

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'clustering_game_db');
define('DB_USER', 'root');
define('DB_PASS', ''); // Empty for default XAMPP
```

---

## 🗄 Database Setup

### Automatic Setup (Recommended)

1. **Open your browser**
2. **Navigate to:** `http://localhost/ClusteringGame/database/setup.php`
3. **Wait for the setup to complete** (creates database, tables, triggers, procedures)
4. **Delete or secure `setup.php`** after successful setup

### Manual Setup

```bash
# Access MySQL
mysql -u root -p

# Run schema
mysql -u root -p < database/schema.sql
```

### Verify Setup
```bash
mysql -u root -p

USE clustering_game_db;
SHOW TABLES;
```

You should see:
- users
- admins
- student_progress
- game_sessions
- game_statistics
- achievements
- clustering_results

---

## 📁 Project Structure

```
ClusteringGame/
│
├── api/                        # Backend API endpoints
│   ├── auth.php               # User authentication
│   ├── admin-auth.php         # Admin authentication
│   ├── game-session.php       # Game session management
│   └── admin-dashboard.php    # Admin data endpoints
│
├── config/                     # Configuration files
│   └── database.php           # Database connection & config
│
├── database/                   # Database files
│   ├── schema.sql             # Complete database schema
│   ├── setup.php              # Automated setup script
│   └── README.md              # Database documentation
│
├── scripts/                    # JavaScript files
│   ├── auth.js                # User authentication logic
│   ├── admin-auth.js          # Admin authentication
│   ├── main.js                # Main application logic
│   ├── word-scramble.js       # Word scramble game
│   ├── reading-comprehension.js
│   ├── number-puzzle.js
│   ├── math-challenge.js
│   ├── results.js             # Results page logic
│   ├── admin-dashboard.js     # Admin dashboard logic
│   └── clustering.js          # Clustering visualization
│
├── styles/                     # CSS files
│   ├── main.css               # Main styles
│   ├── auth.css               # Authentication pages
│   ├── admin.css              # Admin dashboard
│   ├── word-scramble.css
│   ├── reading-comprehension.css
│   ├── number-puzzle.css
│   ├── math-challenge.css
│   └── results.css
│
├── index.php                   # Main dashboard
├── login.php                   # User login page
├── register.php                # User registration
├── admin-login.php             # Admin login
├── admin-dashboard.php         # Admin dashboard
├── word-scramble.php           # Word scramble game
├── reading-comprehension.php   # Reading game
├── number-puzzle.php           # Number puzzle game
├── math-challenge.php          # Math challenge game
├── results.php                 # Student results page
├── package.json                # Project metadata
└── README.md                   # This file
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth.php?action=register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### Login User
```http
POST /api/auth.php?action=login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Check Session
```http
GET /api/auth.php?action=check-session
```

### Game Session Endpoints

#### Save Game Session
```http
POST /api/game-session.php?action=save
Content-Type: application/json

{
  "gameType": "word_scramble",
  "score": 85,
  "difficulty": "medium",
  "timeTaken": 120,
  "questionsAnswered": 10,
  "correctAnswers": 8,
  "accuracy": 80,
  "streakCount": 3,
  "hintsUsed": 2
}
```

#### Get User Statistics
```http
GET /api/game-session.php?action=get-stats
```

### Admin Endpoints

#### Get Overview
```http
GET /api/admin-dashboard.php?action=overview
```

#### Get Students List
```http
GET /api/admin-dashboard.php?action=students&search=john&filter=high
```

#### Get Clustering Data
```http
GET /api/admin-dashboard.php?action=clustering
```

---

## 🎮 Games

### 1. Word Scramble
**Category:** Literacy  
**Objective:** Unscramble letters to form words  
**Skills:** Vocabulary, spelling, pattern recognition

### 2. Reading Comprehension
**Category:** Literacy  
**Objective:** Read passages and answer questions  
**Skills:** Reading, comprehension, critical thinking

### 3. Number Puzzle
**Category:** Math  
**Objective:** Find patterns in number sequences  
**Skills:** Pattern recognition, logical thinking, sequences

### 4. Math Challenge
**Category:** Math  
**Objective:** Solve math problems quickly  
**Skills:** Basic arithmetic, speed, accuracy

---

## 👨‍💼 Admin Dashboard

### Access
- URL: `http://localhost/ClusteringGame/admin-login.php`
- Default Username: `admin`
- Default Password: `admin123`

### Features
1. **Overview Tab**
   - Total students
   - Total games played
   - Average scores
   - Active users today

2. **Students Tab**
   - View all students
   - Search and filter
   - Performance levels
   - Detailed student profiles

3. **Clustering Tab**
   - ML-based student grouping
   - Cluster visualization
   - Performance metrics
   - Recommendations

---

## 🤖 Clustering System

### Overview
The platform uses machine learning to automatically cluster students into performance groups.

### Clustering Features
- **Literacy Score** - Performance in word scramble and reading comprehension
- **Math Score** - Performance in number puzzle and math challenge
- **Accuracy** - Average accuracy across all games
- **Engagement** - Number of games played
- **Time Efficiency** - Average time per game

### Cluster Labels
1. **High Achievers** - Students performing above 80%
2. **Average Performers** - Students performing 50-80%
3. **Needs Support** - Students performing below 50%

### Implementation Notes
The clustering algorithm should be implemented using:
- Python with scikit-learn (K-Means)
- Run periodically (weekly recommended)
- Store results in `clustering_results` table

---

## 🚀 Getting Started

1. **Install XAMPP** and start Apache + MySQL
2. **Copy project** to `C:\xampp\htdocs\ClusteringGame`
3. **Run database setup** at `http://localhost/ClusteringGame/database/setup.php`
4. **Open application** at `http://localhost/ClusteringGame/`
5. **Login** with sample credentials or register new account
6. **Play games** and track progress
7. **Access admin dashboard** at `http://localhost/ClusteringGame/admin-login.php`

---

## 🔒 Security Notes

### Development
- Database user: `root` with no password (XAMPP default)
- Session security enabled
- Password hashing with bcrypt
- Prepared statements for SQL

### Production Recommendations
1. Change all default passwords
2. Use strong database credentials
3. Enable HTTPS
4. Restrict CORS origins
5. Enable PHP error logging (disable display)
6. Regular database backups
7. Implement rate limiting
8. Add CSRF tokens

---

## 🧪 Testing

### Test Accounts

**Student Account:**
- Email: `john.doe@example.com`
- Password: `password`

**Admin Account:**
- Username: `admin`
- Password: `admin123`

### Manual Testing Steps
1. Register new user
2. Play each game
3. Check results page
4. Login as admin
5. Verify student data appears
6. Test filtering and search

---

## 📝 License

This is a capstone project for educational purposes.

---

## 👥 Contributors

Capstone Project: Clustering Students Based on Puzzle-Based Games

---

## 📞 Support

For issues or questions:
1. Check `database/README.md` for database documentation
2. Review API error messages in browser console
3. Check Apache error logs: `xampp/apache/logs/error.log`
4. Check MySQL error logs: `xampp/mysql/data/mysql_error.log`

---

## 🎓 Educational Context

This platform demonstrates:
- Full-stack web development
- Database design and optimization
- RESTful API architecture
- Machine learning integration
- Educational technology principles
- User experience design
- Data analytics and visualization

---

**Happy Learning! 🎓**

