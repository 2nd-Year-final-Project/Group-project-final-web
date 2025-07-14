const db = require("../config/db");

// Alert severity and risk thresholds
const RISK_THRESHOLDS = {
  CRITICAL: 30,    // Below 30% - Critical risk
  HIGH: 45,        // 30-45% - High risk
  MEDIUM: 60,      // 45-60% - Medium risk
  LOW: 75          // 60-75% - Low risk (still concerning)
};

// Generate risk factors based on student performance
const generateRiskFactors = (marks, attendance, currentAverage) => {
  const factors = [];
  
  // Check quiz performance
  if ((marks.quiz1 !== null && marks.quiz1 < 50) || (marks.quiz2 !== null && marks.quiz2 < 50)) {
    factors.push("Poor quiz performance");
  }
  
  // Check assignment performance
  if ((marks.assignment1 !== null && marks.assignment1 < 50) || 
      (marks.assignment2 !== null && marks.assignment2 < 50)) {
    factors.push("Missing or poor assignment submissions");
  }
  
  // Check midterm performance
  if (marks.midterm_marks !== null && marks.midterm_marks < 50) {
    factors.push("Poor midterm exam performance");
  }
  
  // Check attendance
  if (attendance !== null && attendance < 75) {
    factors.push("Low attendance rate");
  }
  
  // Check overall performance trend
  if (currentAverage < 50) {
    factors.push("Overall academic performance below passing grade");
  }
  
  return factors.join("; ");
};

// Generate recommendations based on risk factors
const generateRecommendations = (riskFactors, severity) => {
  const recommendations = [];
  
  if (riskFactors.includes("quiz")) {
    recommendations.push("Focus on understanding core concepts through additional practice");
    recommendations.push("Review quiz materials and seek clarification on difficult topics");
  }
  
  if (riskFactors.includes("assignment")) {
    recommendations.push("Prioritize completing all assignments on time");
    recommendations.push("Seek help during office hours for assignment guidance");
  }
  
  if (riskFactors.includes("midterm")) {
    recommendations.push("Prepare intensively for upcoming exams");
    recommendations.push("Form study groups with classmates");
  }
  
  if (riskFactors.includes("attendance")) {
    recommendations.push("Improve class attendance to stay up-to-date with course material");
    recommendations.push("Connect with classmates to catch up on missed content");
  }
  
  // Add severity-specific recommendations
  if (severity === 'critical') {
    recommendations.push("Consider withdrawing from the course if improvement is not possible");
    recommendations.push("Meet with academic advisor immediately");
  } else if (severity === 'high') {
    recommendations.push("Schedule a meeting with your lecturer as soon as possible");
    recommendations.push("Consider additional tutoring or academic support services");
  }
  
  return recommendations.join("; ");
};

// Determine alert severity based on predicted grade
const determineAlertSeverity = (predictedGrade) => {
  if (predictedGrade < RISK_THRESHOLDS.CRITICAL) return 'critical';
  if (predictedGrade < RISK_THRESHOLDS.HIGH) return 'high';
  if (predictedGrade < RISK_THRESHOLDS.MEDIUM) return 'medium';
  return 'low';
};

// Check and create alerts for at-risk students
const checkAndCreateAlerts = async () => {
  try {
    console.log("Running alert check for at-risk students...");
    
    // Get all students with their current performance and predictions
    const studentPerformanceQuery = `
      SELECT DISTINCT
        se.student_id,
        se.course_id,
        lc.lecturer_id,
        u.full_name as student_name,
        u.email as student_email,
        c.course_name,
        c.course_code,
        lm.quiz1,
        lm.quiz2,
        lm.assignment1,
        lm.assignment2,
        lm.midterm_marks,
        ai.attendance,
        ROUND(
          (COALESCE(lm.quiz1, 0) + COALESCE(lm.quiz2, 0) + 
           COALESCE(lm.assignment1, 0) + COALESCE(lm.assignment2, 0) + 
           COALESCE(lm.midterm_marks, 0)) / 
          CASE 
            WHEN (lm.quiz1 IS NOT NULL) + (lm.quiz2 IS NOT NULL) + 
                 (lm.assignment1 IS NOT NULL) + (lm.assignment2 IS NOT NULL) + 
                 (lm.midterm_marks IS NOT NULL) = 0 
            THEN 1 
            ELSE (lm.quiz1 IS NOT NULL) + (lm.quiz2 IS NOT NULL) + 
                 (lm.assignment1 IS NOT NULL) + (lm.assignment2 IS NOT NULL) + 
                 (lm.midterm_marks IS NOT NULL) 
          END, 2
        ) as current_average
      FROM student_enrollments se
      JOIN users u ON se.student_id = u.id
      JOIN courses c ON se.course_id = c.id
      JOIN lecturer_courses lc ON c.id = lc.course_id
      LEFT JOIN lecturer_marks lm ON se.student_id = lm.student_id AND c.id = lm.course_id
      LEFT JOIN admin_inputs ai ON se.student_id = ai.student_id AND c.id = ai.course_id
      WHERE se.status = 'active'
      AND u.role = 'student'
    `;

    const [students] = await db.promise().query(studentPerformanceQuery);
    
    for (const student of students) {
      // Skip if no performance data yet
      if (student.current_average === 0) continue;
      
      // Try to get AI prediction for this student
      let predictedGrade = student.current_average; // Default to current average
      
      try {
        // Here you could call your prediction API to get AI-predicted grade
        // For now, we'll use current average as a proxy
        predictedGrade = student.current_average;
      } catch (predictionError) {
        console.log(`Could not get prediction for student ${student.student_id}, using current average`);
      }
      
      // Only create alerts for students at risk (below 75%)
      if (predictedGrade >= RISK_THRESHOLDS.LOW) continue;
      
      // Check if alert already exists for this student/course combination (recent alert)
      const [existingAlerts] = await db.promise().query(
        `SELECT id FROM alerts 
         WHERE student_id = ? AND course_id = ? 
         AND created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
         AND is_resolved = 0`,
        [student.student_id, student.course_id]
      );
      
      // Skip if recent alert already exists
      if (existingAlerts.length > 0) continue;
      
      // Generate alert data
      const severity = determineAlertSeverity(predictedGrade);
      const marks = {
        quiz1: student.quiz1,
        quiz2: student.quiz2,
        assignment1: student.assignment1,
        assignment2: student.assignment2,
        midterm_marks: student.midterm_marks
      };
      
      const riskFactors = generateRiskFactors(marks, student.attendance, student.current_average);
      const recommendations = generateRecommendations(riskFactors, severity);
      
      // Create alert
      const insertAlertQuery = `
        INSERT INTO alerts (
          student_id, course_id, lecturer_id, alert_type, severity,
          predicted_grade, current_average, risk_factors, recommendations,
          student_notified, lecturer_notified, admin_notified
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0)
      `;
      
      await db.promise().query(insertAlertQuery, [
        student.student_id,
        student.course_id,
        student.lecturer_id,
        'at_risk',
        severity,
        predictedGrade,
        student.current_average,
        riskFactors,
        recommendations
      ]);
      
      console.log(`Created ${severity} alert for student ${student.student_name} in ${student.course_name}`);
    }
    
    console.log("Alert check completed");
    return { success: true, message: "Alert check completed successfully" };
    
  } catch (error) {
    console.error("Error in alert check:", error);
    return { success: false, error: error.message };
  }
};

