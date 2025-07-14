const db = require("../config/db");
const { sendAlertEmail } = require("../utils/emailService");

class AlertsService {
  
  // Generate alerts based on prediction results
  async generatePredictionAlerts(studentId, courseId, predictionData) {
    try {
      const { predicted_grade, predicted_marks, confidence } = predictionData;
      
      // Get student and course info
      const [studentInfo] = await db.promise().query(
        "SELECT full_name, email FROM users WHERE id = ?", [studentId]
      );
      const [courseInfo] = await db.promise().query(
        "SELECT course_name, course_code FROM courses WHERE id = ?", [courseId]
      );
      
      if (!studentInfo.length || !courseInfo.length) {
        throw new Error("Student or course not found");
      }
      
      const student = studentInfo[0];
      const course = courseInfo[0];
      
      // Determine alert type and severity based on predicted marks
      let alertType, severity, title, message;
      
      if (predicted_marks < 40) {
        alertType = 'at_risk';
        severity = 'critical';
        title = `🚨 Critical Alert: You're at risk of failing ${course.course_name}`;
        message = `Your predicted grade is ${predicted_grade} (${predicted_marks}%). Immediate action is required to improve your performance. Please contact your lecturer or academic advisor for support.`;
      } else if (predicted_marks < 55) {
        alertType = 'at_risk';
        severity = 'high';
        title = `⚠️ Performance Alert: Poor performance predicted in ${course.course_name}`;
        message = `Your predicted grade is ${predicted_grade} (${predicted_marks}%). You need to improve your study habits and seek help to achieve better results.`;
      } else if (predicted_marks < 70) {
        alertType = 'average';
        severity = 'medium';
        title = `📊 Performance Update: Average performance in ${course.course_name}`;
        message = `Your predicted grade is ${predicted_grade} (${predicted_marks}%). With some additional effort, you can achieve better results. Consider reviewing study materials and attending extra sessions.`;
      } else if (predicted_marks < 85) {
        alertType = 'good';
        severity = 'low';
        title = `✅ Good Progress: Strong performance in ${course.course_name}`;
        message = `Your predicted grade is ${predicted_grade} (${predicted_marks}%). You're doing well! Keep up the good work and maintain your current study routine.`;
      } else {
        alertType = 'excellent';
        severity = 'low';
        title = `🌟 Excellent Work: Outstanding performance in ${course.course_name}`;
        message = `Your predicted grade is ${predicted_grade} (${predicted_marks}%). Exceptional work! You're excelling in this course. Consider helping your peers or taking on additional challenges.`;
      }
      
      // Create alert in database
      await this.createAlert({
        studentId,
        courseId,
        alertType,
        severity,
        title,
        message,
        predictedGrade: predicted_grade,
        predictedMarks: predicted_marks
      });
      
      // Generate lecturer alert for at-risk students
      if (predicted_marks < 55) {
        await this.generateLecturerAlert(studentId, courseId, {
          alertType: 'student_at_risk',
          severity: predicted_marks < 40 ? 'critical' : 'high',
          title: `Student at Risk: ${student.full_name} in ${course.course_name}`,
          message: `${student.full_name} has a predicted grade of ${predicted_grade} (${predicted_marks}%) in ${course.course_name}. Intervention may be required.`,
          studentName: student.full_name,
          courseName: course.course_name,
          predictedGrade: predicted_grade,
          predictedMarks: predicted_marks,
          actionRequired: true
        });
      }
      
      return { success: true, alertType, severity };
      
    } catch (error) {
      console.error("Error generating prediction alerts:", error);
      throw error;
    }
  }
  
