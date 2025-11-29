#!/bin/bash
# PythonAnywhere Package Installation Script
# Run this in the PythonAnywhere Bash Console

echo "Installing required packages for clustering service..."

pip3.10 install --user mysql-connector-python
pip3.10 install --user numpy
pip3.10 install --user scikit-learn
pip3.10 install --user flask

echo "Installation complete!"
echo ""
echo "To verify installation, run:"
echo "python3.10 -c 'import mysql.connector; import numpy; import sklearn; import flask; print(\"All packages installed successfully!\")'"
