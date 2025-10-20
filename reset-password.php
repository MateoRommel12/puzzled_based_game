<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - Student Clustering System</title>
    <link rel="stylesheet" href="styles/auth.css">
    <link rel="stylesheet" href="styles/modal.css">
    <meta name="robots" content="noindex, nofollow">
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <h1>🔑 Reset Password</h1>
                <p>Enter your new password below</p>
            </div>

            <form id="resetPasswordForm" class="auth-form">
                <?php require_once 'config/security.php'; echo SecurityManager::getCSRFTokenField(); ?>
                
                <input type="hidden" id="token" name="token" value="<?php echo htmlspecialchars($_GET['token'] ?? ''); ?>">
                
                <div class="form-group">
                    <label for="password">New Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        required
                        minlength="6"
                        placeholder="Enter your new password"
                        autocomplete="new-password"
                        aria-describedby="password-help"
                    >
                    <small id="password-help" class="form-help">Minimum 6 characters</small>
                </div>

                <div class="form-group">
                    <label for="confirmPassword">Confirm New Password</label>
                    <input 
                        type="password" 
                        id="confirmPassword" 
                        name="confirmPassword" 
                        required
                        minlength="6"
                        placeholder="Confirm your new password"
                        autocomplete="new-password"
                        aria-describedby="confirm-help"
                    >
                    <small id="confirm-help" class="form-help">Must match the password above</small>
                </div>

                <div id="errorMessage" class="error-message" role="alert" aria-live="polite"></div>
                <div id="successMessage" class="success-message" role="alert" aria-live="polite"></div>

                <button type="submit" class="auth-button" id="submitButton">
                    <span id="buttonText">Reset Password</span>
                    <span id="loadingSpinner" class="loading-spinner" style="display: none;">⏳</span>
                </button>
            </form>

            <div class="auth-footer">
                <p>
                    Remember your password? 
                    <a href="login.php" class="auth-link">Sign in here</a>
                </p>
            </div>
        </div>
    </div>

    <script src="scripts/modal.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('resetPasswordForm');
            const submitButton = document.getElementById('submitButton');
            const buttonText = document.getElementById('buttonText');
            const loadingSpinner = document.getElementById('loadingSpinner');
            const errorMessage = document.getElementById('errorMessage');
            const successMessage = document.getElementById('successMessage');
            const passwordInput = document.getElementById('password');
            const confirmPasswordInput = document.getElementById('confirmPassword');
            const token = document.getElementById('token').value;

            // Validate token
            if (!token) {
                errorMessage.textContent = 'Invalid or missing reset token. Please request a new password reset.';
                errorMessage.style.display = 'block';
                form.style.display = 'none';
                return;
            }

            // Password confirmation validation
            function validatePasswords() {
                const password = passwordInput.value;
                const confirmPassword = confirmPasswordInput.value;
                
                if (password && confirmPassword && password !== confirmPassword) {
                    confirmPasswordInput.setCustomValidity('Passwords do not match');
                    return false;
                } else {
                    confirmPasswordInput.setCustomValidity('');
                    return true;
                }
            }

            passwordInput.addEventListener('input', validatePasswords);
            confirmPasswordInput.addEventListener('input', validatePasswords);

            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                if (!validatePasswords()) {
                    errorMessage.textContent = 'Passwords do not match. Please check and try again.';
                    errorMessage.style.display = 'block';
                    return;
                }
                
                // Clear previous messages
                errorMessage.textContent = '';
                errorMessage.style.display = 'none';
                successMessage.textContent = '';
                successMessage.style.display = 'none';
                
                // Show loading state
                submitButton.disabled = true;
                buttonText.style.display = 'none';
                loadingSpinner.style.display = 'inline';
                
                const password = passwordInput.value;
                const confirmPassword = confirmPasswordInput.value;
                
                try {
                    const response = await fetch('api/auth.php?action=reset-password', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ 
                            token: token,
                            password: password,
                            confirmPassword: confirmPassword
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        successMessage.textContent = result.message;
                        successMessage.style.display = 'block';
                        
                        // Show success modal and redirect
                        await successModal(
                            'Password reset successfully! You can now log in with your new password.',
                            'Password Reset Complete'
                        );
                        
                        // Redirect to login after 2 seconds
                        setTimeout(() => {
                            window.location.href = 'login.php';
                        }, 2000);
                    } else {
                        errorMessage.textContent = result.message;
                        errorMessage.style.display = 'block';
                    }
                } catch (error) {
                    errorMessage.textContent = 'Network error. Please try again.';
                    errorMessage.style.display = 'block';
                } finally {
                    // Reset button state
                    submitButton.disabled = false;
                    buttonText.style.display = 'inline';
                    loadingSpinner.style.display = 'none';
                }
            });
        });
    </script>
</body>
</html>