  // Generate alerts for poor quiz performance
  async generateQuizAlerts(studentId, courseId, quizNumber, marks) {
    try {
      if (marks === null || marks === undefined) return;
      
      const [student] = await db.promise().query(
        "SELECT full_name FROM users WHERE id = ?", [studentId]
      );
      const [course] = await db.promise().query(
        "SELECT course_name FROM courses WHERE id = ?", [courseId]
      );
      
      if (!student.length || !course.length) return;
      
      let alertType, severity, title, message;
      
      if (marks < 40) {
        alertType = 'poor_quiz';
        severity = 'critical';
        title = `🚨 Quiz Alert: Poor performance in Quiz ${quizNumber}`;
        message = `You scored ${marks}% in Quiz ${quizNumber} for ${course[0].course_name}. This is below the passing threshold. Please review the material and consider seeking help.`;
      } else if (marks < 55) {
        alertType = 'poor_quiz';
        severity = 'high';
        title = `⚠️ Quiz Alert: Below average performance in Quiz ${quizNumber}`;
        message = `You scored ${marks}% in Quiz ${quizNumber} for ${course[0].course_name}. Consider reviewing the topics covered and preparing better for future assessments.`;
      } else if (marks >= 85) {
        alertType = 'excellent';
        severity = 'low';
        title = `🎉 Quiz Success: Excellent performance in Quiz ${quizNumber}`;
        message = `Congratulations! You scored ${marks}% in Quiz ${quizNumber} for ${course[0].course_name}. Keep up the excellent work!`;
      }
      
      if (alertType) {
        await this.createAlert({
          studentId,
          courseId,
          alertType,
          severity,
          title,
          message,
          predictedMarks: marks
        });
      }
      
    } catch (error) {
      console.error("Error generating quiz alerts:", error);
    }
  }
  
  // Generate alerts for poor assignment performance
  async generateAssignmentAlerts(studentId, courseId, assignmentNumber, marks) {
    try {
      if (marks === null || marks === undefined) return;
      
      const [student] = await db.promise().query(
        "SELECT full_name FROM users WHERE id = ?", [studentId]
      );
      const [course] = await db.promise().query(
        "SELECT course_name FROM courses WHERE id = ?", [courseId]
      );
      
      if (!student.length || !course.length) return;
      
      let alertType, severity, title, message;
      
      if (marks < 40) {
        alertType = 'poor_assignment';
        severity = 'critical';
        title = `🚨 Assignment Alert: Poor performance in Assignment ${assignmentNumber}`;
        message = `You scored ${marks}% in Assignment ${assignmentNumber} for ${course[0].course_name}. This requires immediate attention. Please meet with your lecturer to discuss improvement strategies.`;
      } else if (marks < 55) {
        alertType = 'poor_assignment';
        severity = 'high';
        title = `⚠️ Assignment Alert: Below average performance in Assignment ${assignmentNumber}`;
        message = `You scored ${marks}% in Assignment ${assignmentNumber} for ${course[0].course_name}. Consider seeking feedback and improving your approach for future assignments.`;
      } else if (marks >= 85) {
        alertType = 'excellent';
        severity = 'low';
        title = `🌟 Assignment Success: Outstanding work on Assignment ${assignmentNumber}`;
        message = `Excellent work! You scored ${marks}% in Assignment ${assignmentNumber} for ${course[0].course_name}. Your dedication is paying off!`;
      }
      
      if (alertType) {
        await this.createAlert({
          studentId,
          courseId,
          alertType,
          severity,
          title,
          message,
          predictedMarks: marks
        });
      }
      
    } catch (error) {
      console.error("Error generating assignment alerts:", error);
    }
  }
  
  // Generate alerts for midterm performance
  async generateMidtermAlerts(studentId, courseId, marks) {
    try {
      if (marks === null || marks === undefined) return;
      
      const [student] = await db.promise().query(
        "SELECT full_name FROM users WHERE id = ?", [studentId]
      );
      const [course] = await db.promise().query(
        "SELECT course_name FROM courses WHERE id = ?", [courseId]
      );
      
      if (!student.length || !course.length) return;
      
      let alertType, severity, title, message;
      
      if (marks < 40) {
        alertType = 'poor_midterm';
        severity = 'critical';
        title = `🚨 Midterm Alert: Critical performance needs immediate attention`;
        message = `You scored ${marks}% in the midterm exam for ${course[0].course_name}. This is a critical situation. Please schedule an urgent meeting with your lecturer and academic advisor.`;
      } else if (marks < 55) {
        alertType = 'poor_midterm';
        severity = 'high';
        title = `⚠️ Midterm Alert: Poor performance requires action`;
        message = `You scored ${marks}% in the midterm exam for ${course[0].course_name}. You need to significantly improve your preparation for the final exam. Seek help immediately.`;
      } else if (marks < 70) {
        alertType = 'average';
        severity = 'medium';
        title = `📊 Midterm Update: Average performance with room for improvement`;
        message = `You scored ${marks}% in the midterm exam for ${course[0].course_name}. With focused effort, you can improve your final grade. Consider additional study sessions.`;
      } else if (marks >= 85) {
        alertType = 'excellent';
        severity = 'low';
        title = `🏆 Midterm Excellence: Outstanding midterm performance`;
        message = `Congratulations! You scored ${marks}% in the midterm exam for ${course[0].course_name}. Excellent work! Maintain this level of preparation for the final exam.`;
      }
      
      if (alertType) {
        await this.createAlert({
          studentId,
          courseId,
          alertType,
          severity,
          title,
          message,
          predictedMarks: marks
        });
      }
      
    } catch (error) {
      console.error("Error generating midterm alerts:", error);
    }
  }
  
