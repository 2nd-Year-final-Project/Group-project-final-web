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

module.exports = {
  submitCommonData,
  submitSubjectData,
};
