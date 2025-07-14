const db = require("../config/db");
const axios = require("axios");

const getPrediction = async (req, res) => {
  const { student_id, course_id } = req.params;

  try {
    // 1. Check if course exists
    const [courseCheck] = await db.promise().query(
      "SELECT * FROM courses WHERE id = ?", [course_id]
    );
    if (courseCheck.length === 0) {
      return res.status(404).json({ message: "Invalid course_id" });
    }

    // 2. Check if student is enrolled in this course
    const [enrollmentCheck] = await db.promise().query(
      "SELECT * FROM student_enrollments WHERE student_id = ? AND course_id = ? AND status = 'active'",
      [student_id, course_id]
    );
    if (enrollmentCheck.length === 0) {
      return res.status(404).json({ message: "Student is not enrolled in this course" });
    }

    // 3. Fetch common student data
    const [commonData] = await db.promise().query(
      "SELECT gender, peer_influence, motivation_level, extracurricular_activities, physical_activity, sleep_hours FROM student_common_data WHERE student_id = ?",
      [student_id]
    );
    if (commonData.length === 0) {
      return res.status(404).json({ message: "Common data not found for student" });
    }

    // 4. Get other course-related data
    const [subjectData] = await db.promise().query(
      "SELECT hours_studied, teacher_quality FROM student_subject_data WHERE student_id = ? AND course_id = ?",
      [student_id, course_id]
    );
    const [marksData] = await db.promise().query(
      "SELECT quiz1, quiz2, assignment1, assignment2, midterm_marks FROM lecturer_marks WHERE student_id = ? AND course_id = ?",
      [student_id, course_id]
    );
    const [adminData] = await db.promise().query(
      "SELECT attendance, motivation_level FROM admin_inputs WHERE student_id = ? AND course_id = ?",
      [student_id, course_id]
    );

    // Merge into one input object
    const features = {
      subject: courseCheck[0].difficulty_level, // Using course difficulty level
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
