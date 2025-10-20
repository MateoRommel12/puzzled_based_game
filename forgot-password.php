<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password - Student Clustering System</title>
    <link rel="stylesheet" href="styles/auth.css">
    <link rel="stylesheet" href="styles/modal.css">
    <meta name="robots" content="noindex, nofollow">
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <h1>🔒 Forgot Password</h1>
                <p>Enter your email to reset your password</p>
            </div>

            <form id="forgotPasswordForm" class="auth-form">
                <?php require_once 'config/security.php'; echo SecurityManager::getCSRFTokenField(); ?>
                
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        required
                        placeholder="Enter your email address"
                        autocomplete="email"
                        aria-describedby="email-help"
                    >
                    <small id="email-help" class="form-help">We'll send you a password reset link</small>
                </div>

                <div id="errorMessage" class="error-message" role="alert" aria-live="polite"></div>
                <div id="successMessage" class="success-message" role="alert" aria-live="polite"></div>

                <button type="submit" class="auth-button" id="submitButton">
                    <span id="buttonText">Send Reset Link</span>
                    <span id="loadingSpinner" class="loading-spinner" style="display: none;">⏳</span>
                </button>
            </form>

            <div class="auth-footer">
                <p>
                    Remember your password? 
                    <a href="login.php" class="auth-link">Sign in here</a>
                </p>
                <p>
                    Don't have an account? 
                    <a href="register.php" class="auth-link">Create one here</a>
                </p>
            </div>
        </div>
    </div>

    <script src="scripts/modal.js"></script>
    <script src="scripts/auth.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('forgotPasswordForm');
            const submitButton = document.getElementById('submitButton');
            const buttonText = document.getElementById('buttonText');
            const loadingSpinner = document.getElementById('loadingSpinner');
            const errorMessage = document.getElementById('errorMessage');
            const successMessage = document.getElementById('successMessage');

            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Clear previous messages
                errorMessage.textContent = '';
                errorMessage.style.display = 'none';
                successMessage.textContent = '';
                successMessage.style.display = 'none';
                
                // Show loading state
                submitButton.disabled = true;
                buttonText.style.display = 'none';
                loadingSpinner.style.display = 'inline';
                
                const email = document.getElementById('email').value;
                
                try {
                    const response = await fetch('./api/auth.php?action=forgot-password', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email: email })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        successMessage.textContent = result.message;
                        successMessage.style.display = 'block';
                        form.reset();
                        
                        // Show success modal
                        await successModal(
                            'Password reset link sent! Please check your email and follow the instructions to reset your password.',
                            'Reset Link Sent'
                        );
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
