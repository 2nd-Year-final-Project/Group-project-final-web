const express = require('express');
const { 
  getUserAlerts, 
  getUnreadAlertCount, 
  markAlertAsRead, 
  dismissAlert, 
  generateTestAlerts,
  generateCourseAlerts,
  generateStudentAlerts
} = require('../controllers/alertController');

const router = express.Router();

// Get alerts for a user
router.get('/user/:userId', getUserAlerts);

// Get unread alert count for a user
router.get('/user/:userId/unread-count', getUnreadAlertCount);

// Mark alert as read
router.patch('/:alertId/read', markAlertAsRead);

// Dismiss alert
router.patch('/:alertId/dismiss', dismissAlert);

// Generate test alerts (for testing purposes)
router.post('/generate-test', generateTestAlerts);

// Batch generate alerts for all students in a course
router.post('/generate-course/:courseId', generateCourseAlerts);

// Batch generate alerts for a student across all courses
router.post('/generate-student/:studentId', generateStudentAlerts);

module.exports = router;
