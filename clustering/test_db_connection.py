# test_db_connection.py
# Upload this to PythonAnywhere and run it to test database connection

import mysql.connector
from mysql.connector import Error

# Your Hostinger MySQL credentials
DB_CONFIG = {
    'host': 'mysql.hostinger.com',
    'database': 'u982968743_clustering',
    'user': 'u982968743_admin',
    'password': 'u982968743_U@',
    'port': 3306
}

def test_connection():
    try:
        print("Attempting to connect to Hostinger MySQL...")
        connection = mysql.connector.connect(**DB_CONFIG)
        
        if connection.is_connected():
            db_info = connection.get_server_info()
            print(f"✅ Connected to MySQL Server version {db_info}")
            
            cursor = connection.cursor()
            cursor.execute("SELECT DATABASE();")
            database = cursor.fetchone()
            print(f"✅ Connected to database: {database}")
            
            cursor.execute("SELECT COUNT(*) FROM users WHERE is_active = 1")
            user_count = cursor.fetchone()[0]
            print(f"✅ Active users: {user_count}")
            
            cursor.close()
            connection.close()
            print("✅ Connection test successful!")
            
            return True
        else:
            print("❌ Failed to connect to database")
            return False
            
    except Error as e:
        print(f"❌ Error connecting to MySQL: {e}")
        print("\nPossible solutions:")
        print("1. Check if Hostinger allows external connections")
        print("2. Add PythonAnywhere IP to Hostinger MySQL whitelist")
        print("3. Verify database credentials")
        return False

if __name__ == "__main__":
    test_connection()
