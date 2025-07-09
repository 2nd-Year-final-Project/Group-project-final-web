const db = require("../config/db");

// Lecturer submits marks
const submitMarks = (req, res) => {
  const { student_id, subject_id, quiz1, quiz2, assignment1, assignment2, midterm_marks } = req.body;

  const sql = `INSERT INTO lecturer_marks 
    (student_id, subject_id, quiz1, quiz2, assignment1, assignment2, midterm_marks)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [student_id, subject_id, quiz1, quiz2, assignment1, assignment2, midterm_marks], (err) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    res.json({ message: "Lecturer marks submitted successfully." });
  });
};

module.exports = { submitMarks };
