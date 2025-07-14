const db = require("../config/db");

// Get student's enrolled courses
const getStudentCourses = (req, res) => {
  const { studentId } = req.params;

  const sql = `
    SELECT 
      c.id,
      c.course_code,
      c.course_name,
      c.description,
      c.credits,
      c.difficulty_level,
      se.enrollment_date,
      se.status,
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
      ) as current_grade,
      u_lecturer.full_name as lecturer_name,
      ai.attendance
    FROM student_enrollments se
    JOIN courses c ON se.course_id = c.id
    LEFT JOIN lecturer_marks lm ON se.student_id = lm.student_id AND c.id = lm.course_id
    LEFT JOIN lecturer_courses lc ON c.id = lc.course_id
    LEFT JOIN users u_lecturer ON lc.lecturer_id = u_lecturer.id
    LEFT JOIN admin_inputs ai ON se.student_id = ai.student_id AND c.id = ai.course_id
    WHERE se.student_id = ? AND se.status = 'active'
    ORDER BY c.course_name
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    res.json(results);
  });
};

// Get detailed course information for a student
const getStudentCourseDetails = (req, res) => {
  const { studentId, courseId } = req.params;

  const sql = `
    SELECT 
      c.*,
      se.enrollment_date,
      se.status,
      lm.quiz1,
      lm.quiz2,
      lm.assignment1,
      lm.assignment2,
      lm.midterm_marks,
      ROUND(
        (COALESCE(lm.quiz1, 0) + COALESCE(lm.quiz2, 0) + 
         COALESCE(lm.assignment1, 0) + COALESCE(lm.assignment2, 0) + 
         COALESCE(lm.midterm_marks, 0)) / 
        CASE 
          WHEN (lm.quiz1 IS NOT NULL) + (lm.quiz2 IS NOT NULL) + (lm.assignment1 IS NOT NULL) + (lm.assignment2 IS NOT NULL) + (lm.midterm_marks IS NOT NULL) = 0 
          THEN 1 
          ELSE (lm.quiz1 IS NOT NULL) + (lm.quiz2 IS NOT NULL) + (lm.assignment1 IS NOT NULL) + (lm.assignment2 IS NOT NULL) + (lm.midterm_marks IS NOT NULL) 
        END, 2
      ) as current_grade,
      u_lecturer.full_name as lecturer_name,
      u_lecturer.email as lecturer_email
    FROM student_enrollments se
    JOIN courses c ON se.course_id = c.id
    LEFT JOIN lecturer_marks lm ON se.student_id = lm.student_id AND c.id = lm.course_id
    LEFT JOIN lecturer_courses lc ON c.id = lc.course_id
    LEFT JOIN users u_lecturer ON lc.lecturer_id = u_lecturer.id
    WHERE se.student_id = ? AND se.course_id = ? AND se.status = 'active'
  `;

  db.query(sql, [studentId, courseId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: "Course enrollment not found" });
    }
    
    res.json(results[0]);
  });
};

// Student - Submit common data
const submitCommonData = (req, res) => {
  const { student_id, gender, peer_influence, extracurricular_activities, physical_activity, sleep_hours } = req.body;

  // First check if data already exists for this student
  const checkSql = "SELECT id FROM student_common_data WHERE student_id = ?";
  
  db.query(checkSql, [student_id], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).json({ message: "Database error", error: checkErr.message });
    }

    if (checkResults.length > 0) {
      // Update existing data
      const updateSql = `
        UPDATE student_common_data 
        SET gender = ?, peer_influence = ?, extracurricular_activities = ?, physical_activity = ?, sleep_hours = ?
        WHERE student_id = ?
      `;
      
      db.query(updateSql, [gender, peer_influence, extracurricular_activities, physical_activity, sleep_hours, student_id], (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ message: "Database error", error: updateErr.message });
        }
        res.json({ message: "Common student data updated successfully." });
      });
    } else {
      // Insert new data (motivation_level defaults to NULL)
      const insertSql = `
        INSERT INTO student_common_data 
        (student_id, gender, peer_influence, extracurricular_activities, physical_activity, sleep_hours)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(insertSql, [student_id, gender, peer_influence, extracurricular_activities, physical_activity, sleep_hours], (insertErr) => {
        if (insertErr) {
          return res.status(500).json({ message: "Database error", error: insertErr.message });
        }
        res.json({ message: "Common student data submitted successfully." });
      });
    }
  });
};

