# PythonAnywhere Database Configuration Guide
# 
# STEP 1: Get the correct database credentials
# 
# Go to your Hostinger control panel and get these details:
# - MySQL Host: mysql.hostinger.com
# - Database Name: u982968743_clustering
# - Database User: u982968743_admin
# - Database Password: u982968743_U@
# - Port: 3306
#
# STEP 2: Check if Hostinger allows external connections
#
# This is CRITICAL! Hostinger may block external connections by default.
# You need to allow PythonAnywhere's IP in your Hostinger MySQL settings.
#
# STEP 3: Get PythonAnywhere's IP address
#
# Run this command in PythonAnywhere Bash Console:
# curl https://ipinfo.io/ip
#
# STEP 4: Add PythonAnywhere IP to Hostinger
#
# In your Hostinger MySQL settings, add the IP address to "Remote MySQL"
# or "Allow IP" settings.
#
# STEP 5: Test the connection
#
# In PythonAnywhere Bash Console, run:
# python3.10
# >>> import mysql.connector
# >>> conn = mysql.connector.connect(
# ...     host='mysql.hostinger.com',
# ...     database='u982968743_clustering',
# ...     user='u982968743_admin',
# ...     password='u982968743_U@',
# ...     port=3306
# ... )
# >>> print("Success!")
# >>> conn.close()
#
# If this works, your Flask app will work too!
