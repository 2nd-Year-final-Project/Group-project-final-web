const express = require("express");
const router = express.Router();
const alertsController = require("../controllers/alertsController");

// Student alert routes
router.get("/student/:student_id", alertsController.getStudentAlerts);
router.get("/student/:student_id/statistics", alertsController.getAlertStatistics);

// Lecturer alert routes
router.get("/lecturer/:lecturer_id", alertsController.getLecturerAlerts);
router.get("/lecturer/:lecturer_id/statistics", alertsController.getAlertStatistics);

// Alert management routes
router.post("/mark-read/:alert_id", alertsController.markAlertAsRead);
router.post("/mark-resolved/:alert_id", alertsController.markAlertAsResolved);

// Alert preferences routes
router.get("/preferences/:user_id", alertsController.getAlertPreferences);
router.put("/preferences/:user_id", alertsController.updateAlertPreferences);

// Alert processing routes
router.post("/process/:student_id/:course_id", alertsController.triggerAlertsProcessing);
router.post("/process-all", alertsController.processAllAlerts);

// Analytics routes
router.get("/analytics", alertsController.getAlertAnalytics);

module.exports = router;
