# Real-Time Alerts System Documentation

## Overview

The Real-Time Alerts System is a comprehensive notification and monitoring solution designed to provide timely feedback to students and lecturers about academic performance. The system automatically generates intelligent alerts based on predicted grades, assignment performance, attendance, and other academic metrics.

## Features

### 🎯 Intelligent Alert Categories

#### For Students:
- **At Risk Alerts** 🚨 - Critical warnings when predicted to fail or perform poorly
- **Performance Alerts** 📊 - Notifications about quiz, assignment, and exam results
- **Attendance Alerts** 📅 - Warnings about low attendance levels
- **Grade Prediction Alerts** 🎯 - Updates about predicted final grades
- **Motivational Alerts** 💪 - Encouraging messages and achievement celebrations

#### For Lecturers:
- **Student At Risk** 🚨 - Alerts about students who need intervention
- **Performance Monitoring** 📈 - Overview of class performance trends
- **Attendance Monitoring** 📋 - Students with poor attendance
- **Action Required** ⚠️ - Students requiring immediate attention

### 🔔 Multi-Channel Notifications

- **In-App Notifications** - Real-time alerts in the dashboard
- **Email Notifications** - Critical and high-priority alerts via email
- **Browser Notifications** - Push notifications when application is open
- **Dashboard Integration** - Seamless integration with existing dashboards

### ⚙️ Customizable Preferences

- **Notification Methods** - Choose email, push, or both
- **Alert Types** - Enable/disable specific alert categories
- **Frequency Settings** - Immediate, daily, or weekly summaries
- **Severity Filtering** - Control which severity levels trigger notifications

### 📊 Analytics & Insights

- **Alert Statistics** - Track alert trends and patterns
- **Performance Analytics** - Visualize alert distribution by course and severity
- **Response Tracking** - Monitor alert resolution rates

## System Architecture

### Backend Components

```
backend/
├── services/alertsService.js       # Core alert generation logic
├── controllers/alertsController.js # API endpoints for alerts
├── routes/alertRoutes.js          # Alert routing configuration
├── scheduler/alertScheduler.js    # Automated alert processing
├── middleware/alertMiddleware.js  # Real-time trigger middleware
└── utils/emailService.js          # Email notification service
```

### Frontend Components

```
frontend/src/
├── components/
│   ├── AlertsPanel.tsx             # Student alerts interface
│   ├── LecturerAlertsPanel.tsx     # Lecturer alerts interface
│   ├── AlertPreferences.tsx        # User preferences settings
│   └── NotificationBell.tsx        # Navigation notification bell
└── hooks/
    └── useRealTimeAlerts.ts        # Real-time alerts hook
```

### Database Schema

```sql
-- Main alerts table for students
alerts (id, student_id, course_id, alert_type, severity, title, message, ...)

-- Lecturer alerts table
lecturer_alerts (id, lecturer_id, student_id, course_id, alert_type, ...)

-- User preferences
alert_preferences (id, user_id, email_notifications, push_notifications, ...)

-- Alert thresholds configuration
alert_thresholds (id, threshold_type, severity, min_value, max_value, ...)
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MySQL database
- Existing student performance system

### Quick Installation

```bash
# Run the automated installation script
./install_alerts_system.sh
```

### Manual Installation

1. **Database Setup**
   ```bash
   mysql -u root -p student_performance < database/alerts_schema.sql
   ```

2. **Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

4. **Start Services**
   ```bash
   # Backend (in one terminal)
   cd backend && npm start
   
   # Frontend (in another terminal)
   cd frontend && npm run dev
   ```

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Email Service Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=student_performance

# Server Configuration
PORT=5000
```

### Alert Thresholds

The system comes with pre-configured thresholds for different alert types:

| Metric | Critical | High | Medium | Low |
|--------|----------|------|--------|-----|
| Attendance | <50% | 50-65% | 65-75% | 75-85% |
| Quiz Marks | <40% | 40-55% | 55-70% | >70% |
| Assignment Marks | <40% | 40-55% | 55-70% | >70% |
| Predicted Marks | <40% | 40-55% | 55-70% | >70% |

These can be customized through the `alert_thresholds` table.

## API Endpoints

### Student Alerts

```http
GET /api/alerts/student/:student_id
GET /api/alerts/student/:student_id/statistics
POST /api/alerts/mark-read/:alert_id
POST /api/alerts/mark-resolved/:alert_id
```

### Lecturer Alerts

```http
GET /api/alerts/lecturer/:lecturer_id
GET /api/alerts/lecturer/:lecturer_id/statistics
```

### Preferences

```http
GET /api/alerts/preferences/:user_id
PUT /api/alerts/preferences/:user_id
```

### Processing

```http
POST /api/alerts/process/:student_id/:course_id
POST /api/alerts/process-all
```

### Analytics

```http
GET /api/alerts/analytics
```

## Usage Examples

### Integrating Alerts in Student Dashboard

```tsx
import AlertsPanel from '../components/AlertsPanel';
import NotificationBell from '../components/NotificationBell';

const StudentDashboard = ({ studentId }) => {
  return (
    <div>
      {/* Navigation with notification bell */}
      <nav>
        <NotificationBell userId={studentId} />
      </nav>
      
      {/* Main alerts panel */}
      <main>
        <AlertsPanel studentId={studentId} />
      </main>
    </div>
  );
};
```

### Integrating Alerts in Lecturer Dashboard

```tsx
import LecturerAlertsPanel from '../components/LecturerAlertsPanel';
import NotificationBell from '../components/NotificationBell';

const LecturerDashboard = ({ lecturerId }) => {
  return (
    <div>
      {/* Navigation with notification bell */}
      <nav>
        <NotificationBell userId={lecturerId} isLecturer={true} />
      </nav>
      
      {/* Main alerts panel */}
      <main>
        <LecturerAlertsPanel lecturerId={lecturerId} />
      </main>
    </div>
  );
};
```