// Student - Submit subject-specific data
const submitSubjectData = (req, res) => {
  const { student_id, course_id, hours_studied, teacher_quality } = req.body;

  // Convert teacher quality text to numeric value
  const teacherQualityMap = {
    'low': 1,
    'medium': 2,
    'high': 0
  };
  
  const teacherQualityValue = teacherQualityMap[teacher_quality.toLowerCase()] !== undefined 
    ? teacherQualityMap[teacher_quality.toLowerCase()] 
    : parseInt(teacher_quality);

  // First check if data already exists for this student and course
  const checkSql = "SELECT id FROM student_subject_data WHERE student_id = ? AND course_id = ?";
  
  db.query(checkSql, [student_id, course_id], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).json({ message: "Database error", error: checkErr.message });
    }

    if (checkResults.length > 0) {
      // Update existing data
      const updateSql = `
        UPDATE student_subject_data 
        SET hours_studied = ?, teacher_quality = ?
        WHERE student_id = ? AND course_id = ?
      `;
      
      db.query(updateSql, [hours_studied, teacherQualityValue, student_id, course_id], (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ message: "Database error", error: updateErr.message });
        }
        res.json({ message: "Subject-specific data updated successfully." });
      });
    } else {
      // Insert new data
      const insertSql = `
        INSERT INTO student_subject_data 
        (student_id, course_id, hours_studied, teacher_quality)
        VALUES (?, ?, ?, ?)
      `;

      db.query(insertSql, [student_id, course_id, hours_studied, teacherQualityValue], (insertErr) => {
        if (insertErr) {
          return res.status(500).json({ message: "Database error", error: insertErr.message });
        }
        res.json({ message: "Subject-specific data submitted successfully." });
      });
    }
  });
};

// Get student's subject data for a specific course
const getStudentSubjectData = (req, res) => {
  const { studentId, courseId } = req.params;

  const sql = `
    SELECT hours_studied, teacher_quality 
    FROM student_subject_data 
    WHERE student_id = ? AND course_id = ?
  `;

  db.query(sql, [studentId, courseId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    
    if (results.length === 0) {
      return res.json({ hours_studied: null, teacher_quality: null });
    }
    
    // Convert numeric teacher quality back to text
    const teacherQualityMap = {
      0: 'low',
      1: 'medium', 
      2: 'high'
    };
    
    const result = results[0];
    result.teacher_quality = teacherQualityMap[result.teacher_quality] || result.teacher_quality;
    
    res.json(result);
  });
};

// Get student full name by username
const getStudentName = async (req, res) => {
  const { username } = req.params;

  try {
    const [results] = await db.promise().query(
      "SELECT full_name FROM users WHERE username = ? AND role = 'student'",
      [username]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ fullName: results[0].full_name });
  } catch (err) {
    console.error("Error fetching student name:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Student - Get common data
const getCommonData = (req, res) => {
  const { student_id } = req.params;

  const sql = `SELECT gender, peer_influence, extracurricular_activities, physical_activity, sleep_hours 
               FROM student_common_data 
               WHERE student_id = ?`;

  db.query(sql, [student_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }

    if (results.length === 0) {
      return res.json(null); // No data found
    }

    res.json(results[0]);
  });
};

module.exports = {
  getStudentCourses,
  getStudentCourseDetails,
  submitCommonData,
  submitSubjectData,
  getStudentSubjectData,
  getStudentName,
  getCommonData
};
