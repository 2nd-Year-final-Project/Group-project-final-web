const db = require("../config/db");
const AlertService = require("../services/alertService");
const axios = require("axios");

// Get lecturer's assigned courses
const getLecturerCourses = (req, res) => {
  const { lecturerId } = req.params;

  const sql = `
    SELECT 
      c.id,
      c.course_code,
      c.course_name,
      c.description,
      c.credits,
      c.difficulty_level,
      COUNT(DISTINCT se.student_id) as student_count,
      COUNT(DISTINCT CASE WHEN lm.midterm_marks < 50 THEN se.student_id END) as at_risk_count
    FROM courses c
    JOIN lecturer_courses lc ON c.id = lc.course_id
    LEFT JOIN student_enrollments se ON c.id = se.course_id AND se.status = 'active'
    LEFT JOIN lecturer_marks lm ON se.student_id = lm.student_id AND c.id = lm.course_id
    WHERE lc.lecturer_id = ?
    GROUP BY c.id, c.course_code, c.course_name, c.description, c.credits, c.difficulty_level
    ORDER BY c.course_name
  `;

  db.query(sql, [lecturerId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    res.json(results);
  });
};

// Get students enrolled in a specific course with predictions
const getCourseStudents = async (req, res) => {
  const { courseId } = req.params;

  const sql = `
    SELECT 
      u.id,
      u.username,
      u.full_name,
      u.email,
      se.enrollment_date,
      lm.quiz1,
      lm.quiz2,
      lm.assignment1,
      lm.assignment2,
      lm.midterm_marks as midterm,
      ROUND(
        (COALESCE(lm.quiz1, 0) + COALESCE(lm.quiz2, 0) + 
         COALESCE(lm.assignment1, 0) + COALESCE(lm.assignment2, 0) + 
         COALESCE(lm.midterm_marks, 0)) / 
        CASE 
          WHEN (lm.quiz1 IS NOT NULL) + (lm.quiz2 IS NOT NULL) + (lm.assignment1 IS NOT NULL) + (lm.assignment2 IS NOT NULL) + (lm.midterm_marks IS NOT NULL) = 0 
          THEN 1 
          ELSE (lm.quiz1 IS NOT NULL) + (lm.quiz2 IS NOT NULL) + (lm.assignment1 IS NOT NULL) + (lm.assignment2 IS NOT NULL) + (lm.midterm_marks IS NOT NULL) 
        END, 2
      ) as current_grade
    FROM student_enrollments se
    JOIN users u ON se.student_id = u.id
    LEFT JOIN lecturer_marks lm ON u.id = lm.student_id AND lm.course_id = ?
    WHERE se.course_id = ? AND se.status = 'active'
    ORDER BY u.full_name
  `;

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(sql, [courseId, courseId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // Fetch predictions for each student
    const studentsWithPredictions = await Promise.all(
      results.map(async (student) => {
        try {
          // Try to fetch prediction for this student and course
          const response = await axios.get(`http://localhost:5000/api/prediction/${student.id}/${courseId}`);
          
          const predictedGrade = response.data && response.data.predicted_grade ? 
            parseFloat(response.data.predicted_grade) : null;
          
          return {
            ...student,
            predicted_grade: predictedGrade,
            has_prediction: predictedGrade !== null
          };
        } catch (predictionError) {
          // If prediction fails, return student data without prediction
          console.log(`No prediction available for student ${student.id} in course ${courseId}:`, predictionError.message);
          return {
            ...student,
            predicted_grade: null,
            has_prediction: false
          };
        }
      })
    );

    res.json(studentsWithPredictions);
  } catch (error) {
    console.error('Error fetching course students:', error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// Get at-risk students for a lecturer
const getAtRiskStudents = (req, res) => {
  const { lecturerId } = req.params;

  const sql = `
    SELECT 
      u.id,
      u.full_name,
      c.course_code,
      c.course_name,
      ROUND(
        (COALESCE(lm.quiz1, 0) + COALESCE(lm.quiz2, 0) + 
         COALESCE(lm.assignment1, 0) + COALESCE(lm.assignment2, 0) + 
         COALESCE(lm.midterm_marks, 0)) / 5, 2
      ) as predicted_grade,
      CASE 
        WHEN COALESCE(lm.quiz1, 0) < 50 THEN 'Poor quiz performance'
        WHEN COALESCE(lm.assignment1, 0) < 50 OR COALESCE(lm.assignment2, 0) < 50 THEN 'Missing assignments'
        WHEN COALESCE(lm.midterm_marks, 0) < 50 THEN 'Poor midterm performance'
        ELSE 'General performance issues'
      END as risk_factors
    FROM lecturer_courses lc
    JOIN courses c ON lc.course_id = c.id
    JOIN student_enrollments se ON c.id = se.course_id AND se.status = 'active'
    JOIN users u ON se.student_id = u.id
    LEFT JOIN lecturer_marks lm ON u.id = lm.student_id AND c.id = lm.course_id
    WHERE lc.lecturer_id = ?
    AND (
      ROUND((COALESCE(lm.quiz1, 0) + COALESCE(lm.quiz2, 0) + 
             COALESCE(lm.assignment1, 0) + COALESCE(lm.assignment2, 0) + 
             COALESCE(lm.midterm_marks, 0)) / 5, 2) < 60
      OR COALESCE(lm.midterm_marks, 0) < 50
    )
    ORDER BY predicted_grade ASC
  `;

  db.query(sql, [lecturerId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    res.json(results);
  });
};

// Lecturer submits marks
const submitMarks = (req, res) => {
  const { student_id, course_id, quiz1, quiz2, assignment1, assignment2, midterm_marks } = req.body;

  // Validate required fields
  if (!student_id || !course_id) {
    return res.status(400).json({ message: "Student ID and Course ID are required" });
  }

  // Convert null values to NULL for database
  const quiz1Value = quiz1 !== null && quiz1 !== undefined && quiz1 !== '' ? parseFloat(quiz1) : null;
  const quiz2Value = quiz2 !== null && quiz2 !== undefined && quiz2 !== '' ? parseFloat(quiz2) : null;
  const assignment1Value = assignment1 !== null && assignment1 !== undefined && assignment1 !== '' ? parseFloat(assignment1) : null;
  const assignment2Value = assignment2 !== null && assignment2 !== undefined && assignment2 !== '' ? parseFloat(assignment2) : null;
  const midtermValue = midterm_marks !== null && midterm_marks !== undefined && midterm_marks !== '' ? parseFloat(midterm_marks) : null;

  // First check if marks already exist for this student and course
  const checkSql = "SELECT id FROM lecturer_marks WHERE student_id = ? AND course_id = ?";
  
  db.query(checkSql, [student_id, course_id], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).json({ message: "Database error", error: checkErr.message });
    }

    if (checkResults.length > 0) {
      // Update existing marks
      const updateSql = `
        UPDATE lecturer_marks 
        SET quiz1 = ?, quiz2 = ?, assignment1 = ?, assignment2 = ?, midterm_marks = ?
        WHERE student_id = ? AND course_id = ?
      `;
      
      db.query(updateSql, [quiz1Value, quiz2Value, assignment1Value, assignment2Value, midtermValue, student_id, course_id], async (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ message: "Database error", error: updateErr.message });
        }
        
        // Trigger alert generation for this student after marks update
        try {
          await AlertService.generateStudentAlerts(student_id);
          console.log(`🔔 Alerts generated for student ${student_id} after marks update`);
        } catch (alertError) {
          console.error('Error generating alerts after marks update:', alertError);
          // Don't fail the marks update if alert generation fails
        }
        
        res.json({ message: "Marks updated successfully." });
      });
    } else {
      // Insert new marks
      const insertSql = `
        INSERT INTO lecturer_marks 
        (student_id, course_id, quiz1, quiz2, assignment1, assignment2, midterm_marks)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(insertSql, [student_id, course_id, quiz1Value, quiz2Value, assignment1Value, assignment2Value, midtermValue], async (insertErr) => {
        if (insertErr) {
          return res.status(500).json({ message: "Database error", error: insertErr.message });
        }
        
        // Trigger alert generation for this student after marks submission
        try {
          await AlertService.generateStudentAlerts(student_id);
          console.log(`🔔 Alerts generated for student ${student_id} after marks submission`);
        } catch (alertError) {
          console.error('Error generating alerts after marks submission:', alertError);
          // Don't fail the marks submission if alert generation fails
        }
        
        res.json({ message: "Marks submitted successfully." });
      });
    }
  });
};

module.exports = { 
  getLecturerCourses, 
  getCourseStudents, 
  getAtRiskStudents, 
  submitMarks 
};
