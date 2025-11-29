<?php
/**
 * Input Validation Middleware
 * Provides standardized validation for all API endpoints
 */

require_once __DIR__ . '/security.php';

class ValidationMiddleware {
    
    private static $validationRules = [
        // User authentication
        'login' => [
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:6']
        ],
        'register' => [
            'fullName' => ['required', 'string', 'min:3', 'max:50'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:6'],
            'confirmPassword' => ['required', 'string', 'min:6']
        ],
        
        // Game creation
        'create_game' => [
            'gameName' => ['required', 'string', 'min:3', 'max:100'],
            'gameType' => ['required', 'string', 'in:literacy,math,logic'],
            'gameCategory' => ['required', 'string', 'in:quiz,puzzle,word,fill_blanks,jumbled_sentences,math,other'],
            'difficulty' => ['required', 'string', 'in:easy,medium,hard'],
            'timeLimit' => ['nullable', 'string'],
            'description' => ['nullable', 'string', 'max:500'],
            'iconEmoji' => ['nullable', 'string', 'max:10']
        ],
        
        // Game questions
        'question' => [
            'question_text' => ['required', 'string', 'min:10', 'max:1000'],
            'correct_answer' => ['required', 'string', 'max:500'],
            'options' => ['array', 'min:2', 'max:6'],
            'points' => ['integer', 'min:1', 'max:100']
        ],
        
        // Fill blanks
        'fill_blanks' => [
            'question_text' => ['required', 'string', 'min:10', 'max:2000'],
            'word_bank' => ['required', 'string', 'min:5'],
            'correct_words' => ['required', 'string', 'min:1'],
            'hint' => ['string', 'max:200']
        ]
    ];
    
    public static function validate($data, $ruleSet) {
        $errors = [];
        
        if (!isset(self::$validationRules[$ruleSet])) {
            throw new Exception("Unknown validation rule set: {$ruleSet}");
        }
        
        $rules = self::$validationRules[$ruleSet];
        
        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;
            
            foreach ($fieldRules as $rule) {
                $error = self::applyRule($field, $value, $rule);
                if ($error) {
                    $errors[$field][] = $error;
                }
            }
        }
        
        return $errors;
    }
    
    private static function applyRule($field, $value, $rule) {
        // Parse rule (e.g., 'min:3' or 'in:option1,option2')
        $ruleParts = explode(':', $rule, 2);
        $ruleName = $ruleParts[0];
        $ruleValue = $ruleParts[1] ?? null;
        
        switch ($ruleName) {
            case 'required':
                if (empty($value)) {
                    return ucfirst($field) . ' is required';
                }
                break;
                
            case 'nullable':
                // Allow null or empty values - no validation needed
                break;
                
            case 'string':
                if (!is_string($value) && !is_null($value)) {
                    return ucfirst($field) . ' must be a string';
                }
                break;
                
            case 'integer':
            case 'int':
                if (!is_numeric($value) || (int)$value != $value) {
                    return ucfirst($field) . ' must be an integer';
                }
                break;
                
            case 'email':
                if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    return ucfirst($field) . ' must be a valid email address';
                }
                break;
                
            case 'alphanumeric':
                if (!is_string($value) || !preg_match('/^[a-zA-Z0-9]+$/', $value)) {
                    return ucfirst($field) . ' must contain only letters and numbers';
                }
                break;
                
            case 'min':
                if (is_string($value) && strlen($value) < (int)$ruleValue) {
                    return ucfirst($field) . ' must be at least ' . $ruleValue . ' characters';
                }
                if (is_numeric($value) && $value < (int)$ruleValue) {
                    return ucfirst($field) . ' must be at least ' . $ruleValue;
                }
                break;
                
            case 'max':
                if (is_string($value) && strlen($value) > (int)$ruleValue) {
                    return ucfirst($field) . ' must not exceed ' . $ruleValue . ' characters';
                }
                if (is_numeric($value) && $value > (int)$ruleValue) {
                    return ucfirst($field) . ' must not exceed ' . $ruleValue;
                }
                break;
                
            case 'in':
                $allowedValues = explode(',', $ruleValue);
                if (!in_array($value, $allowedValues)) {
                    return ucfirst($field) . ' must be one of: ' . implode(', ', $allowedValues);
                }
                break;
                
            case 'array':
                if (!is_array($value)) {
                    return ucfirst($field) . ' must be an array';
                }
                break;
        }
        
        return null;
    }
    
    public static function sanitizeInput($data) {
        $sanitized = [];
        
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $sanitized[$key] = SecurityManager::sanitizeInput($value);
            } elseif (is_array($value)) {
                $sanitized[$key] = self::sanitizeInput($value);
            } else {
                $sanitized[$key] = $value;
            }
        }
        
        return $sanitized;
    }
    
    public static function handleValidationError($errors) {
        $errorMessages = [];
        foreach ($errors as $field => $fieldErrors) {
            $errorMessages = array_merge($errorMessages, $fieldErrors);
        }
        
        SecurityManager::logSecurityEvent('Validation failed', [
            'errors' => $errors,
            'ip' => $_SERVER['REMOTE_ADDR'],
            'url' => $_SERVER['REQUEST_URI']
        ]);
        
        return [
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $errorMessages
        ];
    }
}

// Rate limiting middleware
class RateLimitMiddleware {
    
    public static function check($identifier, $action, $maxAttempts = 10, $windowSeconds = 300) {
        return SecurityManager::checkRateLimit($identifier, $action, $maxAttempts, $windowSeconds);
    }
    
    public static function checkLoginAttempts($username) {
        return self::check($username, 'login', 5, 900); // 5 attempts per 15 minutes
    }
    
    public static function checkGameCreation($userId) {
        return self::check($userId, 'game_creation', 10, 3600); // 10 games per hour
    }
    
    public static function checkAPICalls($identifier) {
        return self::check($identifier, 'api_calls', 100, 3600); // 100 calls per hour
    }
}

?>
