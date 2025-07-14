const alertsService = require("../services/alertsService");
const db = require("../config/db");

// Get alerts for a student
const getStudentAlerts = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { course_id, limit = 50, unread_only = false } = req.query;
    
    let query = `
      SELECT a.*, c.course_name, c.course_code 
      FROM alerts a 
      JOIN courses c ON a.course_id = c.id 
      WHERE a.student_id = ?
    `;
    const params = [student_id];
    
    if (course_id) {
      query += " AND a.course_id = ?";
      params.push(course_id);
    }
    
    if (unread_only === 'true') {
      query += " AND a.is_read = FALSE";
    }
    
    query += " ORDER BY a.created_at DESC LIMIT ?";
    params.push(parseInt(limit));
    
    const [alerts] = await db.promise().query(query, params);
    
    // Get unread count
    const unreadCount = await alertsService.getUnreadAlertCount(student_id, false);
    
    res.json({
      alerts,
      unreadCount,
      total: alerts.length
    });
    
  } catch (error) {
    console.error("Error fetching student alerts:", error);
    res.status(500).json({ message: "Failed to fetch alerts", error: error.message });
  }
};

// Get alerts for a lecturer
const getLecturerAlerts = async (req, res) => {
  try {
    const { lecturer_id } = req.params;
    const { limit = 50, unread_only = false, action_required = false } = req.query;
    
    let query = "SELECT * FROM lecturer_alerts WHERE lecturer_id = ?";
    const params = [lecturer_id];
    
    if (unread_only === 'true') {
      query += " AND is_read = FALSE";
    }
    
    if (action_required === 'true') {
      query += " AND action_required = TRUE";
    }
    
    query += " ORDER BY created_at DESC LIMIT ?";
    params.push(parseInt(limit));
    
    const [alerts] = await db.promise().query(query, params);
    
    // Get unread count
    const unreadCount = await alertsService.getUnreadAlertCount(lecturer_id, true);
    
    res.json({
      alerts,
      unreadCount,
      total: alerts.length
    });
    
  } catch (error) {
    console.error("Error fetching lecturer alerts:", error);
    res.status(500).json({ message: "Failed to fetch alerts", error: error.message });
  }
};

// Mark alert as read
const markAlertAsRead = async (req, res) => {
  try {
    const { alert_id } = req.params;
    const { user_id, is_lecturer = false } = req.body;
    
    await alertsService.markAlertAsRead(alert_id, user_id, is_lecturer);
    
    res.json({ message: "Alert marked as read" });
    
  } catch (error) {
    console.error("Error marking alert as read:", error);
    res.status(500).json({ message: "Failed to mark alert as read", error: error.message });
  }
};

// Mark alert as resolved
const markAlertAsResolved = async (req, res) => {
  try {
    const { alert_id } = req.params;
    const { user_id, is_lecturer = false } = req.body;
    
    await alertsService.markAlertAsResolved(alert_id, user_id, is_lecturer);
    
    res.json({ message: "Alert marked as resolved" });
    
  } catch (error) {
    console.error("Error marking alert as resolved:", error);
    res.status(500).json({ message: "Failed to mark alert as resolved", error: error.message });
  }
};

// Get alert statistics for dashboard
const getAlertStatistics = async (req, res) => {
  try {
    const { user_id, is_lecturer = false } = req.query;
    
    if (is_lecturer === 'true') {
      // Lecturer statistics
      const [stats] = await db.promise().query(`
        SELECT 
          COUNT(*) as total_alerts,
          SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread_alerts,
          SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_alerts,
          SUM(CASE WHEN action_required = TRUE AND is_resolved = FALSE THEN 1 ELSE 0 END) as action_required_alerts,
          SUM(CASE WHEN alert_type = 'student_at_risk' THEN 1 ELSE 0 END) as at_risk_students
        FROM lecturer_alerts 
        WHERE lecturer_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `, [user_id]);
      
      res.json(stats[0]);
    } else {
      // Student statistics
      const [stats] = await db.promise().query(`
        SELECT 
          COUNT(*) as total_alerts,
          SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread_alerts,
          SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_alerts,
          SUM(CASE WHEN alert_type = 'at_risk' THEN 1 ELSE 0 END) as at_risk_alerts,
          SUM(CASE WHEN alert_type = 'excellent' THEN 1 ELSE 0 END) as excellent_alerts
        FROM alerts 
        WHERE student_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `, [user_id]);
      
      res.json(stats[0]);
    }
    
  } catch (error) {
    console.error("Error fetching alert statistics:", error);
    res.status(500).json({ message: "Failed to fetch statistics", error: error.message });
  }
};

