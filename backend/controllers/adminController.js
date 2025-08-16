const db = require("../config/db");

// Admin submits attendance (legacy function - kept for compatibility)
const submitAdminInput = (req, res) => {
  const { student_id, course_id, attendance } = req.body;

  const sql = `INSERT INTO admin_inputs 
    (student_id, course_id, attendance)
    VALUES (?, ?, ?)`;

  db.query(sql, [student_id, course_id, attendance], (err) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    res.json({ message: "Admin input submitted successfully." });
  });
};

// Get all students with their basic info for admin management
const getAllStudentsForAdmin = (req, res) => {
  const sql = `
    SELECT 
      u.id, 
      u.username, 
      u.full_name, 
      u.email,
      scd.motivation_level
    FROM users u
    LEFT JOIN student_common_data scd ON u.id = scd.student_id
    WHERE u.role = 'student'
    ORDER BY u.full_name
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    
    // Set default motivation_level to "Medium" (2) if not set by admin
    const studentsWithDefaults = results.map(student => ({
      ...student,
      motivation_level: student.motivation_level !== null ? student.motivation_level : 2
    }));
    
    res.json(studentsWithDefaults);
  });
};

// Get student's enrolled courses for attendance management
const getStudentEnrolledCourses = (req, res) => {
  const { studentId } = req.params;

  const sql = `
    SELECT 
      c.id as course_id,
      c.course_code,
      c.course_name,
      se.enrollment_date,
      ai.attendance
    FROM student_enrollments se
    JOIN courses c ON se.course_id = c.id
    LEFT JOIN admin_inputs ai ON se.student_id = ai.student_id AND se.course_id = ai.course_id
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

// Update student motivation level in student_common_data table
const updateStudentMotivation = (req, res) => {
  const { student_id, motivation_level } = req.body;

  // Map motivation level text to numeric value
  const motivationMap = {
    'high': 0,
    'low': 1,
    'medium': 2
  };
  
  const motivationValue = motivationMap[motivation_level.toLowerCase()] !== undefined 
    ? motivationMap[motivation_level.toLowerCase()] 
    : parseInt(motivation_level);

  // Check if student common data exists
  const checkSql = "SELECT id FROM student_common_data WHERE student_id = ?";
  
  db.query(checkSql, [student_id], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).json({ message: "Database error", error: checkErr.message });
    }

    if (checkResults.length > 0) {
      // Update existing data
      const updateSql = `
        UPDATE student_common_data 
        SET motivation_level = ?
        WHERE student_id = ?
      `;
      
      db.query(updateSql, [motivationValue, student_id], (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ message: "Database error", error: updateErr.message });
        }
        res.json({ message: "Student motivation level updated successfully." });
      });
    } else {
      // Insert new data with default values for other fields
      const insertSql = `
        INSERT INTO student_common_data 
        (student_id, motivation_level, gender, peer_influence, extracurricular_activities, physical_activity, sleep_hours)
        VALUES (?, ?, NULL, NULL, NULL, NULL, NULL)
      `;

      db.query(insertSql, [student_id, motivationValue], (insertErr) => {
        if (insertErr) {
          return res.status(500).json({ message: "Database error", error: insertErr.message });
        }
        res.json({ message: "Student motivation level set successfully." });
      });
    }
  });
};

// Update student attendance for a specific course
const updateStudentAttendance = (req, res) => {
  const { student_id, course_id, attendance } = req.body;

  // Validate attendance percentage
  if (attendance < 0 || attendance > 100) {
    return res.status(400).json({ message: "Attendance must be between 0 and 100 percent" });
  }

  // Check if admin input already exists for this student and course
  const checkSql = "SELECT id FROM admin_inputs WHERE student_id = ? AND course_id = ?";
  
  db.query(checkSql, [student_id, course_id], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).json({ message: "Database error", error: checkErr.message });
    }

    if (checkResults.length > 0) {
      // Update existing attendance
      const updateSql = `
        UPDATE admin_inputs 
        SET attendance = ?
        WHERE student_id = ? AND course_id = ?
      `;
      
      db.query(updateSql, [attendance, student_id, course_id], (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ message: "Database error", error: updateErr.message });
        }
        res.json({ message: "Student attendance updated successfully." });
      });
    } else {
      // Insert new attendance record
      const insertSql = `
        INSERT INTO admin_inputs 
        (student_id, course_id, attendance)
        VALUES (?, ?, ?)
      `;

      db.query(insertSql, [student_id, course_id, attendance], (insertErr) => {
        if (insertErr) {
          return res.status(500).json({ message: "Database error", error: insertErr.message });
        }
        res.json({ message: "Student attendance recorded successfully." });
      });
    }
  });
};

// Get all lecturers with course count for admin panel
const getAllLecturersForAdmin = (req, res) => {
  const sql = `
    SELECT 
      u.id, 
      u.username, 
      u.full_name, 
      u.email,
      COUNT(DISTINCT lc.course_id) as course_count
    FROM users u
    LEFT JOIN lecturer_courses lc ON u.id = lc.lecturer_id
    WHERE u.role = 'lecturer'
    GROUP BY u.id, u.username, u.full_name, u.email
    ORDER BY u.full_name
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    
    res.json(results);
  });
};

// Get system statistics for admin dashboard
const getSystemStats = (req, res) => {
  const queries = [
    "SELECT COUNT(*) as count FROM users WHERE role = 'student'",
    "SELECT COUNT(*) as count FROM users WHERE role = 'lecturer'", 
    "SELECT COUNT(*) as count FROM courses"
  ];

  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results[0].count);
      });
    })
  ))
  .then(([totalStudents, totalLecturers, activeCourses]) => {
    res.json({
      totalStudents,
      totalLecturers,
      activeCourses,
      pendingVerifications: 0 // This will be updated by the frontend when pending users are fetched
    });
  })
  .catch(err => {
    console.error("Error fetching system stats:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  });
};

module.exports = { 
  submitAdminInput,
  getAllStudentsForAdmin,
  getStudentEnrolledCourses,
  updateStudentMotivation,
  updateStudentAttendance,
  getAllLecturersForAdmin,
  getSystemStats
};