  // Generate alerts for low attendance
  async generateAttendanceAlerts(studentId, courseId, attendancePercentage) {
    try {
      if (attendancePercentage === null || attendancePercentage === undefined) return;
      
      const [student] = await db.promise().query(
        "SELECT full_name FROM users WHERE id = ?", [studentId]
      );
      const [course] = await db.promise().query(
        "SELECT course_name FROM courses WHERE id = ?", [courseId]
      );
      
      if (!student.length || !course.length) return;
      
      let alertType, severity, title, message;
      
      if (attendancePercentage < 50) {
        alertType = 'low_attendance';
        severity = 'critical';
        title = `🚨 Attendance Crisis: Critical attendance warning`;
        message = `Your attendance in ${course[0].course_name} is only ${attendancePercentage}%. This is critically low and may affect your eligibility to sit for exams. Contact the course coordinator immediately.`;
      } else if (attendancePercentage < 65) {
        alertType = 'low_attendance';
        severity = 'high';
        title = `⚠️ Attendance Warning: Poor attendance requires attention`;
        message = `Your attendance in ${course[0].course_name} is ${attendancePercentage}%. You need to improve your attendance to avoid academic penalties.`;
      } else if (attendancePercentage < 75) {
        alertType = 'low_attendance';
        severity = 'medium';
        title = `📋 Attendance Notice: Below recommended attendance`;
        message = `Your attendance in ${course[0].course_name} is ${attendancePercentage}%. Try to attend more classes to improve your understanding and performance.`;
      } else if (attendancePercentage >= 95) {
        alertType = 'excellent';
        severity = 'low';
        title = `🎯 Perfect Attendance: Excellent commitment`;
        message = `Outstanding! Your attendance in ${course[0].course_name} is ${attendancePercentage}%. Your commitment to attending classes is commendable!`;
      }
      
      if (alertType) {
        await this.createAlert({
          studentId,
          courseId,
          alertType,
          severity,
          title,
          message
        });
        
        // Generate lecturer alert for poor attendance
        if (attendancePercentage < 75) {
          await this.generateLecturerAlert(studentId, courseId, {
            alertType: 'low_class_attendance',
            severity: attendancePercentage < 50 ? 'critical' : attendancePercentage < 65 ? 'high' : 'medium',
            title: `Low Attendance: ${student[0].full_name} in ${course[0].course_name}`,
            message: `${student[0].full_name} has ${attendancePercentage}% attendance in ${course[0].course_name}. Consider reaching out to the student.`,
            studentName: student[0].full_name,
            courseName: course[0].course_name,
            actionRequired: attendancePercentage < 65
          });
        }
      }
      
    } catch (error) {
      console.error("Error generating attendance alerts:", error);
    }
  }
  
