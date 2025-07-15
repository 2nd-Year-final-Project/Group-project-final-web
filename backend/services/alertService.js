const db = require("../config/db");

class AlertService {
  // Generate performance-based message based on predicted grade and percentage
  static generatePerformanceMessage(predictedPercentage, predictedGrade, courseName, studentName = null) {
    const prefix = studentName ? `${studentName} in ${courseName}` : `your performance in ${courseName}`;
    
    if (predictedPercentage >= 85) {
      return {
        type: 'excellent',
        severity: 'low',
        title: 'Outstanding Performance Predicted!',
        message: `Excellent work! ${prefix} is predicted to achieve an ${predictedGrade} grade (${predictedPercentage}%). You're demonstrating exceptional understanding and are on track for outstanding results. Keep up the excellent work and consider helping peers who might be struggling.`
      };
    } else if (predictedPercentage >= 70) {
      return {
        type: 'performance',
        severity: 'low',
        title: 'Strong Performance on Track',
        message: `Great progress! ${prefix} is predicted to achieve an ${predictedGrade} grade (${predictedPercentage}%). You're performing very well and should maintain your current study approach. Consider challenging yourself with additional advanced topics.`
      };
    } else if (predictedPercentage >= 65) {
      return {
        type: 'performance',
        severity: 'low',
        title: 'Good Performance with Potential',
        message: `Good work! ${prefix} is predicted to achieve an ${predictedGrade} grade (${predictedPercentage}%). You're on a positive track. Focus on strengthening core concepts to push your performance into the very good range.`
      };
    } else if (predictedPercentage >= 60) {
      return {
        type: 'improvement',
        severity: 'medium',
        title: 'Satisfactory - Room for Improvement',
        message: `${prefix} is predicted to achieve a ${predictedGrade} grade (${predictedPercentage}%). While you're meeting basic requirements, there's good potential for improvement. Consider increasing study time and seeking clarification on challenging topics.`
      };
    } else if (predictedPercentage >= 55) {
      return {
        type: 'warning',
        severity: 'medium',
        title: 'Below Average - Action Needed',
        message: `${prefix} is predicted to achieve a ${predictedGrade} grade (${predictedPercentage}%). Your performance is below average and requires attention. Schedule time with your lecturer, join study groups, and increase your weekly study hours to improve your understanding.`
      };
    } else if (predictedPercentage >= 50) {
      return {
        type: 'warning',
        severity: 'high',
        title: 'Concerning Performance - Immediate Action Required',
        message: `${prefix} is predicted to achieve a ${predictedGrade} grade (${predictedPercentage}%). This performance level is concerning and needs immediate improvement. Please attend office hours, seek tutoring support, and consider reducing other commitments to focus on your studies.`
      };
    } else if (predictedPercentage >= 40) {
      return {
        type: 'warning',
        severity: 'high',
        title: 'Poor Performance - Urgent Intervention Needed',
        message: `${prefix} is predicted to achieve a ${predictedGrade} grade (${predictedPercentage}%). This performance is significantly below expectations. Urgent academic intervention is needed - please contact your lecturer immediately to discuss support options and create an improvement plan.`
      };
    } else {
      return {
        type: 'warning',
        severity: 'critical',
        title: 'Critical Performance Alert - Immediate Support Required',
        message: `${prefix} is predicted to achieve a ${predictedGrade} grade (${predictedPercentage}%). This represents a critical academic situation requiring immediate comprehensive support. Please contact your academic advisor and lecturer urgently to discuss intensive intervention strategies.`
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

  // Check if alert should be generated (avoid duplicates within 24 hours for same grade range)
  static async shouldGenerateAlert(studentId, courseId, alertType, predictedGrade) {
    try {
      const [existing] = await db.promise().query(
        `SELECT last_generated, predicted_grade 
         FROM alert_generation_log 
         WHERE student_id = ? AND course_id = ? AND alert_type = ?
         ORDER BY last_generated DESC LIMIT 1`,
        [studentId, courseId, alertType]
      );

      if (existing.length === 0) {
        return true; // No previous alert
      }

      const lastGenerated = new Date(existing[0].last_generated);
      const now = new Date();
      const hoursDiff = (now - lastGenerated) / (1000 * 60 * 60);

      // Only generate new alert if:
      // 1. More than 24 hours have passed, OR
      // 2. Grade has changed significantly (more than 5 points)
      const gradeDiff = Math.abs(predictedGrade - (existing[0].predicted_grade || 0));
      
      return hoursDiff >= 24 || gradeDiff >= 5;
    } catch (error) {
      console.error('Error checking alert generation:', error);
      return true; // Generate alert if check fails
    }
  }

  // Log alert generation
  static async logAlertGeneration(studentId, courseId, alertType, predictedGrade) {
    try {
      await db.promise().query(
        `INSERT INTO alert_generation_log (student_id, course_id, alert_type, predicted_grade)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         predicted_grade = VALUES(predicted_grade),
         last_generated = CURRENT_TIMESTAMP`,
        [studentId, courseId, alertType, predictedGrade]
      );
    } catch (error) {
      console.error('Error logging alert generation:', error);
    }
  }

  // Generate alert for student
  static async generateStudentAlert(studentId, courseId, predictedPercentage, courseName) {
    try {
      const predictedGrade = this.getGradeFromPercentage(predictedPercentage);
      const alertData = this.generatePerformanceMessage(predictedPercentage, predictedGrade, courseName);
      
      const shouldGenerate = await this.shouldGenerateAlert(studentId, courseId, alertData.type, predictedPercentage);
      
      if (!shouldGenerate) {
        return null; // Skip duplicate alert
      }

      await db.promise().query(
        `INSERT INTO alerts (student_id, course_id, recipient_type, recipient_id, alert_type, severity, title, message, predicted_grade, predicted_percentage)
         VALUES (?, ?, 'student', ?, ?, ?, ?, ?, ?, ?)`,
        [studentId, courseId, studentId, alertData.type, alertData.severity, alertData.title, alertData.message, predictedPercentage, predictedPercentage]
      );

      await this.logAlertGeneration(studentId, courseId, alertData.type, predictedPercentage);
      
      return {
        type: alertData.type,
        severity: alertData.severity,
        title: alertData.title,
        message: alertData.message
      };
    } catch (error) {
      console.error('Error generating student alert:', error);
      throw error;
    }
  }

  // Generate alert for lecturer
  static async generateLecturerAlert(studentId, courseId, predictedPercentage, courseName, studentName, lecturerId) {
    try {
      const predictedGrade = this.getGradeFromPercentage(predictedPercentage);
      const alertData = this.generatePerformanceMessage(predictedPercentage, predictedGrade, courseName, studentName);
      
      // For lecturers, focus on concerning performance (below 65%)
      if (predictedPercentage >= 65) {
        return null; // Don't alert lecturers about good performance
      }

      const shouldGenerate = await this.shouldGenerateAlert(studentId, courseId, `lecturer_${alertData.type}`, predictedPercentage);
      
      if (!shouldGenerate) {
        return null;
      }

      // Customize message for lecturer
      let lecturerMessage = alertData.message.replace('you', studentName).replace('your', `${studentName}'s`);
      if (predictedPercentage < 60) {
        lecturerMessage += ` Please consider reaching out to provide additional support and guidance.`;
      }

      await db.promise().query(
        `INSERT INTO alerts (student_id, course_id, recipient_type, recipient_id, alert_type, severity, title, message, predicted_grade, predicted_percentage)
         VALUES (?, ?, 'lecturer', ?, ?, ?, ?, ?, ?, ?)`,
        [studentId, courseId, lecturerId, alertData.type, alertData.severity, `Student Alert: ${alertData.title}`, lecturerMessage, predictedPercentage, predictedPercentage]
      );

      await this.logAlertGeneration(studentId, courseId, `lecturer_${alertData.type}`, predictedPercentage);
      
      return {
        type: alertData.type,
        severity: alertData.severity,
        title: `Student Alert: ${alertData.title}`,
        message: lecturerMessage
      };
    } catch (error) {
      console.error('Error generating lecturer alert:', error);
      throw error;
    }
  }

  // Generate alerts based on prediction results
  static async generateAlertsFromPrediction(studentId, courseId, predictedPercentage) {
    try {
      // Get course and student information
      const [courseInfo] = await db.promise().query(
        'SELECT course_name FROM courses WHERE id = ?',
        [courseId]
      );
      
      const [studentInfo] = await db.promise().query(
        'SELECT full_name FROM users WHERE id = ?',
        [studentId]
      );

      const [lecturerInfo] = await db.promise().query(
        `SELECT u.id, u.full_name 
         FROM lecturer_courses lc 
         JOIN users u ON lc.lecturer_id = u.id 
         WHERE lc.course_id = ?`,
        [courseId]
      );

      if (courseInfo.length === 0 || studentInfo.length === 0) {
        throw new Error('Course or student not found');
      }

      const courseName = courseInfo[0].course_name;
      const studentName = studentInfo[0].full_name;
      const alerts = [];

      // Generate student alert
      const studentAlert = await this.generateStudentAlert(studentId, courseId, predictedPercentage, courseName);
      if (studentAlert) {
        alerts.push({ recipient: 'student', ...studentAlert });
      }

      // Generate lecturer alert if lecturer exists
      if (lecturerInfo.length > 0) {
        const lecturerId = lecturerInfo[0].id;
        const lecturerAlert = await this.generateLecturerAlert(studentId, courseId, predictedPercentage, courseName, studentName, lecturerId);
        if (lecturerAlert) {
          alerts.push({ recipient: 'lecturer', ...lecturerAlert });
        }
      }

      return alerts;
    } catch (error) {
      console.error('Error generating alerts from prediction:', error);
      throw error;
    }
  }

  // Get alerts for a user
  static async getAlertsForUser(userId, userType, limit = 50) {
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
      console.error('Error fetching user alerts:', error);
      throw error;
    }
  }

  // Mark alert as read
  static async markAlertAsRead(alertId, userId) {
    try {
      await db.promise().query(
        'UPDATE alerts SET is_read = TRUE WHERE id = ? AND recipient_id = ?',
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
        'UPDATE alerts SET is_dismissed = TRUE WHERE id = ? AND recipient_id = ?',
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
        'SELECT COUNT(*) as count FROM alerts WHERE recipient_id = ? AND recipient_type = ? AND is_read = FALSE AND is_dismissed = FALSE',
        [userId, userType]
      );
      
      return result[0].count;
    } catch (error) {
      console.error('Error getting unread alert count:', error);
      return 0;
    }
  }

  // Batch generate alerts for all students in a course when marks are updated
  static async generateCourseAlerts(courseId) {
    try {
      console.log(`📚 Generating alerts for all students in course ${courseId}`);
      
      // Get all active enrollments for the course
      const [enrollments] = await db.promise().query(
        `SELECT se.student_id, c.course_name, u.full_name as student_name
         FROM student_enrollments se
         JOIN courses c ON se.course_id = c.id
         JOIN users u ON se.student_id = u.id
         WHERE se.course_id = ? AND se.status = 'active'`,
        [courseId]
      );

      if (enrollments.length === 0) {
        console.log(`No active enrollments found for course ${courseId}`);
        return [];
      }

      const allAlerts = [];
      
      for (const enrollment of enrollments) {
        try {
          // Try to get prediction for this student-course combination
          const axios = require("axios");
          const response = await axios.get(`http://localhost:5000/api/prediction/${enrollment.student_id}/${courseId}`);
          
          if (response.data && response.data.predicted_grade) {
            const predictedPercentage = parseFloat(response.data.predicted_grade);
            const alerts = await this.generateAlertsFromPrediction(enrollment.student_id, courseId, predictedPercentage);
            allAlerts.push(...alerts);
            console.log(`✅ Generated ${alerts.length} alerts for ${enrollment.student_name}`);
          }
        } catch (error) {
          console.log(`⚠️ Could not generate alerts for ${enrollment.student_name}: ${error.message}`);
          // Continue with other students even if one fails
        }
      }

      console.log(`🎉 Batch alert generation completed: ${allAlerts.length} total alerts generated`);
      return allAlerts;
      
    } catch (error) {
      console.error('Error in batch alert generation:', error);
      throw error;
    }
  }

  // Generate alerts for a specific student across all their courses
  static async generateStudentAlerts(studentId) {
    try {
      console.log(`👨‍🎓 Generating alerts for student ${studentId} across all courses`);
      
      // Get all active enrollments for the student
      const [enrollments] = await db.promise().query(
        `SELECT se.course_id, c.course_name
         FROM student_enrollments se
         JOIN courses c ON se.course_id = c.id
         WHERE se.student_id = ? AND se.status = 'active'`,
        [studentId]
      );

      if (enrollments.length === 0) {
        console.log(`No active enrollments found for student ${studentId}`);
        return [];
      }

      const allAlerts = [];
      
      for (const enrollment of enrollments) {
        try {
          // Try to get prediction for this student-course combination
          const axios = require("axios");
          const response = await axios.get(`http://localhost:5000/api/prediction/${studentId}/${enrollment.course_id}`);
          
          if (response.data && response.data.predicted_grade) {
            const predictedPercentage = parseFloat(response.data.predicted_grade);
            const alerts = await this.generateAlertsFromPrediction(studentId, enrollment.course_id, predictedPercentage);
            allAlerts.push(...alerts);
            console.log(`✅ Generated ${alerts.length} alerts for course ${enrollment.course_name}`);
          }
        } catch (error) {
          console.log(`⚠️ Could not generate alerts for course ${enrollment.course_name}: ${error.message}`);
          // Continue with other courses even if one fails
        }
      }

      console.log(`🎉 Student alert generation completed: ${allAlerts.length} total alerts generated`);
      return allAlerts;
      
    } catch (error) {
      console.error('Error in student alert generation:', error);
      throw error;
    }
  }
}

module.exports = AlertService;
