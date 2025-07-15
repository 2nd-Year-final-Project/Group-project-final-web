const alertsService = require('./services/alertsService');
const db = require('./config/db');

async function testRealAlerts() {
  console.log("🔍 Testing Real Alerts System with Actual Data...\n");
  
  try {
    // Get a sample student with real data
    const [students] = await db.promise().query(`
      SELECT DISTINCT lm.student_id, lm.course_id, u.full_name, c.course_name
      FROM lecturer_marks lm
      JOIN users u ON lm.student_id = u.id 
      JOIN courses c ON lm.course_id = c.id
      WHERE lm.quiz1 IS NOT NULL OR lm.assignment1 IS NOT NULL OR lm.midterm_marks IS NOT NULL
      LIMIT 1
    `);
    
    if (students.length === 0) {
      console.log("❌ No student data found for testing");
      return;
    }
    
    const student = students[0];
    console.log(`📊 Testing alerts for: ${student.full_name} in ${student.course_name}`);
    console.log(`Student ID: ${student.student_id}, Course ID: ${student.course_id}\n`);
    
    // Get the student's current marks
    const [marks] = await db.promise().query(
      "SELECT quiz1, quiz2, assignment1, assignment2, midterm_marks FROM lecturer_marks WHERE student_id = ? AND course_id = ?",
      [student.student_id, student.course_id]
    );
    
    if (marks.length > 0) {
      console.log("📋 Current marks data:");
      console.log("Quiz 1:", marks[0].quiz1);
      console.log("Quiz 2:", marks[0].quiz2);
      console.log("Assignment 1:", marks[0].assignment1);
      console.log("Assignment 2:", marks[0].assignment2);
      console.log("Midterm:", marks[0].midterm_marks);
      console.log("");
    }
    
    // Get attendance data
    const [attendance] = await db.promise().query(
      "SELECT attendance FROM admin_inputs WHERE student_id = ? AND course_id = ?",
      [student.student_id, student.course_id]
    );
    
    if (attendance.length > 0) {
      console.log("📅 Attendance:", attendance[0].attendance + "%\n");
    }
    
    // Clear existing alerts for clean test
    await db.promise().query(
      "DELETE FROM alerts WHERE student_id = ? AND course_id = ?",
      [student.student_id, student.course_id]
    );
    
    console.log("🚀 Generating real alerts based on actual data...\n");
    
    // Process all alert types for this student
    await alertsService.processStudentAlerts(student.student_id, student.course_id);
    
    // Also try to generate prediction alerts (this will call the ML model)
    try {
      console.log("🔮 Attempting to generate prediction alerts...");
      await alertsService.triggerPredictionAlerts(student.student_id, student.course_id);
    } catch (predError) {
      console.log("⚠️ Prediction alerts skipped (ML model may not be running):", predError.message);
    }
    
    // Check what alerts were generated
    const [generatedAlerts] = await db.promise().query(
      `SELECT alert_type, severity, title, message, predicted_marks, created_at 
       FROM alerts 
       WHERE student_id = ? AND course_id = ? 
       ORDER BY created_at DESC`,
      [student.student_id, student.course_id]
    );
    
    console.log(`\n✅ Generated ${generatedAlerts.length} alerts:\n`);
    
    generatedAlerts.forEach((alert, index) => {
      console.log(`${index + 1}. 📢 ${alert.severity.toUpperCase()} - ${alert.alert_type}`);
      console.log(`   Title: ${alert.title}`);
      console.log(`   Message: ${alert.message.substring(0, 100)}...`);
      if (alert.predicted_marks) {
        console.log(`   Predicted Marks: ${alert.predicted_marks}`);
      }
      console.log(`   Created: ${alert.created_at}`);
      console.log("");
    });
    
    // Test lecturer alerts too
    const [lecturerAlerts] = await db.promise().query(
      `SELECT alert_type, severity, title, message, created_at 
       FROM lecturer_alerts 
       WHERE course_id = ? 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [student.course_id]
    );
    
    if (lecturerAlerts.length > 0) {
      console.log(`📚 Recent lecturer alerts (${lecturerAlerts.length}):`);
      lecturerAlerts.forEach((alert, index) => {
        console.log(`${index + 1}. ${alert.severity.toUpperCase()} - ${alert.alert_type}: ${alert.title}`);
      });
      console.log("");
    }
    
    console.log("✅ Real alerts test completed successfully!");
    
  } catch (error) {
    console.error("❌ Error testing real alerts:", error);
  } finally {
    db.end();
  }
}

// Run the test
testRealAlerts();