// Get alert preferences for a user
const getAlertPreferences = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const [preferences] = await db.promise().query(
      "SELECT * FROM alert_preferences WHERE user_id = ?",
      [user_id]
    );
    
    if (preferences.length === 0) {
      // Return default preferences
      res.json({
        user_id: parseInt(user_id),
        email_notifications: true,
        push_notifications: true,
        at_risk_alerts: true,
        performance_alerts: true,
        attendance_alerts: true,
        grade_prediction_alerts: true,
        motivational_alerts: true,
        alert_frequency: 'immediate'
      });
    } else {
      res.json(preferences[0]);
    }
    
  } catch (error) {
    console.error("Error fetching alert preferences:", error);
    res.status(500).json({ message: "Failed to fetch preferences", error: error.message });
  }
};

// Update alert preferences for a user
const updateAlertPreferences = async (req, res) => {
  try {
    const { user_id } = req.params;
    const {
      email_notifications,
      push_notifications,
      at_risk_alerts,
      performance_alerts,
      attendance_alerts,
      grade_prediction_alerts,
      motivational_alerts,
      alert_frequency
    } = req.body;
    
    await db.promise().query(`
      INSERT INTO alert_preferences 
      (user_id, email_notifications, push_notifications, at_risk_alerts, performance_alerts, 
       attendance_alerts, grade_prediction_alerts, motivational_alerts, alert_frequency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        email_notifications = VALUES(email_notifications),
        push_notifications = VALUES(push_notifications),
        at_risk_alerts = VALUES(at_risk_alerts),
        performance_alerts = VALUES(performance_alerts),
        attendance_alerts = VALUES(attendance_alerts),
        grade_prediction_alerts = VALUES(grade_prediction_alerts),
        motivational_alerts = VALUES(motivational_alerts),
        alert_frequency = VALUES(alert_frequency)
    `, [
      user_id, email_notifications, push_notifications, at_risk_alerts,
      performance_alerts, attendance_alerts, grade_prediction_alerts,
      motivational_alerts, alert_frequency
    ]);
    
    res.json({ message: "Alert preferences updated successfully" });
    
  } catch (error) {
    console.error("Error updating alert preferences:", error);
    res.status(500).json({ message: "Failed to update preferences", error: error.message });
  }
};

// Trigger alerts processing for a specific student and course
const triggerAlertsProcessing = async (req, res) => {
  try {
    const { student_id, course_id } = req.params;
    
    await alertsService.processStudentAlerts(student_id, course_id);
    
    res.json({ message: "Alerts processing completed" });
    
  } catch (error) {
    console.error("Error triggering alerts processing:", error);
    res.status(500).json({ message: "Failed to process alerts", error: error.message });
  }
};

// Process all pending alerts (admin function)
const processAllAlerts = async (req, res) => {
  try {
    await alertsService.processAllPendingAlerts();
    
    res.json({ message: "All alerts processed successfully" });
    
  } catch (error) {
    console.error("Error processing all alerts:", error);
    res.status(500).json({ message: "Failed to process all alerts", error: error.message });
  }
};

// Get alert trends and analytics
const getAlertAnalytics = async (req, res) => {
  try {
    const { period = '7' } = req.query; // days
    
    // Get alert trends
    const [alertTrends] = await db.promise().query(`
      SELECT 
        DATE(created_at) as date,
        alert_type,
        severity,
        COUNT(*) as count
      FROM alerts 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at), alert_type, severity
      ORDER BY date DESC
    `, [parseInt(period)]);
    
    // Get most common alert types
    const [alertTypes] = await db.promise().query(`
      SELECT 
        alert_type,
        COUNT(*) as count,
        AVG(CASE WHEN severity = 'critical' THEN 4 
                 WHEN severity = 'high' THEN 3 
                 WHEN severity = 'medium' THEN 2 
                 ELSE 1 END) as avg_severity
      FROM alerts 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY alert_type
      ORDER BY count DESC
    `, [parseInt(period)]);
    
    // Get course-wise alert distribution
    const [courseAlerts] = await db.promise().query(`
      SELECT 
        c.course_name,
        c.course_code,
        COUNT(a.id) as alert_count,
        SUM(CASE WHEN a.severity = 'critical' THEN 1 ELSE 0 END) as critical_count
      FROM courses c
      LEFT JOIN alerts a ON c.id = a.course_id AND a.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY c.id, c.course_name, c.course_code
      ORDER BY alert_count DESC
    `, [parseInt(period)]);
    
    res.json({
      alertTrends,
      alertTypes,
      courseAlerts,
      period: parseInt(period)
    });
    
  } catch (error) {
    console.error("Error fetching alert analytics:", error);
    res.status(500).json({ message: "Failed to fetch analytics", error: error.message });
  }
};

module.exports = {
  getStudentAlerts,
  getLecturerAlerts,
  markAlertAsRead,
  markAlertAsResolved,
  getAlertStatistics,
  getAlertPreferences,
  updateAlertPreferences,
  triggerAlertsProcessing,
  processAllAlerts,
  getAlertAnalytics
};
