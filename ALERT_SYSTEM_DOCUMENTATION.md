# Alert System Implementation

## Overview

The alert system generates intelligent notifications based on student performance predictions. It provides personalized feedback to both students and lecturers about academic performance across all grade ranges.

**Important**: Alerts are only generated and displayed for courses where students have set their study parameters (Hours Studied and Teacher Quality). This ensures that alerts are based on meaningful prediction data.

## Features

### 🎯 Intelligent Alert Generation
- **Based on Predicted Grades**: Alerts are generated only when AI predictions are available
- **Study Parameters Required**: Alerts only display for courses where students have set study parameters (Hours Studied and Teacher Quality)
- **No Hard-coded Data**: All alerts are dynamically generated from real prediction results
- **Multiple Performance Levels**: Covers all grade ranges from excellent (A+) to critical (E)
- **Personalized Messages**: Tailored feedback based on specific performance levels

### 👨‍🎓 Student Alerts
- **Performance Feedback**: Personalized messages for all performance levels
- **Actionable Recommendations**: Specific guidance based on predicted grade
- **Progress Tracking**: Visual indicators and severity levels
- **Course-Specific**: Alerts tied to individual course performance

### 👨‍🏫 Lecturer Alerts
- **At-Risk Student Identification**: Automatic notifications for students scoring below 65%
- **Student-Specific Information**: Details about struggling students
- **Intervention Suggestions**: Recommendations for providing support
- **Course Management**: Alerts organized by course

## Alert Types & Severity Levels

### Performance Categories
1. **Excellent (85%+)**: A+ grade predictions
   - Type: `excellent`
   - Severity: `low`
   - Focus: Encouragement and peer mentoring

2. **Strong (70-84%)**: A grade predictions
   - Type: `performance`
   - Severity: `low`
   - Focus: Maintain momentum, explore advanced topics

3. **Good (65-69%)**: A- grade predictions
   - Type: `performance`
   - Severity: `low`
   - Focus: Strengthen core concepts

4. **Satisfactory (60-64%)**: B+ grade predictions
   - Type: `improvement`
   - Severity: `medium`
   - Focus: Increase study time and seek clarification

5. **Below Average (55-59%)**: B grade predictions
   - Type: `warning`
   - Severity: `medium`
   - Focus: Join study groups, increase study hours

6. **Concerning (50-54%)**: B- grade predictions
   - Type: `warning`
   - Severity: `high`
   - Focus: Attend office hours, seek tutoring

7. **Poor (40-49%)**: C/C+ grade predictions
   - Type: `warning`
   - Severity: `high`
   - Focus: Urgent academic intervention needed

8. **Critical (<40%)**: D/E grade predictions
   - Type: `warning`
   - Severity: `critical`
   - Focus: Comprehensive support required

## Database Schema

### `alerts` Table
```sql
- id: Primary key
- student_id: Reference to student
- course_id: Reference to course
- recipient_type: 'student' or 'lecturer'
- recipient_id: User who receives the alert
- alert_type: Type of alert (performance, warning, etc.)
- severity: Alert severity level
- title: Alert title
- message: Detailed alert message
- predicted_grade: Numerical grade prediction
- predicted_percentage: Percentage prediction
- is_read: Read status
- is_dismissed: Dismissal status
- created_at: Creation timestamp
```

### `alert_generation_log` Table
```sql
- Prevents duplicate alerts
- Tracks generation history
- Allows for intelligent re-alerting
```

## API Endpoints

### `/api/alerts/user/:userId`
- **Method**: GET
- **Purpose**: Fetch alerts for a user
- **Parameters**: 
  - `userType`: 'student' or 'lecturer'
  - `limit`: Number of alerts to fetch

### `/api/alerts/user/:userId/unread-count`
- **Method**: GET
- **Purpose**: Get unread alert count
- **Parameters**: `userType`

### `/api/alerts/:alertId/read`
- **Method**: PATCH
- **Purpose**: Mark alert as read

### `/api/alerts/:alertId/dismiss`
- **Method**: PATCH
- **Purpose**: Dismiss an alert

### `/api/alerts/generate-test`
- **Method**: POST
- **Purpose**: Generate test alerts (admin only)

## Integration Points

### 1. Prediction Controller
- Alerts are automatically generated when predictions are made
- Integrated into the existing prediction workflow
- Non-blocking: Alert failures don't affect predictions

### 2. Student Dashboard
- `AlertSystem` component displays student-specific alerts
- Real-time updates of alert status
- Interactive alert management

### 3. Lecturer Dashboard
- `AlertSystem` component shows at-risk student alerts
- Focus on concerning performance levels
- Course-specific alert organization

## Alert Logic

### Duplicate Prevention
- Alerts are not generated if:
  - Same alert type exists within 24 hours
  - Grade hasn't changed significantly (>5 points)

### Lecturer Alert Filtering
- Only alerts for students with predictions <65%
- Focuses on students needing intervention
- Customized messaging for educators

### Smart Thresholds
- **Student Alerts**: All performance levels
- **Lecturer Alerts**: Only concerning performance (<65%)
- **Critical Alerts**: Immediate attention required (<40%)

## Usage Instructions

### For Students
1. Check dashboard for new alerts
2. Read personalized performance feedback
3. Follow recommended actions
4. Mark alerts as read when addressed
5. Dismiss alerts when no longer relevant

### For Lecturers
1. Monitor at-risk student alerts
2. Reach out to struggling students
3. Provide additional support as recommended
4. Track intervention effectiveness

### For Administrators
1. Use test alert generation for system validation
2. Monitor alert generation patterns
3. Analyze student support needs

## Technical Notes

### Performance Considerations
- Alert generation is asynchronous
- Database queries are optimized with indexes
- Duplicate prevention reduces noise

### Error Handling
- Graceful degradation if alert generation fails
- Prediction functionality remains unaffected
- Comprehensive error logging

### Future Enhancements
- Email/SMS notification integration
- Custom alert thresholds
- Advanced analytics on alert effectiveness
- Integration with learning management systems

## Testing

Run the test script to validate alert generation:

```bash
cd backend
node test_alerts.js
```

This will:
1. Initialize database tables
2. Generate test alerts for different performance levels
3. Verify alert creation and messaging
4. Validate both student and lecturer alert generation
