const db = require("../config/db");
const axios = require("axios");

const getPrediction = async (req, res) => {
  const { student_id, subject_id } = req.params;

  try {
    // Fetch common data
    const [commonData] = await db.promise().query(
      "SELECT gender, peer_influence, motivation_level, extracurricular_activities, physical_activity, sleep_hours FROM student_common_data WHERE student_id = ?",
      [student_id]
    );
    if (commonData.length === 0) return res.status(404).json({ message: "Common data not found" });

    // Fetch subject-specific data
    const [subjectData] = await db.promise().query(
      "SELECT hours_studied, teacher_quality FROM student_subject_data WHERE student_id = ? AND subject_id = ?",
      [student_id, subject_id]
    );

    // Fetch marks
    const [marksData] = await db.promise().query(
      "SELECT quiz1, quiz2, assignment1, assignment2, midterm_marks FROM lecturer_marks WHERE student_id = ? AND subject_id = ?",
      [student_id, subject_id]
    );

    // Fetch admin input
    const [adminData] = await db.promise().query(
      "SELECT attendance, motivation_level FROM admin_inputs WHERE student_id = ? AND subject_id = ?",
      [student_id, subject_id]
    );

    // Merge all inputs into one object
    const features = {
      subject: "Hard", // or "Medium"/"Easy" — for now, hardcoded
      ...commonData[0],
      ...(subjectData[0] || {}),
      ...(marksData[0] || {}),
      ...(adminData[0] || {})
    };

    // Send to Python ML API
    const response = await axios.post("http://127.0.0.1:5001/predict", features);

    res.json(response.data);
  } catch (err) {
    console.error("Prediction error:", err);
    res.status(500).json({ message: "Prediction failed", error: err.message });
  }
};

module.exports = { getPrediction };
