const alertsService = require("../services/alertsService");
const db = require("../config/db");

class AlertScheduler {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
  }

  // Start the alert processing scheduler
  start(intervalMinutes = 60) { // Default: run every hour
    if (this.isRunning) {
      console.log("Alert scheduler is already running");
      return;
    }

    console.log(`Starting alert scheduler - will run every ${intervalMinutes} minutes`);
    
    this.isRunning = true;
    
    // Run immediately on start
    this.processAlerts();
    
    // Set up recurring processing
    this.intervalId = setInterval(() => {
      this.processAlerts();
    }, intervalMinutes * 60 * 1000);
  }

  // Stop the scheduler
  stop() {
    if (!this.isRunning) {
      console.log("Alert scheduler is not running");
      return;
    }

    console.log("Stopping alert scheduler");
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Process all alerts
  async processAlerts() {
    try {
      console.log("Processing scheduled alerts...");
      const startTime = new Date();

      // Process all pending alerts
      await alertsService.processAllPendingAlerts();

      // Process marks-based alerts for recently updated marks
      await this.processRecentMarksAlerts();

      // Process attendance alerts for recently updated attendance
      await this.processRecentAttendanceAlerts();

      const endTime = new Date();
      const duration = endTime - startTime;
      
      console.log(`Alert processing completed in ${duration}ms`);

    } catch (error) {
      console.error("Error in scheduled alert processing:", error);
    }
  }

  // Process alerts for recently updated marks
  async processRecentMarksAlerts() {
    try {
      // Get marks updated in the last 2 hours
      const [recentMarks] = await db.promise().query(`
        SELECT lm.student_id, lm.course_id, lm.quiz1, lm.quiz2, lm.assignment1, lm.assignment2, lm.midterm_marks
        FROM lecturer_marks lm
        WHERE lm.updated_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
           OR lm.created_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
      `);

      for (const marks of recentMarks) {
        const { student_id, course_id, quiz1, quiz2, assignment1, assignment2, midterm_marks } = marks;

        // Generate alerts for each type of assessment
        if (quiz1 !== null) {
          await alertsService.generateQuizAlerts(student_id, course_id, 1, quiz1);
        }
        if (quiz2 !== null) {
          await alertsService.generateQuizAlerts(student_id, course_id, 2, quiz2);
        }
        if (assignment1 !== null) {
          await alertsService.generateAssignmentAlerts(student_id, course_id, 1, assignment1);
        }
        if (assignment2 !== null) {
          await alertsService.generateAssignmentAlerts(student_id, course_id, 2, assignment2);
        }
        if (midterm_marks !== null) {
          await alertsService.generateMidtermAlerts(student_id, course_id, midterm_marks);
        }
      }

      console.log(`Processed marks alerts for ${recentMarks.length} recent updates`);

    } catch (error) {
      console.error("Error processing recent marks alerts:", error);
    }
  }

  // Process alerts for recently updated attendance
  async processRecentAttendanceAlerts() {
    try {
      // Get attendance updated in the last 2 hours
      const [recentAttendance] = await db.promise().query(`
        SELECT ai.student_id, ai.course_id, ai.attendance
        FROM admin_inputs ai
        WHERE (ai.updated_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
           OR ai.created_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR))
           AND ai.attendance IS NOT NULL
      `);

      for (const attendance of recentAttendance) {
        const { student_id, course_id, attendance: attendancePercentage } = attendance;
        await alertsService.generateAttendanceAlerts(student_id, course_id, attendancePercentage);
      }

      console.log(`Processed attendance alerts for ${recentAttendance.length} recent updates`);

    } catch (error) {
      console.error("Error processing recent attendance alerts:", error);
    }
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId,
      lastProcessed: new Date()
    };
  }

  // Process alerts for a specific trigger event
  async processTriggeredAlerts(triggerType, data) {
    try {
      console.log(`Processing triggered alerts for: ${triggerType}`);

      switch (triggerType) {
        case 'marks_updated':
          await this.handleMarksUpdate(data);
          break;
        case 'attendance_updated':
          await this.handleAttendanceUpdate(data);
          break;
        case 'prediction_generated':
          await this.handlePredictionGenerated(data);
          break;
        default:
          console.log(`Unknown trigger type: ${triggerType}`);
      }

    } catch (error) {
      console.error(`Error processing triggered alerts for ${triggerType}:`, error);
    }
  }

  // Handle marks update trigger
  async handleMarksUpdate(data) {
    const { student_id, course_id, assessment_type, marks } = data;

    switch (assessment_type) {
      case 'quiz1':
        await alertsService.generateQuizAlerts(student_id, course_id, 1, marks);
        break;
      case 'quiz2':
        await alertsService.generateQuizAlerts(student_id, course_id, 2, marks);
        break;
      case 'assignment1':
        await alertsService.generateAssignmentAlerts(student_id, course_id, 1, marks);
        break;
      case 'assignment2':
        await alertsService.generateAssignmentAlerts(student_id, course_id, 2, marks);
        break;
      case 'midterm_marks':
        await alertsService.generateMidtermAlerts(student_id, course_id, marks);
        break;
    }
  }

  // Handle attendance update trigger
  async handleAttendanceUpdate(data) {
    const { student_id, course_id, attendance } = data;
    await alertsService.generateAttendanceAlerts(student_id, course_id, attendance);
  }

  // Handle prediction generated trigger
  async handlePredictionGenerated(data) {
    const { student_id, course_id, prediction } = data;
    await alertsService.generatePredictionAlerts(student_id, course_id, prediction);
  }
}

// Create a singleton instance
const alertScheduler = new AlertScheduler();

module.exports = alertScheduler;
