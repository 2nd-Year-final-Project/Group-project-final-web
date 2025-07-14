const express = require("express");
const {
  runAlertCheck,
  getStudentAlerts,
  getLecturerAlerts,
  getAdminAlerts,
  markAlertAsRead,
  markAlertAsResolved,
  getAlertStatistics,
  getAlertsBySeverity
} = require("../controllers/alertController");

const router = express.Router();

// Alert management routes
router.post("/check", runAlertCheck);                          // Run alert check
router.get("/statistics", getAlertStatistics);                 // Get alert statistics
router.get("/severity/:severity", getAlertsBySeverity);        // Get alerts by severity

// Role-specific alert routes
router.get("/student/:studentId", getStudentAlerts);           // Get student alerts
router.get("/lecturer/:lecturerId", getLecturerAlerts);        // Get lecturer alerts
router.get("/admin", getAdminAlerts);                          // Get admin alerts

// Alert actions
router.post("/:alertId/read", markAlertAsRead);                // Mark alert as read
router.post("/:alertId/resolve", markAlertAsResolved);         // Mark alert as resolved

module.exports = router;
