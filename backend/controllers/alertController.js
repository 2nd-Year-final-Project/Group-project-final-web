const AlertService = require('../services/alertService');

// Get alerts for the authenticated user
const getUserAlerts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userType = 'student', limit = 50 } = req.query;

    const alerts = await AlertService.getAlertsForUser(userId, userType, parseInt(limit));
    
    res.json({
      success: true,
      alerts,
      total: alerts.length
    });
  } catch (error) {
    console.error('Error fetching user alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
};

// Get unread alert count for the authenticated user
const getUnreadAlertCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userType = 'student' } = req.query;

    const count = await AlertService.getUnreadAlertCount(userId, userType);
    
    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Error fetching unread alert count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread alert count',
      error: error.message
    });
  }
};

// Mark an alert as read
const markAlertAsRead = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { userId } = req.body;

    await AlertService.markAlertAsRead(alertId, userId);
    
    res.json({
      success: true,
      message: 'Alert marked as read'
    });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark alert as read',
      error: error.message
    });
  }
};

// Dismiss an alert
const dismissAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { userId } = req.body;

    await AlertService.dismissAlert(alertId, userId);
    
    res.json({
      success: true,
      message: 'Alert dismissed'
    });
  } catch (error) {
    console.error('Error dismissing alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dismiss alert',
      error: error.message
    });
  }
};

// Manually trigger alert generation for testing (admin only)
const generateTestAlerts = async (req, res) => {
  try {
    const { studentId, courseId, predictedPercentage } = req.body;

    if (!studentId || !courseId || predictedPercentage === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: studentId, courseId, predictedPercentage'
      });
    }

    const alerts = await AlertService.generateAlertsFromPrediction(studentId, courseId, predictedPercentage);
    
    res.json({
      success: true,
      message: 'Test alerts generated successfully',
      alertsGenerated: alerts
    });
  } catch (error) {
    console.error('Error generating test alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate test alerts',
      error: error.message
    });
  }
};

// Batch generate alerts for all students in a course
const generateCourseAlerts = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    const alerts = await AlertService.generateCourseAlerts(courseId);
    
    res.json({
      success: true,
      message: 'Course alerts generated successfully',
      alertsGenerated: alerts.length,
      alerts
    });
  } catch (error) {
    console.error('Error generating course alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate course alerts',
      error: error.message
    });
  }
};

// Batch generate alerts for a student across all courses
const generateStudentAlerts = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    const alerts = await AlertService.generateStudentAlerts(studentId);
    
    res.json({
      success: true,
      message: 'Student alerts generated successfully',
      alertsGenerated: alerts.length,
      alerts
    });
  } catch (error) {
    console.error('Error generating student alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate student alerts',
      error: error.message
    });
  }
};

module.exports = {
  getUserAlerts,
  getUnreadAlertCount,
  markAlertAsRead,
  dismissAlert,
  generateTestAlerts,
  generateCourseAlerts,
  generateStudentAlerts
};
