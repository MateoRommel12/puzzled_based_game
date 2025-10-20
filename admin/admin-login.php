<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - Student Clustering System</title>
    <link rel="stylesheet" href="../styles/auth.css">
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <h1>Admin Portal</h1>
                <p>Student Clustering & Analytics System</p>
            </div>

            <form id="adminLoginForm" class="auth-form">
                <?php
                require_once '../config/security.php';
                echo SecurityManager::getCSRFTokenField();
                ?>
                <div class="form-group">
                    <label for="username">Admin Username</label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        required
                        placeholder="Enter admin username"
                    >
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        required
                        placeholder="Enter password"
                    >
                </div>

                <div id="errorMessage" class="error-message"></div>

                <button type="submit" class="auth-button">
                    <span>Login to Admin Panel</span>
                </button>
            </form>

            <div class="auth-footer">
                <a href="../login.php">Student Login</a>
            </div>
        </div>
    </div>

    <script src="../scripts/admin-auth.js"></script>
</body>
</html>
