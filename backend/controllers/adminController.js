const db = require("../config/db");

// Admin submits attendance and motivation level
const submitAdminInput = (req, res) => {
  const { student_id, subject_id, attendance, motivation_level } = req.body;

  const sql = `INSERT INTO admin_inputs 
    (student_id, subject_id, attendance, motivation_level)
    VALUES (?, ?, ?, ?)`;

  db.query(sql, [student_id, subject_id, attendance, motivation_level], (err) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    res.json({ message: "Admin input submitted successfully." });
  });
};

module.exports = { submitAdminInput };
