#!/bin/bash

# Alerts System Installation Script
# This script sets up the database tables for the real-time alerts system

echo "🚀 Installing Real-Time Alerts System..."

# Check if MySQL is running
if ! pgrep -x "mysqld" > /dev/null; then
    echo "❌ MySQL is not running. Please start MySQL service first."
    exit 1
fi

# Database configuration
DB_NAME="student_performance"
DB_USER="root"
DB_HOST="localhost"

echo "📊 Setting up database tables..."

# Execute the alerts schema SQL file
mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < database/alerts_schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database tables created successfully!"
else
    echo "❌ Failed to create database tables."
    exit 1
fi

# Install additional NPM packages if needed
echo "📦 Installing additional dependencies..."

cd backend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully!"
else
    echo "❌ Failed to install backend dependencies."
    exit 1
fi

cd ../frontend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully!"
else
    echo "❌ Failed to install frontend dependencies."
    exit 1
fi

cd ..

echo "🎉 Real-Time Alerts System installation completed!"
echo ""
echo "📋 What was installed:"
echo "   ✓ Alerts database tables"
echo "   ✓ Lecturer alerts table"
echo "   ✓ Alert preferences table"
echo "   ✓ Alert thresholds with default values"
echo "   ✓ Backend alert services and controllers"
echo "   ✓ Frontend alert components"
echo "   ✓ Real-time notification system"
echo "   ✓ Email alert system"
echo "   ✓ Alert scheduler for automated processing"
echo ""
echo "🚀 Next steps:"
echo "   1. Start the backend server: cd backend && npm start"
echo "   2. Start the frontend server: cd frontend && npm run dev"
echo "   3. The alert scheduler will automatically start with the backend"
echo "   4. Alerts will be generated based on:"
echo "      - Predicted grades and marks"
echo "      - Quiz performance"
echo "      - Assignment performance"
echo "      - Midterm performance"
echo "      - Attendance levels"
echo ""
echo "⚙️  Configuration:"
echo "   - Alert scheduler runs every 60 minutes"
echo "   - Email notifications for critical/high severity alerts"
echo "   - Real-time browser notifications"
echo "   - Customizable alert preferences per user"
echo ""
echo "📖 Features:"
echo "   📧 Email notifications for critical alerts"
echo "   🔔 Real-time browser notifications"
echo "   📱 Mobile-responsive alert interfaces"
echo "   🎯 Intelligent alert categorization"
echo "   📊 Alert analytics and statistics"
echo "   ⚙️  Customizable preferences per user"
echo "   👨‍🏫 Lecturer alerts for at-risk students"
echo "   🤖 Automated alert processing"
echo "   💪 Motivational alerts for encouragement"
echo ""
