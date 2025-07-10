const db = require("../config/db");

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
  submitCommonData,
  submitSubjectData,
    getStudentName
};
