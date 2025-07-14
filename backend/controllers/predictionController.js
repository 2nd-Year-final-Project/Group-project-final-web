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

    // 3.1. Validate required profile data
    const requiredFields = ['gender', 'peer_influence', 'extracurricular_activities', 'physical_activity', 'sleep_hours'];
    const commonDataRecord = commonData[0];
    console.log('Student common data:', commonDataRecord);
    
    const missingFields = requiredFields.filter(field => 
      commonDataRecord[field] === null || commonDataRecord[field] === undefined
    );

    console.log('Missing fields:', missingFields);

    if (missingFields.length > 0) {
      console.log('Returning incomplete profile error');
      return res.status(400).json({ 
        message: "Update your AI prediction settings in your Profile settings to get the prediction",
        missing_fields: missingFields,
        error_type: "incomplete_profile"
      });
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
      "SELECT attendance FROM admin_inputs WHERE student_id = ? AND course_id = ?",
      [student_id, course_id]
    );

    // Merge into one input object
    const features = {
      subject: courseCheck[0].difficulty_level, // Using course difficulty level
      ...commonData[0],
      ...(subjectData[0] || {}),
      ...(adminData[0] || {})
    };

    // Only add marks that are not null to avoid sending 0 for ungraded assessments
    if (marksData[0]) {
      const marks = marksData[0];
      if (marks.quiz1 !== null) features.quiz1 = marks.quiz1;
      if (marks.quiz2 !== null) features.quiz2 = marks.quiz2;
      if (marks.assignment1 !== null) features.assignment1 = marks.assignment1;
      if (marks.assignment2 !== null) features.assignment2 = marks.assignment2;
      if (marks.midterm_marks !== null) features.midterm_marks = marks.midterm_marks;
    }

    console.log("Features being sent to ML model:", features);

    // Send to Python model
    const response = await axios.post("http://localhost:5002/predict", features);
    res.json(response.data);
  } catch (err) {
    console.error("Prediction error:", err);
    res.status(500).json({ message: "Prediction failed", error: err.message });
  }
};


module.exports = { getPrediction };
