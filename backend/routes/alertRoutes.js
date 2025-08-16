const express = require('express');
const { 
  getUserAlerts, 
  getUnreadAlertCount, 
  markAlertAsRead, 
  dismissAlert, 
  getStudentDashboardAlerts,
  getAtRiskStudents,
  getCourseAtRiskStudents,
  clearAllAlerts
} = require('../controllers/alertController');

const router = express.Router();

// Get alerts for a user
router.get('/user/:userId', getUserAlerts);

// Get unread alert count for a user
router.get('/user/:userId/unread-count', getUnreadAlertCount);

// Get student dashboard alerts (one per course)
router.get('/student/:studentId/dashboard', getStudentDashboardAlerts);

// Get at-risk students for lecturer
router.get('/lecturer/:lecturerId/at-risk', getAtRiskStudents);

// Get at-risk students for a specific course
router.get('/lecturer/:lecturerId/course/:courseId/at-risk', getCourseAtRiskStudents);

// Mark alert as read
router.patch('/:alertId/read', markAlertAsRead);

// Dismiss alert
router.patch('/:alertId/dismiss', dismissAlert);

// Clear all alerts (admin function)
router.delete('/clear-all', clearAllAlerts);

module.exports = router;
