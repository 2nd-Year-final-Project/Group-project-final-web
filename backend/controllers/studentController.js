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
      COALESCE(lm.quiz1, 0) as quiz1,
      COALESCE(lm.quiz2, 0) as quiz2,
      COALESCE(lm.assignment1, 0) as assignment1,
      COALESCE(lm.assignment2, 0) as assignment2,
      COALESCE(lm.midterm_marks, 0) as midterm,
      ROUND(
        (COALESCE(lm.quiz1, 0) + COALESCE(lm.quiz2, 0) + 
         COALESCE(lm.assignment1, 0) + COALESCE(lm.assignment2, 0) + 
         COALESCE(lm.midterm_marks, 0)) / 5, 2
      ) as current_grade,
      u_lecturer.full_name as lecturer_name
    FROM student_enrollments se
    JOIN courses c ON se.course_id = c.id
    LEFT JOIN lecturer_marks lm ON se.student_id = lm.student_id AND c.id = lm.subject_id
    LEFT JOIN lecturer_courses lc ON c.id = lc.course_id
    LEFT JOIN users u_lecturer ON lc.lecturer_id = u_lecturer.id
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
         COALESCE(lm.midterm_marks, 0)) / 5, 2
      ) as current_grade,
      u_lecturer.full_name as lecturer_name,
      u_lecturer.email as lecturer_email
    FROM student_enrollments se
    JOIN courses c ON se.course_id = c.id
    LEFT JOIN lecturer_marks lm ON se.student_id = lm.student_id AND c.id = lm.subject_id
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
  const { student_id, gender, peer_influence, motivation_level, extracurricular_activities, physical_activity, sleep_hours } = req.body;

  const sql = `INSERT INTO student_common_data 
    (student_id, gender, peer_influence, motivation_level, extracurricular_activities, physical_activity, sleep_hours)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [student_id, gender, peer_influence, motivation_level, extracurricular_activities, physical_activity, sleep_hours], (err) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    res.json({ message: "Common student data submitted successfully." });
  });
};

// Student - Submit subject-specific data
const submitSubjectData = (req, res) => {
  const { student_id, subject_id, hours_studied, teacher_quality } = req.body;

  const sql = `INSERT INTO student_subject_data 
    (student_id, subject_id, hours_studied, teacher_quality)
    VALUES (?, ?, ?, ?)`;

  db.query(sql, [student_id, subject_id, hours_studied, teacher_quality], (err) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    res.json({ message: "Subject-specific data submitted successfully." });
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

module.exports = {
  getStudentCourses,
  getStudentCourseDetails,
  submitCommonData,
  submitSubjectData,
  getStudentName
};
