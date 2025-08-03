const db = require("../config/db");

class RealTimeAlertService {
  
  // Clear all existing alerts for a student-course combination
  static async clearExistingAlerts(studentId, courseId) {
    try {
      await db.promise().query(
        `DELETE FROM alerts WHERE student_id = ? AND course_id = ?`,
        [studentId, courseId]
      );
      console.log(`🧹 Cleared existing alerts for student ${studentId}, course ${courseId}`);
    } catch (error) {
      console.error('Error clearing existing alerts:', error);
    }
  }

  // Clear all alerts for a student
  static async clearStudentAlerts(studentId) {
    try {
      await db.promise().query(
        `DELETE FROM alerts WHERE student_id = ?`,
        [studentId]
      );
      console.log(`🧹 Cleared all alerts for student ${studentId}`);
    } catch (error) {
      console.error('Error clearing student alerts:', error);
    }
  }

  // Generate performance-based message
  static generatePerformanceMessage(predictedPercentage, predictedGrade, courseName) {
    const performanceText = `Your performance in ${courseName}`;
    
    if (predictedPercentage >= 85) {
      return {
        type: 'excellent',
        severity: 'low',
        title: 'Outstanding Performance!',
        message: `${performanceText} is predicted to achieve an ${predictedGrade} grade (${predictedPercentage}%). You're demonstrating exceptional understanding and are on track for outstanding results. Keep up the excellent work!`
      };
    } else if (predictedPercentage >= 70) {
      return {
        type: 'performance',
        severity: 'low',
        title: 'Strong Performance',
        message: `${performanceText} is predicted to achieve an ${predictedGrade} grade (${predictedPercentage}%). You're performing very well and should maintain your current study approach.`
      };
    } else if (predictedPercentage >= 60) {
      return {
        type: 'improvement',
        severity: 'medium',
        title: 'Room for Improvement',
        message: `${performanceText} is predicted to achieve a ${predictedGrade} grade (${predictedPercentage}%). There's potential for improvement. Consider increasing study time and seeking clarification on challenging topics.`
      };
    } else if (predictedPercentage >= 50) {
      return {
        type: 'warning',
        severity: 'high',
        title: 'At Risk - Action Needed',
        message: `${performanceText} is predicted to achieve a ${predictedGrade} grade (${predictedPercentage}%). Your performance needs attention. Schedule time with your lecturer and increase your study efforts.`
      };
    } else {
      return {
        type: 'warning',
        severity: 'critical',
        title: 'Critical - Immediate Support Required',
        message: `${performanceText} is predicted to achieve a ${predictedGrade} grade (${predictedPercentage}%). This requires immediate academic intervention. Please contact your lecturer and academic advisor urgently.`
      };
    }
  }

  // Generate lecturer alert message
  static generateLecturerMessage(studentName, courseName, predictedPercentage, predictedGrade) {
    const performanceText = `${studentName} in ${courseName}`;
    
    if (predictedPercentage >= 50) {
      return {
        type: 'warning',
        severity: 'medium',
        title: 'Student Needs Support',
        message: `${performanceText} is predicted to achieve a ${predictedGrade} grade (${predictedPercentage}%). Consider reaching out to provide additional support and guidance.`
      };
    } else {
      return {
        type: 'warning',
        severity: 'critical',
        title: 'Student At Critical Risk',
        message: `${performanceText} is predicted to achieve a ${predictedGrade} grade (${predictedPercentage}%). Immediate intervention is required. Please contact this student urgently to discuss support options.`
      };
    }
  }

  // Convert percentage to letter grade
  static getGradeFromPercentage(percentage) {
    if (percentage >= 85) return "A+";
    if (percentage >= 70) return "A";
    if (percentage >= 65) return "A-";
    if (percentage >= 60) return "B+";
    if (percentage >= 55) return "B";
    if (percentage >= 50) return "B-";
    if (percentage >= 45) return "C+";
    if (percentage >= 40) return "C";
    if (percentage >= 35) return "C-";
    if (percentage >= 30) return "D+";
    if (percentage >= 25) return "D";
    return "E";
  }

