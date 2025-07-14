const alertService = require("../services/alertService");

// Run alert check (can be called manually or via cron job)
const runAlertCheck = async (req, res) => {
  try {
    const result = await alertService.checkAndCreateAlerts();
    
    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(500).json({ message: "Alert check failed", error: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: "Error running alert check", error: error.message });
  }
};

// Get alerts for current student
const getStudentAlerts = async (req, res) => {
  try {
    const { studentId } = req.params;
    const alerts = await alertService.getStudentAlerts(studentId);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student alerts", error: error.message });
  }
};

// Get alerts for current lecturer
const getLecturerAlerts = async (req, res) => {
  try {
    const { lecturerId } = req.params;
    const alerts = await alertService.getLecturerAlerts(lecturerId);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching lecturer alerts", error: error.message });
  }
};

// Get all alerts for admin
const getAdminAlerts = async (req, res) => {
  try {
    const alerts = await alertService.getAdminAlerts();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin alerts", error: error.message });
  }
};

// Mark alert as read
const markAlertAsRead = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { userRole } = req.body;
    
    await alertService.markAlertAsRead(alertId, userRole);
    res.json({ message: "Alert marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error marking alert as read", error: error.message });
  }
};

// Mark alert as resolved
const markAlertAsResolved = async (req, res) => {
  try {
    const { alertId } = req.params;
    
    await alertService.markAlertAsResolved(alertId);
    res.json({ message: "Alert marked as resolved" });
  } catch (error) {
    res.status(500).json({ message: "Error marking alert as resolved", error: error.message });
  }
};

// Get alert statistics
const getAlertStatistics = async (req, res) => {
  try {
    const stats = await alertService.getAlertStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching alert statistics", error: error.message });
  }
};

// Get alerts by severity
const getAlertsBySeverity = async (req, res) => {
  try {
    const { severity } = req.params;
    const { role, userId } = req.query;
    
    let alerts;
    if (role === 'admin') {
      alerts = await alertService.getAdminAlerts();
    } else if (role === 'lecturer') {
      alerts = await alertService.getLecturerAlerts(userId);
    } else if (role === 'student') {
      alerts = await alertService.getStudentAlerts(userId);
    }
    
    // Filter by severity
    const filteredAlerts = alerts.filter(alert => alert.severity === severity);
    res.json(filteredAlerts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching alerts by severity", error: error.message });
  }
};

module.exports = {
  runAlertCheck,
  getStudentAlerts,
  getLecturerAlerts,
  getAdminAlerts,
  markAlertAsRead,
  markAlertAsResolved,
  getAlertStatistics,
  getAlertsBySeverity
};
