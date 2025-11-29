<?php
/**
 * Admin Account Verification
 * Check if admin account exists and create/reset if needed
 */

require_once __DIR__ . '/config/database.php';

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html><html><head><title>Admin Verification</title>";
echo "<style>
body { font-family: Arial; padding: 40px; background: #1a1a2e; color: #fff; }
.container { max-width: 700px; margin: 0 auto; background: rgba(255,255,255,0.05); padding: 30px; border-radius: 12px; }
.success { color: #10b981; padding: 10px; background: rgba(16,185,129,0.1); border-radius: 8px; margin: 10px 0; }
.error { color: #ef4444; padding: 10px; background: rgba(239,68,68,0.1); border-radius: 8px; margin: 10px 0; }
.info { color: #3b82f6; padding: 10px; background: rgba(59,130,246,0.1); border-radius: 8px; margin: 10px 0; }
code { background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #10b981; }
button { background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; margin: 10px 5px 0 0; font-size: 1rem; }
button:hover { background: #2563eb; }
h1 { color: #60a5fa; }
</style></head><body><div class='container'>";

echo "<h1>🔐 Admin Account Verification</h1>";

try {
    $db = getDBConnection();
    echo "<div class='success'>✓ Database connection successful</div>";
    
    // Check if admins table exists
    $stmt = $db->query("SHOW TABLES LIKE 'admins'");
    if ($stmt->rowCount() == 0) {
        echo "<div class='error'>❌ Admins table does not exist!</div>";
        echo "<p>Please run the database setup first:</p>";
        echo "<button onclick=\"window.location.href='database/setup.php'\">Run Database Setup</button>";
        exit;
    }
    
    echo "<div class='success'>✓ Admins table exists</div>";
    
    // Check for admin account
    $stmt = $db->query("SELECT admin_id, username, full_name, email, created_at FROM admins WHERE username = 'admin'");
    $admin = $stmt->fetch();
    
    if (!$admin) {
        echo "<div class='info'>⚠️ Admin account not found. Creating default admin account...</div>";
        
        // Create admin account
        $username = 'admin';
        $password = 'admin123';
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        
        $stmt = $db->prepare("INSERT INTO admins (username, password_hash, full_name, email) VALUES (?, ?, ?, ?)");
        $stmt->execute([$username, $passwordHash, 'System Administrator', 'admin@clusteringgame.local']);
        
        echo "<div class='success'>✓ Admin account created successfully!</div>";
        echo "<div class='info'><strong>Login Credentials:</strong><br>";
        echo "Username: <code>admin</code><br>";
        echo "Password: <code>admin123</code></div>";
    } else {
        echo "<div class='success'>✓ Admin account exists</div>";
        echo "<div class='info'>";
        echo "<strong>Admin ID:</strong> " . $admin['admin_id'] . "<br>";
        echo "<strong>Username:</strong> <code>" . htmlspecialchars($admin['username']) . "</code><br>";
        echo "<strong>Full Name:</strong> " . htmlspecialchars($admin['full_name'] ?: 'N/A') . "<br>";
        echo "<strong>Email:</strong> " . htmlspecialchars($admin['email'] ?: 'N/A') . "<br>";
        echo "<strong>Created:</strong> " . $admin['created_at'] . "<br>";
        echo "</div>";
    }
    
    // Test password verification
    echo "<h2>🔑 Password Verification</h2>";
    $stmt = $db->query("SELECT password_hash FROM admins WHERE username = 'admin'");
    $result = $stmt->fetch();
    
    if ($result) {
        $testPassword = 'admin123';
        $isValid = password_verify($testPassword, $result['password_hash']);
        
        if ($isValid) {
            echo "<div class='success'>✓ Password verification SUCCESSFUL!</div>";
            echo "<div class='info'>You can login with:<br>";
            echo "Username: <code>admin</code><br>";
            echo "Password: <code>admin123</code></div>";
        } else {
            echo "<div class='error'>❌ Password verification FAILED!</div>";
            echo "<p>Resetting password to default...</p>";
            
            $newHash = password_hash('admin123', PASSWORD_BCRYPT);
            $stmt = $db->prepare("UPDATE admins SET password_hash = ? WHERE username = 'admin'");
            $stmt->execute([$newHash]);
            
            echo "<div class='success'>✓ Password reset to: <code>admin123</code></div>";
        }
    }
    
    echo "<br><h2>📍 Next Steps</h2>";
    echo "<button onclick=\"window.location.href='admin/admin-login.php'\">Go to Admin Login</button>";
    echo "<button onclick=\"window.location.reload()\">Refresh Check</button>";
    echo "<button onclick=\"window.location.href='index.php'\">Student Dashboard</button>";
    
    // Show API endpoint check
    echo "<br><br><h2>🔌 API Endpoint Check</h2>";
    if (file_exists(__DIR__ . '/api/admin-auth.php')) {
        echo "<div class='success'>✓ api/admin-auth.php exists</div>";
    } else {
        echo "<div class='error'>❌ api/admin-auth.php NOT FOUND!</div>";
    }
    
    if (file_exists(__DIR__ . '/api/admin-dashboard.php')) {
        echo "<div class='success'>✓ api/admin-dashboard.php exists</div>";
    } else {
        echo "<div class='error'>❌ api/admin-dashboard.php NOT FOUND!</div>";
    }
    
} catch (Exception $e) {
    echo "<div class='error'><strong>Error:</strong> " . htmlspecialchars($e->getMessage()) . "</div>";
    echo "<p>Make sure your database configuration is correct.</p>";
}

echo "</div></body></html>";
?>