  // Generate real-time alert for student based on prediction
  static async generateStudentAlert(studentId, courseId, predictedPercentage) {
    try {
      // First clear any existing alerts for this student-course combination
      await this.clearExistingAlerts(studentId, courseId);

      // Get course information
      const [courseInfo] = await db.promise().query(
        'SELECT course_name, course_code FROM courses WHERE id = ?',
        [courseId]
      );

      if (courseInfo.length === 0) {
        throw new Error('Course not found');
      }

      const courseName = courseInfo[0].course_name;
      const predictedGrade = this.getGradeFromPercentage(predictedPercentage);
      const alertData = this.generatePerformanceMessage(predictedPercentage, predictedGrade, courseName);

      // Insert new real-time alert
      await db.promise().query(
        `INSERT INTO alerts (student_id, course_id, recipient_type, recipient_id, alert_type, severity, title, message, predicted_grade, predicted_percentage, created_at, updated_at)
         VALUES (?, ?, 'student', ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [studentId, courseId, studentId, alertData.type, alertData.severity, alertData.title, alertData.message, predictedPercentage, predictedPercentage]
      );

      console.log(`✅ Generated real-time student alert for course ${courseName}: ${alertData.title}`);
      return alertData;
    } catch (error) {
      console.error('Error generating student alert:', error);
      throw error;
    }
  }

  // Generate real-time alert for lecturer (only for at-risk students)
  static async generateLecturerAlert(studentId, courseId, predictedPercentage) {
    try {
      // Only alert lecturers for at-risk students (below 65%)
      if (predictedPercentage >= 50) {
        return null;
      }

      // Get course and lecturer information
      const [courseInfo] = await db.promise().query(
        `SELECT c.course_name, c.course_code, lc.lecturer_id 
         FROM courses c 
         LEFT JOIN lecturer_courses lc ON c.id = lc.course_id 
         WHERE c.id = ?`,
        [courseId]
      );

      if (courseInfo.length === 0 || !courseInfo[0].lecturer_id) {
        return null; // No course or lecturer found
      }

      // Get student information
      const [studentInfo] = await db.promise().query(
        'SELECT full_name FROM users WHERE id = ?',
        [studentId]
      );

      if (studentInfo.length === 0) {
        return null;
      }

      const courseName = courseInfo[0].course_name;
      const lecturerId = courseInfo[0].lecturer_id;
      const studentName = studentInfo[0].full_name;
      const predictedGrade = this.getGradeFromPercentage(predictedPercentage);
      
      // Clear existing lecturer alerts for this student-course combination
      await db.promise().query(
        `DELETE FROM alerts WHERE student_id = ? AND course_id = ? AND recipient_type = 'lecturer'`,
        [studentId, courseId]
      );

      const alertData = this.generateLecturerMessage(studentName, courseName, predictedPercentage, predictedGrade);

      // Insert new real-time lecturer alert
      await db.promise().query(
        `INSERT INTO alerts (student_id, course_id, recipient_type, recipient_id, alert_type, severity, title, message, predicted_grade, predicted_percentage, created_at, updated_at)
         VALUES (?, ?, 'lecturer', ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [studentId, courseId, lecturerId, alertData.type, alertData.severity, alertData.title, alertData.message, predictedPercentage, predictedPercentage]
      );

      console.log(`🚨 Generated real-time lecturer alert for ${studentName} in ${courseName}: ${alertData.title}`);
      return alertData;
    } catch (error) {
      console.error('Error generating lecturer alert:', error);
      throw error;
    }
  }

  // Main function to generate real-time alerts based on prediction
  static async generateRealTimeAlerts(studentId, courseId, predictedPercentage) {
    try {
      console.log(`🔄 Generating real-time alerts for student ${studentId}, course ${courseId}, prediction: ${predictedPercentage}%`);
      
      const alerts = [];

      // Generate student alert (always)
      const studentAlert = await this.generateStudentAlert(studentId, courseId, predictedPercentage);
      if (studentAlert) {
        alerts.push({ recipient: 'student', ...studentAlert });
      }

      // Generate lecturer alert (only for at-risk students)
      const lecturerAlert = await this.generateLecturerAlert(studentId, courseId, predictedPercentage);
      if (lecturerAlert) {
        alerts.push({ recipient: 'lecturer', ...lecturerAlert });
      }

      console.log(`🎉 Generated ${alerts.length} real-time alerts`);
      return alerts;
    } catch (error) {
      console.error('Error generating real-time alerts:', error);
      throw error;
    }
  }

  // Get current alerts for a user (student or lecturer)
  static async getCurrentAlerts(userId, userType, limit = 20) {
    try {
      const [alerts] = await db.promise().query(
        `SELECT a.*, c.course_name, c.course_code, u.full_name as student_name
         FROM alerts a
         JOIN courses c ON a.course_id = c.id
         JOIN users u ON a.student_id = u.id
         WHERE a.recipient_id = ? AND a.recipient_type = ? AND a.is_dismissed = FALSE
         ORDER BY a.created_at DESC
         LIMIT ?`,
        [userId, userType, limit]
      );

      return alerts;
    } catch (error) {
      console.error('Error fetching current alerts:', error);
      throw error;
    }
  }

  // Get alerts for student dashboard (one per course, latest only)
  static async getStudentDashboardAlerts(studentId) {
    try {
      const [alerts] = await db.promise().query(
        `SELECT a.*, c.course_name, c.course_code
         FROM alerts a
         JOIN courses c ON a.course_id = c.id
         WHERE a.student_id = ? AND a.recipient_type = 'student' AND a.is_dismissed = FALSE
         ORDER BY a.course_id, a.created_at DESC`,
        [studentId]
      );

      // Get only the latest alert per course
      const latestAlerts = [];
      const seenCourses = new Set();
      
      for (const alert of alerts) {
        if (!seenCourses.has(alert.course_id)) {
          latestAlerts.push(alert);
          seenCourses.add(alert.course_id);
        }
      }

      return latestAlerts;
    } catch (error) {
      console.error('Error fetching student dashboard alerts:', error);
      throw error;
    }
  }

  // Get at-risk students for lecturer dashboard, grouped by course
  static async getAtRiskStudents(lecturerId) {
    try {
      const [alerts] = await db.promise().query(
        `SELECT a.*, c.course_name, c.course_code, u.full_name as student_name
         FROM alerts a
         JOIN courses c ON a.course_id = c.id
         JOIN users u ON a.student_id = u.id
         WHERE a.recipient_id = ? AND a.recipient_type = 'lecturer' AND a.is_dismissed = FALSE
         ORDER BY c.course_name, a.predicted_percentage ASC, a.created_at DESC`,
        [lecturerId]
      );

      // Group alerts by course
      const groupedByCourse = {};
      alerts.forEach(alert => {
        const courseKey = `${alert.course_code} - ${alert.course_name}`;
        if (!groupedByCourse[courseKey]) {
          groupedByCourse[courseKey] = {
            course_id: alert.course_id,
            course_name: alert.course_name,
            course_code: alert.course_code,
            students: []
          };
        }
        groupedByCourse[courseKey].students.push(alert);
      });

      // Convert to array format
      const courseGroups = Object.values(groupedByCourse);
      
      return { 
        totalAtRisk: alerts.length,
        courseGroups: courseGroups,
        allAlerts: alerts // Keep for backward compatibility
      };
    } catch (error) {
      console.error('Error fetching at-risk students:', error);
      throw error;
    }
  }

  // Get at-risk students for a specific course
  static async getCourseAtRiskStudents(lecturerId, courseId) {
    try {
      const [alerts] = await db.promise().query(
        `SELECT a.*, c.course_name, c.course_code, u.full_name as student_name, u.email as student_email
         FROM alerts a
         JOIN courses c ON a.course_id = c.id
         JOIN users u ON a.student_id = u.id
         WHERE a.recipient_id = ? AND a.recipient_type = 'lecturer' AND a.course_id = ? AND a.is_dismissed = FALSE
         ORDER BY a.predicted_percentage ASC, a.created_at DESC`,
        [lecturerId, courseId]
      );

      return alerts;
    } catch (error) {
      console.error('Error fetching course at-risk students:', error);
      throw error;
    }
  }

  // Mark alert as read
  static async markAlertAsRead(alertId, userId) {
    try {
      await db.promise().query(
        `UPDATE alerts SET is_read = TRUE WHERE id = ? AND recipient_id = ?`,
        [alertId, userId]
      );
    } catch (error) {
      console.error('Error marking alert as read:', error);
      throw error;
    }
  }

  // Dismiss alert
  static async dismissAlert(alertId, userId) {
    try {
      await db.promise().query(
        `UPDATE alerts SET is_dismissed = TRUE WHERE id = ? AND recipient_id = ?`,
        [alertId, userId]
      );
    } catch (error) {
      console.error('Error dismissing alert:', error);
      throw error;
    }
  }

  // Get unread alert count
  static async getUnreadAlertCount(userId, userType) {
    try {
      const [result] = await db.promise().query(
        `SELECT COUNT(*) as count FROM alerts 
         WHERE recipient_id = ? AND recipient_type = ? AND is_read = FALSE AND is_dismissed = FALSE`,
        [userId, userType]
      );
      
      return result[0].count;
    } catch (error) {
      console.error('Error getting unread alert count:', error);
      return 0;
    }
  }

  // Clear all existing alerts (for system maintenance)
  static async clearAllAlerts() {
    try {
      await db.promise().query(`DELETE FROM alerts`);
      console.log('🧹 Cleared all alerts from database');
    } catch (error) {
      console.error('Error clearing all alerts:', error);
      throw error;
    }
  }
}

module.exports = RealTimeAlertService;