### Using Real-Time Alerts Hook

```tsx
import useRealTimeAlerts from '../hooks/useRealTimeAlerts';

const MyComponent = ({ userId }) => {
  const { alerts, unreadCount, markAsRead } = useRealTimeAlerts(userId);
  
  return (
    <div>
      <h3>You have {unreadCount} unread alerts</h3>
      {alerts.map(alert => (
        <div key={alert.id} onClick={() => markAsRead(alert.id)}>
          {alert.title}
        </div>
      ))}
    </div>
  );
};
```

## Alert Generation Logic

### Automatic Triggers

The system automatically generates alerts when:

1. **Predictions are generated** - Based on ML model output
2. **Marks are entered** - Quiz, assignment, or midterm scores
3. **Attendance is updated** - When attendance falls below thresholds
4. **Scheduled processing** - Hourly automated checks

### Alert Severity Determination

```javascript
// Example severity logic for predicted marks
if (predicted_marks < 40) {
  severity = 'critical';
  alertType = 'at_risk';
} else if (predicted_marks < 55) {
  severity = 'high';
  alertType = 'at_risk';
} else if (predicted_marks < 70) {
  severity = 'medium';
  alertType = 'average';
} else if (predicted_marks >= 85) {
  severity = 'low';
  alertType = 'excellent';
}
```

### Email Notification Rules

Email notifications are sent for:
- All **critical** severity alerts
- All **high** severity alerts
- When user preferences allow email notifications
- For lecturer alerts requiring action

## Customization

### Adding New Alert Types

1. **Update Database Schema**
   ```sql
   ALTER TABLE alerts MODIFY COLUMN alert_type ENUM('existing_types', 'new_type');
   ```

2. **Add Generation Logic**
   ```javascript
   // In alertsService.js
   async generateCustomAlert(studentId, courseId, data) {
     // Custom alert logic
   }
   ```

3. **Update Frontend**
   ```tsx
   // Add new alert type handling in components
   const getAlertTypeEmoji = (alertType) => {
     switch (alertType) {
       case 'new_type':
         return '🎯';
       // ... existing cases
     }
   };
   ```

### Modifying Alert Thresholds

Update the `alert_thresholds` table:

```sql
UPDATE alert_thresholds 
SET min_value = 45, max_value = 60 
WHERE threshold_type = 'predicted_marks' AND severity = 'high';
```

### Custom Email Templates

Modify the `sendAlertEmail` function in `utils/emailService.js`:

```javascript
const customEmailTemplate = `
  <!-- Your custom HTML template -->
  <div style="background: ${severityColors[severity]};">
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
`;
```

## Monitoring & Maintenance

### Alert Analytics

Monitor system performance through:

```http
GET /api/alerts/analytics?period=30
```

Response includes:
- Alert trends over time
- Most common alert types
- Course-wise alert distribution
- Severity distribution

### Performance Optimization

1. **Database Indexing**
   - Indexes on `student_id`, `course_id`, `created_at`
   - Composite indexes for frequent queries

2. **Caching**
   - Cache alert counts and statistics
   - Use Redis for real-time data

3. **Background Processing**
   - Process alerts asynchronously
   - Use job queues for email sending

### Troubleshooting

#### Common Issues

1. **Alerts Not Generating**
   - Check if alert scheduler is running
   - Verify database connections
   - Check alert thresholds configuration

2. **Email Notifications Not Working**
   - Verify email service configuration
   - Check user preferences
   - Ensure SMTP settings are correct

3. **Real-Time Updates Not Working**
   - Check if polling is active
   - Verify API endpoints are accessible
   - Check browser notification permissions

#### Logs and Debugging

```bash
# Check backend logs
tail -f backend/logs/alerts.log

# Monitor database queries
SHOW PROCESSLIST;

# Check email queue
SELECT * FROM email_queue WHERE status = 'pending';
```

## Security Considerations

### Data Privacy

- Alerts contain sensitive student performance data
- Implement proper access controls
- Encrypt sensitive data in transit and at rest

### API Security

- Authenticate all API requests
- Validate user permissions for alert access
- Rate limit notification endpoints

### Email Security

- Use app passwords for email services
- Validate email addresses before sending
- Implement unsubscribe mechanisms

## Performance Metrics

### Key Performance Indicators

- **Alert Response Time** - Time from trigger to notification
- **Email Delivery Rate** - Percentage of emails successfully delivered
- **User Engagement** - Alert read/resolution rates
- **System Uptime** - Availability of alert services

### Monitoring Tools

```javascript
// Example monitoring metrics
const metrics = {
  alertsGenerated: counter,
  emailsSent: counter,
  apiResponseTime: histogram,
  activeUsers: gauge
};
```

## Future Enhancements

### Planned Features

1. **Mobile App Integration** - Push notifications to mobile devices
2. **SMS Notifications** - Text message alerts for critical issues
3. **Advanced Analytics** - Machine learning for alert prediction
4. **Integration APIs** - Connect with external systems
5. **Chatbot Integration** - Automated responses to common alerts

### Scalability Improvements

1. **Microservices Architecture** - Split into smaller services
2. **Message Queues** - Use Redis/RabbitMQ for processing
3. **Load Balancing** - Distribute alert processing
4. **Database Sharding** - Scale database horizontally

## Support

### Documentation

- API documentation available at `/api/docs`
- Component documentation in Storybook
- Database schema documentation

### Community

- GitHub Issues for bug reports
- Discord channel for support
- Stack Overflow tag: `student-alerts`

### Professional Support

- Priority support available
- Custom implementation services
- Training and workshops

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Alerting! 🚀**