// Get alerts for a specific student
const getStudentAlerts = async (studentId) => {
  const query = `
    SELECT 
      a.*,
      c.course_name,
      c.course_code,
      u_lecturer.full_name as lecturer_name
    FROM alerts a
    JOIN courses c ON a.course_id = c.id
    JOIN users u_lecturer ON a.lecturer_id = u_lecturer.id
    WHERE a.student_id = ? AND a.is_resolved = 0
    ORDER BY a.severity DESC, a.created_at DESC
  `;
  
  const [alerts] = await db.promise().query(query, [studentId]);
  return alerts;
};

// Get alerts for a specific lecturer
const getLecturerAlerts = async (lecturerId) => {
  const query = `
    SELECT 
      a.*,
      c.course_name,
      c.course_code,
      u_student.full_name as student_name,
      u_student.email as student_email
    FROM alerts a
    JOIN courses c ON a.course_id = c.id
    JOIN users u_student ON a.student_id = u_student.id
    WHERE a.lecturer_id = ? AND a.is_resolved = 0
    ORDER BY a.severity DESC, a.created_at DESC
  `;
  
  const [alerts] = await db.promise().query(query, [lecturerId]);
  return alerts;
};

// Get all alerts for admin
const getAdminAlerts = async () => {
  const query = `
    SELECT 
      a.*,
      c.course_name,
      c.course_code,
      u_student.full_name as student_name,
      u_student.email as student_email,
      u_lecturer.full_name as lecturer_name
    FROM alerts a
    JOIN courses c ON a.course_id = c.id
    JOIN users u_student ON a.student_id = u_student.id
    JOIN users u_lecturer ON a.lecturer_id = u_lecturer.id
    WHERE a.is_resolved = 0
    ORDER BY a.severity DESC, a.created_at DESC
  `;
  
  const [alerts] = await db.promise().query(query);
  return alerts;
};

// Mark alert as read
const markAlertAsRead = async (alertId, userRole) => {
  const readField = userRole === 'student' ? 'is_read_by_student' : 
                   userRole === 'lecturer' ? 'is_read_by_lecturer' : 
                   'is_read_by_admin';
  
  const query = `UPDATE alerts SET ${readField} = 1 WHERE id = ?`;
  await db.promise().query(query, [alertId]);
};

// Mark alert as resolved
const markAlertAsResolved = async (alertId) => {
  const query = `UPDATE alerts SET is_resolved = 1, updated_at = NOW() WHERE id = ?`;
  await db.promise().query(query, [alertId]);
};

// Get alert statistics
const getAlertStatistics = async () => {
  const queries = [
    "SELECT COUNT(*) as count FROM alerts WHERE is_resolved = 0",
    "SELECT COUNT(*) as count FROM alerts WHERE severity = 'critical' AND is_resolved = 0",
    "SELECT COUNT(*) as count FROM alerts WHERE severity = 'high' AND is_resolved = 0",
    "SELECT COUNT(*) as count FROM alerts WHERE severity = 'medium' AND is_resolved = 0"
  ];

  const results = await Promise.all(queries.map(query => 
    db.promise().query(query).then(([rows]) => rows[0].count)
  ));

  return {
    totalActive: results[0],
    critical: results[1],
    high: results[2],
    medium: results[3]
  };
};

module.exports = {
  checkAndCreateAlerts,
  getStudentAlerts,
  getLecturerAlerts,
  getAdminAlerts,
  markAlertAsRead,
  markAlertAsResolved,
  getAlertStatistics,
  RISK_THRESHOLDS
};
