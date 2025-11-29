<?php
require_once __DIR__ . '/email.php';

// Check if PHPMailer is available and include it
$phpmailer_available = file_exists(__DIR__ . '/../vendor/autoload.php');

if ($phpmailer_available) {
    require_once __DIR__ . '/../vendor/autoload.php';
}

/**
 * Email Manager Class
 * Handles all email sending functionality
 */
class EmailManager {
    private $mailer;
    private $config;
    
    public function __construct() {
        $this->config = EmailConfig::getSMTPConfig();
        
        // Check if PHPMailer is available
        $phpmailer_available = file_exists(__DIR__ . '/../vendor/autoload.php');
        
        if ($phpmailer_available && class_exists('PHPMailer\PHPMailer\PHPMailer')) {
            $this->mailer = new \PHPMailer\PHPMailer\PHPMailer(true);
            $this->setupMailer();
        } else {
            $this->mailer = null;
        }
    }
    
    /**
     * Setup PHPMailer configuration
     */
    private function setupMailer() {
        if (!$this->mailer) return;
        
        try {
            // Server settings
            $this->mailer->isSMTP();
            $this->mailer->Host = $this->config['host'];
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = $this->config['username'];
            $this->mailer->Password = $this->config['password'];
            $this->mailer->SMTPSecure = $this->config['encryption'];
            $this->mailer->Port = $this->config['port'];
            
            // Sender info
            $this->mailer->setFrom($this->config['from_email'], $this->config['from_name']);
            $this->mailer->addReplyTo($this->config['reply_to'], $this->config['from_name']);
            
            // Email format
            $this->mailer->isHTML(true);
            $this->mailer->CharSet = 'UTF-8';
            
        } catch (\Exception $e) {
            error_log("Email setup error: " . $e->getMessage());
        }
    }
    
    /**
     * Send password reset email
     */
    public function sendPasswordResetEmail($userEmail, $userName, $resetToken) {
        // If PHPMailer is not available or email is not configured, use development mode
        if (!$this->mailer || !EmailConfig::isConfigured()) {
            return $this->logEmailInDevelopment($userEmail, $userName, $resetToken);
        }
        
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($userEmail, $userName);
            
            $this->mailer->Subject = EmailConfig::RESET_SUBJECT;
            $this->mailer->Body = $this->getPasswordResetTemplate($userName, $resetToken);
            $this->mailer->AltBody = $this->getPasswordResetTextTemplate($userName, $resetToken);
            
            $result = $this->mailer->send();
            
            if ($result) {
                error_log("Password reset email sent to: $userEmail");
                return true;
            }
            
        } catch (\Exception $e) {
            error_log("Password reset email error: " . $e->getMessage());
        }
        
        return false;
    }
    
    /**
     * Get HTML template for password reset email
     */
    private function getPasswordResetTemplate($userName, $resetToken) {
        $resetUrl = rtrim(EmailConfig::APP_URL, '/') . '/reset-password.php?token=' . urlencode($resetToken);
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Password Reset</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .button:hover { background: #5a67d8; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🔐 Password Reset Request</h1>
                    <p>Student Learning Games</p>
                </div>
                <div class='content'>
                    <h2>Hello " . htmlspecialchars($userName) . "!</h2>
                    <p>We received a request to reset your password for your Student Learning Games account.</p>
                    <p>Click the button below to reset your password:</p>
                    <p style='text-align: center;'>
                        <a href='" . $resetUrl . "' class='button'>Reset My Password</a>
                    </p>
                    <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
                    <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                    <hr style='margin: 30px 0; border: none; border-top: 1px solid #ddd;'>
                    <p><strong>Having trouble with the button?</strong></p>
                    <p>Copy and paste this link into your browser:</p>
                    <p style='word-break: break-all; background: #eee; padding: 10px; border-radius: 5px; font-family: monospace;'>" . $resetUrl . "</p>
                </div>
                <div class='footer'>
                    <p>© " . date('Y') . " Student Learning Games. All rights reserved.</p>
                    <p>This email was sent from an automated system. Please do not reply.</p>
                </div>
            </div>
        </body>
        </html>";
    }
    
    /**
     * Get plain text template for password reset email
     */
    private function getPasswordResetTextTemplate($userName, $resetToken) {
        $resetUrl = rtrim(EmailConfig::APP_URL, '/') . '/reset-password.php?token=' . urlencode($resetToken);
        
        return "
Password Reset Request - Student Learning Games

Hello $userName!

We received a request to reset your password for your Student Learning Games account.

To reset your password, click on the link below:
$resetUrl

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

---
© " . date('Y') . " Student Learning Games. All rights reserved.
This email was sent from an automated system. Please do not reply.
        ";
    }
    
    /**
     * Log email in development mode (when email is not configured)
     */
    private function logEmailInDevelopment($userEmail, $userName, $resetToken) {
        $resetUrl = rtrim(EmailConfig::APP_URL, '/') . '/reset-password.php?token=' . urlencode($resetToken);
        
        $logMessage = "
=== PASSWORD RESET EMAIL (DEVELOPMENT MODE) ===
To: $userEmail
Name: $userName
Reset URL: $resetUrl
===============================================
        ";
        
        error_log($logMessage);
        
        // Also output to console if running in CLI
        if (php_sapi_name() === 'cli') {
            echo $logMessage . "\n";
        }
        
        return true; // Return true to simulate successful email send
    }
    
    /**
     * Test email configuration
     */
    public function testEmailConfiguration() {
        if (!$this->mailer) {
            return [
                'success' => false,
                'message' => 'PHPMailer not installed. Run "composer install" or use development mode.'
            ];
        }
        
        if (!EmailConfig::isConfigured()) {
            return [
                'success' => false,
                'message' => 'Email not configured. Please update config/email.php'
            ];
        }
        
        try {
            // Test SMTP connection
            $this->mailer->smtpConnect();
            $this->mailer->smtpClose();
            
            return [
                'success' => true,
                'message' => 'Email configuration is working!'
            ];
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Email configuration error: ' . $e->getMessage()
            ];
        }
    }
}
