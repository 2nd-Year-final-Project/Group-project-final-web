const alertsService = require('./services/alertsService');
const db = require('./config/db');

async function demoRealAlerts() {
  console.log("🚀 Real-Time Alerts System Demo\n");
  
  try {
    // Find a student with actual marks data
    const [students] = await db.promise().query(`
      SELECT lm.student_id, lm.course_id, u.full_name, c.course_name,
             lm.quiz1, lm.assignment1, lm.midterm_marks
      FROM lecturer_marks lm
      JOIN users u ON lm.student_id = u.id 
      JOIN courses c ON lm.course_id = c.id
      WHERE lm.quiz1 IS NOT NULL
      LIMIT 1
    `);
    
    if (students.length === 0) {
      console.log("❌ No student marks data found");
      return;
    }
    
    const student = students[0];
    console.log(`👤 Student: ${student.full_name}`);
    console.log(`📚 Course: ${student.course_name}`);
    console.log(`📊 Quiz 1 Score: ${student.quiz1}%`);
    console.log(`📝 Assignment 1: ${student.assignment1 || 'Not graded'}%`);
    console.log(`📋 Midterm: ${student.midterm_marks || 'Not taken'}%\n`);
    
    // Clear any existing alerts for clean demo
    await db.promise().query(
      "DELETE FROM alerts WHERE student_id = ? AND course_id = ?",
      [student.student_id, student.course_id]
    );
    
    console.log("⚡ Generating real alerts based on actual performance...\n");
    
    // Generate quiz alert based on real score
    await alertsService.generateQuizAlerts(student.student_id, student.course_id, 1, student.quiz1);
    
    // Generate assignment alert if available
    if (student.assignment1 !== null) {
      await alertsService.generateAssignmentAlerts(student.student_id, student.course_id, 1, student.assignment1);
    }
    
    // Generate midterm alert if available
    if (student.midterm_marks !== null) {
      await alertsService.generateMidtermAlerts(student.student_id, student.course_id, student.midterm_marks);
    }
    
    // Check attendance and generate alert
    const [attendance] = await db.promise().query(
      "SELECT attendance FROM admin_inputs WHERE student_id = ? AND course_id = ?",
      [student.student_id, student.course_id]
    );
    
    if (attendance.length > 0 && attendance[0].attendance !== null) {
      console.log(`📅 Attendance: ${attendance[0].attendance}%`);
      await alertsService.generateAttendanceAlerts(student.student_id, student.course_id, attendance[0].attendance);
    }
    
    // Fetch generated alerts
    const [alerts] = await db.promise().query(
      `SELECT alert_type, severity, title, message, created_at 
       FROM alerts 
       WHERE student_id = ? AND course_id = ? 
       ORDER BY created_at DESC`,
      [student.student_id, student.course_id]
    );
    
    console.log(`\n🎯 Generated ${alerts.length} real alerts:\n`);
    
    alerts.forEach((alert, index) => {
      const severityIcon = {
        'critical': '🚨',
        'high': '⚠️',
        'medium': '📊',
        'low': '🏆'
      };
      
      console.log(`${severityIcon[alert.severity]} ${alert.title}`);
      console.log(`   Type: ${alert.alert_type}`);
      console.log(`   Severity: ${alert.severity.toUpperCase()}`);
      console.log(`   Message: ${alert.message.substring(0, 80)}...`);
      console.log(`   Time: ${alert.created_at}\n`);
    });
    
    console.log("✅ Real alerts demo completed! These alerts are based on actual student performance data, not dummy data.\n");
    
    // Show what triggers each alert type
    console.log("📖 Alert Thresholds Guide:");
    console.log("🚨 Critical: Quiz/Assignment < 40%, Attendance < 50%, Predicted Grade F");
    console.log("⚠️ High: Quiz/Assignment < 55%, Attendance < 65%, Predicted Grade D");
    console.log("📊 Medium: Quiz/Assignment < 70%, Attendance < 75%, Predicted Grade C");
    console.log("🏆 Low: Quiz/Assignment >= 85%, Attendance >= 95%, Predicted Grade A");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    db.end();
  }
}

demoRealAlerts();