  // Generate motivational alerts for students
  async generateMotivationalAlerts(studentId, courseId) {
    try {
      const [student] = await db.promise().query(
        "SELECT full_name FROM users WHERE id = ?", [studentId]
      );
      const [course] = await db.promise().query(
        "SELECT course_name FROM courses WHERE id = ?", [courseId]
      );
      
      if (!student.length || !course.length) return;
      
      // Check if student hasn't received a motivational alert recently (within 7 days)
      const [recentAlert] = await db.promise().query(
        "SELECT id FROM alerts WHERE student_id = ? AND course_id = ? AND alert_type = 'motivational' AND created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)",
        [studentId, courseId]
      );
      
      if (recentAlert.length > 0) return; // Don't spam with motivational alerts
      
      const motivationalMessages = [
        "Keep pushing forward! Every small step counts towards your success.",
        "Believe in yourself! You have the potential to achieve great things.",
        "Remember why you started. Your goals are within reach!",
        "Consistency is key. Keep up your efforts and you'll see results!",
        "You're capable of more than you know. Don't give up on yourself!",
        "Progress, not perfection. Every day is a new opportunity to improve.",
        "Your hard work will pay off. Stay focused on your goals!"
      ];
      
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      
      await this.createAlert({
        studentId,
        courseId,
        alertType: 'motivational',
        severity: 'low',
        title: `💪 Stay Motivated: You've got this!`,
        message: `${randomMessage} Keep working hard in ${course[0].course_name}!`
      });
      
    } catch (error) {
      console.error("Error generating motivational alerts:", error);
    }
  }
  
