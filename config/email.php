<?php
/**
 * Email Configuration
 * Configure your email settings here
 */

class EmailConfig {
    // Email Provider Settings
    const SMTP_HOST = 'smtp.gmail.com';           // Change to your SMTP host
    const SMTP_PORT = 587;                        // Usually 587 for TLS or 465 for SSL
    const SMTP_USERNAME = 'rvnmatter24@gmail.com'; // Your email address
    const SMTP_PASSWORD = 'tymwyrkojnqcbrhl';    // Your email password or app password (no spaces)
    const SMTP_ENCRYPTION = 'tls';                // 'tls' or 'ssl'
    
    // Email Settings
    const FROM_EMAIL = 'rvnmatter24@gmail.com';    // From email address
    const FROM_NAME = 'Student Learning Games';   // From name
    const REPLY_TO_EMAIL = 'rvnmatter24@gmail.com'; // Reply-to email
    
    // Application Settings
    const APP_NAME = 'Student Learning Games';
    const APP_URL = 'https://olivedrab-guanaco-225657.hostingersite.com/ClusteringGame'; // Change to your domain
    
    // Email Templates
    const RESET_SUBJECT = 'Password Reset Request';
    const RESET_TEMPLATE = 'password-reset';
    
    /**
     * Get SMTP configuration array
     */
    public static function getSMTPConfig() {
        return [
            'host' => self::SMTP_HOST,
            'port' => self::SMTP_PORT,
            'username' => self::SMTP_USERNAME,
            'password' => self::SMTP_PASSWORD,
            'encryption' => self::SMTP_ENCRYPTION,
            'from_email' => self::FROM_EMAIL,
            'from_name' => self::FROM_NAME,
            'reply_to' => self::REPLY_TO_EMAIL
        ];
    }
    
    /**
     * Check if email is configured
     */
    public static function isConfigured() {
        return !empty(self::SMTP_USERNAME) && 
               !empty(self::SMTP_PASSWORD) && 
               !empty(self::FROM_EMAIL) &&
               self::SMTP_USERNAME !== 'your-email@gmail.com' &&
               self::FROM_EMAIL !== 'your-email@gmail.com';
    }
    
    /**
     * Get email provider instructions
     */
    public static function getSetupInstructions() {
        return [
            'gmail' => [
                'name' => 'rvnmatter24@gmail.com',
                'smtp_host' => 'smtp.gmail.com',
                'smtp_port' => 587,
                'encryption' => 'tls',
                'instructions' => [
                    '1. Enable 2-factor authentication on your Gmail account',
                    '2. Generate an App Password: Google Account > Security > App passwords',
                    '3. Use your Gmail address and the App Password in the config'
                ]
            ],
            'outlook' => [
                'name' => 'Outlook/Hotmail',
                'smtp_host' => 'smtp-mail.outlook.com',
                'smtp_port' => 587,
                'encryption' => 'tls',
                'instructions' => [
                    '1. Use your Outlook email address',
                    '2. Use your regular Outlook password',
                    '3. Make sure SMTP authentication is enabled'
                ]
            ],
            'yahoo' => [
                'name' => 'Yahoo Mail',
                'smtp_host' => 'smtp.mail.yahoo.com',
                'smtp_port' => 587,
                'encryption' => 'tls',
                'instructions' => [
                    '1. Enable 2-factor authentication',
                    '2. Generate an App Password in Yahoo Mail settings',
                    '3. Use your Yahoo email and App Password'
                ]
            ]
        ];
    }
}
