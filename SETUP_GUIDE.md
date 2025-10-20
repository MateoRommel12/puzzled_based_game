# 🚀 Quick Setup Guide
## Clustering Game Platform

Follow these steps to get your application running in under 10 minutes!

---

## Prerequisites ✅

- [ ] XAMPP installed (Apache + MySQL + PHP)
- [ ] Modern web browser (Chrome, Firefox, Edge)
- [ ] Text editor (optional, for configuration)

---

## Step-by-Step Setup

### 1. Install XAMPP (5 minutes)

**Download:**
- Windows: https://www.apachefriends.org/download.html
- Mac: https://www.apachefriends.org/download.html
- Linux: https://www.apachefriends.org/download.html

**Install to:**
- Windows: `C:\xampp`
- Mac: `/Applications/XAMPP`
- Linux: `/opt/lampp`

**Start Services:**
1. Open XAMPP Control Panel
2. Click **Start** next to Apache
3. Click **Start** next to MySQL
4. Both should show green "Running" status

---

### 2. Copy Project Files (1 minute)

**Windows:**
```
Copy all project files to: C:\xampp\htdocs\ClusteringGame
```

**Mac/Linux:**
```
Copy all project files to: /Applications/XAMPP/htdocs/ClusteringGame
```

**Your folder structure should look like:**
```
C:\xampp\htdocs\ClusteringGame\
├── api/
├── config/
├── database/
├── scripts/
├── styles/
├── index.php
├── login.php
└── ... (other files)
```

---

### 3. Setup Database (2 minutes)

**Option A: Automatic Setup (Recommended)**

1. Open your web browser
2. Navigate to: `http://localhost/ClusteringGame/database/setup.php`
3. Wait for the setup to complete (you'll see green checkmarks)
4. You should see: "🎉 Database Setup Complete!"

**Option B: Manual Setup**

1. Open browser: `http://localhost/phpmyadmin`
2. Click "SQL" tab
3. Copy contents of `database/schema.sql`
4. Paste and click "Go"

---

### 4. Verify Installation (1 minute)

**Test Database Connection:**
1. Navigate to: `http://localhost/ClusteringGame/test-connection.php`
2. You should see: "✅ Database Connection Successful!"

**Access Application:**
1. Navigate to: `http://localhost/ClusteringGame/`
2. You should see the login page

---

### 5. Test Login (1 minute)

**Student Login:**
```
Email: john.doe@example.com
Password: password
```

**Admin Login:**
```
URL: http://localhost/ClusteringGame/admin-login.php
Username: admin
Password: admin123
```

---

## Post-Setup Tasks

### Security (Important for Production!)

1. **Change Default Passwords**
   - Admin password: `admin123` → Your secure password
   - Sample user passwords

2. **Secure setup.php**
   - Delete `database/setup.php` OR
   - Uncomment security rules in `.htaccess`

3. **Update Database Credentials** (if needed)
   - Edit `config/database.php`
   - Change DB_USER and DB_PASS if you set a MySQL password

### Optional: Python Clustering Setup

If you want to use the ML clustering feature:

```bash
# Install Python 3.7+
# Then install dependencies:
cd C:\xampp\htdocs\ClusteringGame\clustering
pip install -r requirements.txt

# Run clustering
python cluster_students.py
```

---

## Troubleshooting

### ❌ Apache won't start
**Solution:** Port 80 might be in use
1. Open XAMPP Control Panel
2. Click "Config" next to Apache
3. Click "httpd.conf"
4. Change `Listen 80` to `Listen 8080`
5. Save and restart Apache
6. Access site at: `http://localhost:8080/ClusteringGame/`

### ❌ MySQL won't start
**Solution:** Port 3306 might be in use
1. Open XAMPP Control Panel
2. Click "Config" next to MySQL
3. Click "my.ini"
4. Change `port=3306` to `port=3307`
5. Save and restart MySQL
6. Update `config/database.php` with new port

### ❌ Can't connect to database
**Solution:** Check credentials
1. Open `config/database.php`
2. Verify:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'clustering_game_db');
   define('DB_USER', 'root');
   define('DB_PASS', ''); // Empty for default XAMPP
   ```

### ❌ Blank white page
**Solution:** PHP errors not displaying
1. Open `config/database.php`
2. Temporarily add at top:
   ```php
   error_reporting(E_ALL);
   ini_set('display_errors', 1);
   ```
3. Reload page to see errors

### ❌ Page not found (404)
**Solution:** Check URL
- Correct: `http://localhost/ClusteringGame/`
- Wrong: `http://localhost/` or `http://localhost/clusteringgame/`

---

## Quick Reference

### URLs
- **Main App:** `http://localhost/ClusteringGame/`
- **Student Login:** `http://localhost/ClusteringGame/login.php`
- **Student Register:** `http://localhost/ClusteringGame/register.php`
- **Admin Login:** `http://localhost/ClusteringGame/admin-login.php`
- **Database Setup:** `http://localhost/ClusteringGame/database/setup.php`
- **phpMyAdmin:** `http://localhost/phpmyadmin`

### Default Credentials
| Type | Username/Email | Password |
|------|---------------|----------|
| Admin | admin | admin123 |
| Student | john.doe@example.com | password |
| MySQL | root | (empty) |

### File Locations (Windows)
- **Project:** `C:\xampp\htdocs\ClusteringGame\`
- **Apache Logs:** `C:\xampp\apache\logs\error.log`
- **MySQL Logs:** `C:\xampp\mysql\data\mysql_error.log`
- **PHP Config:** `C:\xampp\php\php.ini`

---

## Next Steps

1. ✅ Create your own student account
2. ✅ Play some games to generate data
3. ✅ Login as admin to view dashboard
4. ✅ Run clustering analysis (Python script)
5. ✅ Explore all features

---

## Need Help?

### Check Documentation
- Main README: `README.md`
- Database Docs: `database/README.md`
- Clustering Docs: `clustering/README.md`

### Common Files to Check
- Database config: `config/database.php`
- Database schema: `database/schema.sql`
- Apache config: `.htaccess`

### Log Files
```bash
# Windows
C:\xampp\apache\logs\error.log
C:\xampp\mysql\data\mysql_error.log

# Mac
/Applications/XAMPP/logs/error_log
/Applications/XAMPP/var/mysql/*.err
```

---

## Success Checklist

- [ ] XAMPP installed and running
- [ ] Project files in htdocs folder
- [ ] Database created successfully
- [ ] Can access main page
- [ ] Can login as student
- [ ] Can login as admin
- [ ] Games are working
- [ ] Admin dashboard shows data

---

**If all checks pass, you're ready to use the platform! 🎉**

---

## Video Tutorial (Optional)

For a video walkthrough of this setup process:
1. Open XAMPP Control Panel
2. Start Apache and MySQL
3. Navigate to the setup URL
4. Follow on-screen instructions

---

**Questions? Issues?**
- Review the troubleshooting section
- Check log files for errors
- Ensure all prerequisites are met

**Happy Learning! 🎓**