  // Create a student alert
  async createAlert(alertData) {
    try {
      const {
        studentId,
        courseId,
        alertType,
        severity,
        title,
        message,
        predictedGrade = null,
        predictedMarks = null
      } = alertData;
      
      await db.promise().query(
        `INSERT INTO alerts (student_id, course_id, alert_type, severity, title, message, predicted_grade, predicted_marks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [studentId, courseId, alertType, severity, title, message, predictedGrade, predictedMarks]
      );
      
      // Check if user wants email notifications
      const [preferences] = await db.promise().query(
        "SELECT email_notifications FROM alert_preferences WHERE user_id = ?",
        [studentId]
      );
      
      const emailEnabled = preferences.length === 0 || preferences[0].email_notifications;
      
      if (emailEnabled && (severity === 'critical' || severity === 'high')) {
        // Send email for critical and high severity alerts
        const [student] = await db.promise().query(
          "SELECT email, full_name FROM users WHERE id = ?", [studentId]
        );
        
        if (student.length > 0) {
          await sendAlertEmail(student[0].email, student[0].full_name, title, message, severity);
        }
      }
      
    } catch (error) {
      console.error("Error creating alert:", error);
      throw error;
    }
  }
  
  // Generate lecturer alert
  async generateLecturerAlert(studentId, courseId, alertData) {
    try {
      // Get lecturer ID for this course
      const [lecturer] = await db.promise().query(
        "SELECT user_id FROM lecturer_courses WHERE course_id = ?", [courseId]
      );
      
      if (!lecturer.length) return;
      
      const lecturerId = lecturer[0].user_id;
      
      await db.promise().query(
        `INSERT INTO lecturer_alerts (lecturer_id, student_id, course_id, alert_type, severity, title, message, student_name, course_name, predicted_grade, predicted_marks, action_required)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lecturerId,
          studentId,
          courseId,
          alertData.alertType,
          alertData.severity,
          alertData.title,
          alertData.message,
          alertData.studentName,
          alertData.courseName,
          alertData.predictedGrade || null,
          alertData.predictedMarks || null,
          alertData.actionRequired || false
        ]
      );
      
    } catch (error) {
      console.error("Error generating lecturer alert:", error);
    }
  }
  
  // Get alerts for a student
  async getStudentAlerts(studentId, courseId = null, limit = 50) {
    try {
      let query = `
        SELECT a.*, c.course_name, c.course_code 
        FROM alerts a 
        JOIN courses c ON a.course_id = c.id 
        WHERE a.student_id = ?
      `;
      const params = [studentId];
      
      if (courseId) {
        query += " AND a.course_id = ?";
        params.push(courseId);
      }
      
      query += " ORDER BY a.created_at DESC LIMIT ?";
      params.push(limit);
      
      const [alerts] = await db.promise().query(query, params);
      return alerts;
      
    } catch (error) {
      console.error("Error getting student alerts:", error);
      throw error;
    }
  }
  
  // Get alerts for a lecturer
  async getLecturerAlerts(lecturerId, limit = 50) {
    try {
      const [alerts] = await db.promise().query(
        `SELECT * FROM lecturer_alerts 
         WHERE lecturer_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [lecturerId, limit]
      );
      
      return alerts;
      
    } catch (error) {
      console.error("Error getting lecturer alerts:", error);
      throw error;
    }
  }
  
  // Mark alert as read
  async markAlertAsRead(alertId, userId, isLecturer = false) {
    try {
      const table = isLecturer ? 'lecturer_alerts' : 'alerts';
      const userField = isLecturer ? 'lecturer_id' : 'student_id';
      
      await db.promise().query(
        `UPDATE ${table} SET is_read = TRUE WHERE id = ? AND ${userField} = ?`,
        [alertId, userId]
      );
      
    } catch (error) {
      console.error("Error marking alert as read:", error);
      throw error;
    }
  }
  
  // Mark alert as resolved
  async markAlertAsResolved(alertId, userId, isLecturer = false) {
    try {
      const table = isLecturer ? 'lecturer_alerts' : 'alerts';
      const userField = isLecturer ? 'lecturer_id' : 'student_id';
      
      await db.promise().query(
        `UPDATE ${table} SET is_resolved = TRUE WHERE id = ? AND ${userField} = ?`,
        [alertId, userId]
      );
      
    } catch (error) {
      console.error("Error marking alert as resolved:", error);
      throw error;
    }
  }
  
  // Get unread alert count
  async getUnreadAlertCount(userId, isLecturer = false) {
    try {
      const table = isLecturer ? 'lecturer_alerts' : 'alerts';
      const userField = isLecturer ? 'lecturer_id' : 'student_id';
      
      const [result] = await db.promise().query(
        `SELECT COUNT(*) as count FROM ${table} WHERE ${userField} = ? AND is_read = FALSE`,
        [userId]
      );
      
      return result[0].count;
      
    } catch (error) {
      console.error("Error getting unread alert count:", error);
      return 0;
    }
  }
  
  // Process all pending alerts (called by scheduler)
  async processAllPendingAlerts() {
    try {
      console.log("Processing all pending alerts...");
      
      // Get all active student enrollments
      const [enrollments] = await db.promise().query(
        `SELECT se.student_id, se.course_id, u.full_name, c.course_name
         FROM student_enrollments se
         JOIN users u ON se.student_id = u.id
         JOIN courses c ON se.course_id = c.id
         WHERE se.status = 'active'`
      );
      
      for (const enrollment of enrollments) {
        await this.processStudentAlerts(enrollment.student_id, enrollment.course_id);
      }
      
      console.log(`Processed alerts for ${enrollments.length} enrollments`);
      
    } catch (error) {
      console.error("Error processing all pending alerts:", error);
    }
  }
  
  // Process alerts for a specific student and course
  async processStudentAlerts(studentId, courseId) {
    try {
      // Get attendance data
      const [attendance] = await db.promise().query(
        "SELECT attendance FROM admin_inputs WHERE student_id = ? AND course_id = ?",
        [studentId, courseId]
      );
      
      if (attendance.length > 0 && attendance[0].attendance !== null) {
        await this.generateAttendanceAlerts(studentId, courseId, attendance[0].attendance);
      }
      
      // Get marks data
      const [marks] = await db.promise().query(
        "SELECT quiz1, quiz2, assignment1, assignment2, midterm_marks FROM lecturer_marks WHERE student_id = ? AND course_id = ?",
        [studentId, courseId]
      );
      
      if (marks.length > 0) {
        const marksData = marks[0];
        
        if (marksData.quiz1 !== null) {
          await this.generateQuizAlerts(studentId, courseId, 1, marksData.quiz1);
        }
        if (marksData.quiz2 !== null) {
          await this.generateQuizAlerts(studentId, courseId, 2, marksData.quiz2);
        }
        if (marksData.assignment1 !== null) {
          await this.generateAssignmentAlerts(studentId, courseId, 1, marksData.assignment1);
        }
        if (marksData.assignment2 !== null) {
          await this.generateAssignmentAlerts(studentId, courseId, 2, marksData.assignment2);
        }
        if (marksData.midterm_marks !== null) {
          await this.generateMidtermAlerts(studentId, courseId, marksData.midterm_marks);
        }
      }
      
      // Generate occasional motivational alerts
      if (Math.random() < 0.1) { // 10% chance for motivational alert
        await this.generateMotivationalAlerts(studentId, courseId);
      }
      
    } catch (error) {
      console.error("Error processing student alerts:", error);
    }
  }
}

module.exports = new AlertsService();
