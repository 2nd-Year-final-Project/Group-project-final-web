# Real-Time Alert System Documentation

## Overview

The new real-time alert system has been completely rebuilt to provide **only real-time alerts** based on actual AI grade predictions. This system eliminates all dummy data and focuses on delivering accurate, timely performance notifications.

## Key Features

### ✅ **Real-Time Only**
- Alerts are generated **only** when actual predictions are made
- No dummy or fake data - all alerts are based on real prediction results
- Previous alerts are cleared when new predictions are available

### ✅ **One Alert Per Course**
- Students see only **one active alert per course** - the most recent prediction
- No accumulation of historical alerts
- Clean, focused dashboard experience

### ✅ **Lecturer Risk Detection**
- Lecturers only see alerts for **at-risk students** (predicted grade below 50%)
- Focus on students who need immediate intervention
- No noise from well-performing students

### ✅ **Clean Database**
- Database starts clean with no dummy data
- Alerts are generated dynamically based on predictions
- Automatic cleanup of old alerts when new ones are created

## How It Works

### For Students
1. **Grade Prediction**: When a student requests a grade prediction
2. **Alert Generation**: System automatically generates a real-time alert based on the prediction
3. **Alert Display**: Student sees the alert in their dashboard (one per course)
4. **Alert Management**: Students can dismiss alerts they've addressed

### For Lecturers
1. **Risk Detection**: When student predictions indicate at-risk performance (< 50%)
2. **Lecturer Notification**: System creates an alert for the course lecturer
3. **Dashboard Display**: Lecturer sees at-risk students in their dashboard
4. **Intervention Tools**: Direct contact options and intervention recommendations

## Alert Types

### Student Alerts
- **🌟 Excellent (85%+)**: Encouragement and peer mentoring suggestions
- **💪 Strong (70-84%)**: Positive reinforcement and advanced topic suggestions  
- **📈 Room for Improvement (60-69%)**: Study tips and clarification recommendations
- **⚠️ At Risk (50-59%)**: Action needed, lecturer meetings recommended
- **🚨 Critical (<50%)**: Immediate intervention required

### Lecturer Alerts
- **🔔 Student Needs Support (30-49%)**: Moderate intervention recommended
- **🚨 Critical Risk (<30%)**: Immediate comprehensive support required

## Technical Implementation

### Backend Services
- **`RealTimeAlertService.js`**: New service handling real-time alert generation
- **`predictionController.js`**: Updated to use real-time alerts
- **`alertController.js`**: Simplified to focus on real-time functionality

### Frontend Components
- **`StudentDashboardAlerts.tsx`**: Clean component showing one alert per course
- **`LecturerDashboardAlerts.tsx`**: At-risk student display with intervention tools

### API Endpoints
- `GET /api/alerts/student/:studentId/dashboard` - Get current alerts for student
- `GET /api/alerts/lecturer/:lecturerId/at-risk` - Get at-risk students for lecturer
- `PATCH /api/alerts/:alertId/dismiss` - Dismiss an alert
- `DELETE /api/alerts/clear-all` - Clear all alerts (admin)

## Database Changes

### Cleaned Tables
- **`alerts`**: Starts empty, populated only with real-time alerts
- **`alert_generation_log`**: Starts empty, tracks real alert generation

### No Dummy Data
- All existing dummy alerts have been removed
- System only stores alerts from actual predictions
- Clean slate for real performance tracking

## Usage Instructions

### Getting Started
1. **Clear Database**: Run `node backend/clearAlerts.js` to start fresh
2. **Make Predictions**: Students request grade predictions through the dashboard
3. **View Alerts**: Check student dashboard for performance alerts
4. **Lecturer Monitoring**: Lecturers can view at-risk students in their dashboard

### For Students
- View real-time performance alerts in dashboard
- Each course shows only the most recent prediction alert
- Dismiss alerts after taking action
- No historical alert clutter

### For Lecturers  
- Monitor at-risk students (predicted grade < 50%)
- Access intervention recommendations
- Direct contact options for reaching out to students
- Focus on students who need immediate support

## Benefits

### ✅ **Accuracy**
- No fake or dummy data
- Alerts based only on actual AI predictions
- Real-time reflection of student performance

### ✅ **Clarity**
- One alert per course for students
- Clean, uncluttered dashboard
- Focus on current performance, not history

### ✅ **Actionable**
- Lecturers see only students who need help
- Clear intervention recommendations
- Direct contact tools available

### ✅ **Efficient**
- Automatic cleanup of outdated alerts
- No manual maintenance required
- Real-time updates as predictions change

## Monitoring and Maintenance

### Automatic Features
- Old alerts are automatically cleared when new predictions are made
- Database stays clean without manual intervention
- Real-time updates ensure current information

### Admin Tools
- Clear all alerts endpoint for system maintenance
- Monitoring of alert generation patterns
- Error handling ensures system stability

## Future Enhancements

- Email/SMS notifications for critical alerts
- Custom alert thresholds by course
- Detailed intervention tracking
- Analytics on alert effectiveness
- Integration with learning management systems

---

**Note**: This system represents a complete rebuild focused on real-time accuracy and actionable insights. All dummy data has been eliminated in favor of a clean, prediction-based alert system.
