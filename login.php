<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Student Learning Games</title>
    <link rel="stylesheet" href="styles/auth.css">
    <link rel="stylesheet" href="styles/modal.css">
    <link rel="stylesheet" href="styles/loading.css">
    <link rel="stylesheet" href="styles/accessibility.css">
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <div class="logo">
                    <svg width="50" height="50" viewBox="0 0 40 40" fill="none">
                        <rect width="40" height="40" rx="8" fill="url(#gradient)"/>
                        <path d="M20 10L28 16V24L20 30L12 24V16L20 10Z" fill="white" opacity="0.9"/>
                        <defs>
                            <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40">
                                <stop offset="0%" stop-color="#3B82F6"/>
                                <stop offset="100%" stop-color="#8B5CF6"/>
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <h1>Welcome Back</h1>
                <p>Login to continue your learning journey</p>
            </div>

            <form id="loginForm" class="auth-form">
                <?php
                require_once 'config/security.php';
                echo SecurityManager::getCSRFTokenField();
                ?>
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        placeholder="Enter your email"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        placeholder="Enter your password"
                        required
                    >
                </div>

                <div class="form-options">
                    <label class="checkbox-label">
                        <input type="checkbox" id="rememberMe">
                        <span>Remember me</span>
                    </label>
                </div>

                <div id="errorMessage" class="error-message"></div>

                <button type="submit" class="auth-button">
                    <span>Login</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </button>
            </form>

            <div class="auth-footer">
                <p>
                    <a href="forgot-password.php" class="auth-link">Forgot your password?</a>
                </p>
                <p>Don't have an account? <a href="register.php">Register here</a></p>
            </div>
        </div>

        <div class="auth-background">
            <div class="floating-shape shape-1"></div>
            <div class="floating-shape shape-2"></div>
            <div class="floating-shape shape-3"></div>
        </div>
    </div>

    <script src="scripts/auth.js"></script>
    <script src="scripts/modal.js"></script>
    <script src="scripts/loading.js"></script>
</body>
</html>
