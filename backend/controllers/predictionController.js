const db = require("../config/db");
const axios = require("axios");

const getPrediction = async (req, res) => {
  const { student_id, subject_id } = req.params;

  try {
    // 1. Check if subject exists
    const [subjectCheck] = await db.promise().query(
      "SELECT * FROM subjects WHERE id = ?", [subject_id]
    );
    if (subjectCheck.length === 0) {
      return res.status(404).json({ message: "Invalid subject_id" });
    }

    // 2. Check if student is enrolled in this subject
    const [enrollmentCheck] = await db.promise().query(
      "SELECT * FROM student_subject_data WHERE student_id = ? AND subject_id = ?",
      [student_id, subject_id]
    );
    if (enrollmentCheck.length === 0) {
      return res.status(404).json({ message: "Student is not enrolled in this subject" });
    }

    // 3. Fetch common student data
    const [commonData] = await db.promise().query(
      "SELECT gender, peer_influence, motivation_level, extracurricular_activities, physical_activity, sleep_hours FROM student_common_data WHERE student_id = ?",
      [student_id]
    );
    if (commonData.length === 0) {
      return res.status(404).json({ message: "Common data not found for student" });
    }

    // 4. Get other subject-related data
    const [subjectData] = await db.promise().query(
      "SELECT hours_studied, teacher_quality FROM student_subject_data WHERE student_id = ? AND subject_id = ?",
      [student_id, subject_id]
    );
    const [marksData] = await db.promise().query(
      "SELECT quiz1, quiz2, assignment1, assignment2, midterm_marks FROM lecturer_marks WHERE student_id = ? AND subject_id = ?",
      [student_id, subject_id]
    );
    const [adminData] = await db.promise().query(
      "SELECT attendance, motivation_level FROM admin_inputs WHERE student_id = ? AND subject_id = ?",
      [student_id, subject_id]
    );

    // Merge into one input object
    const features = {
      subject: subjectCheck[0].difficulty_level, // Assuming subject has a 'type'
      ...commonData[0],
      ...(subjectData[0] || {}),
      ...(marksData[0] || {}),
      ...(adminData[0] || {})
    };

    // Send to Python model
    const response = await axios.post("http://localhost:5002/predict", features);
    res.json(response.data);
  } catch (err) {
    console.error("Prediction error:", err);
    res.status(500).json({ message: "Prediction failed", error: err.message });
  }
};


module.exports = { getPrediction };
