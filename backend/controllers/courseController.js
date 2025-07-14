const db = require("../config/db");

// Get all courses
const getAllCourses = (req, res) => {
  const sql = `
    SELECT c.*, 
           COUNT(DISTINCT lc.lecturer_id) as lecturer_count,
           COUNT(DISTINCT se.student_id) as student_count
    FROM courses c
    LEFT JOIN lecturer_courses lc ON c.id = lc.course_id
    LEFT JOIN student_enrollments se ON c.id = se.course_id AND se.status = 'active'
    GROUP BY c.id
    ORDER BY c.course_name
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    res.json(results);
  });
};

// Add new course
const addCourse = (req, res) => {
  const { course_code, course_name, description, credits, difficulty_level } = req.body;

  if (!course_code || !course_name) {
    return res.status(400).json({ message: "Course code and name are required" });
  }

  const sql = `
    INSERT INTO courses (course_code, course_name, description, credits, difficulty_level)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [course_code, course_name, description, credits || 3, difficulty_level || 'Medium'], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: "Course code already exists" });
      }
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    res.status(201).json({ message: "Course added successfully", courseId: result.insertId });
  });
};

// Update course
const updateCourse = (req, res) => {
  const { id } = req.params;
  const { course_code, course_name, description, credits, difficulty_level } = req.body;

  const sql = `
    UPDATE courses 
    SET course_code = ?, course_name = ?, description = ?, credits = ?, difficulty_level = ?
    WHERE id = ?
  `;

  db.query(sql, [course_code, course_name, description, credits, difficulty_level, id], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: "Course code already exists" });
      }
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    res.json({ message: "Course updated successfully" });
  });
};

// Delete course
const deleteCourse = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM courses WHERE id = ?";
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    res.json({ message: "Course deleted successfully" });
  });
};

// Get all lecturers (for assignment dropdown)
const getAllLecturers = (req, res) => {
  const sql = "SELECT id, username, full_name, email FROM users WHERE role = 'lecturer'";
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    res.json(results);
  });
};

// Get all students (for enrollment dropdown)
const getAllStudents = (req, res) => {
  const sql = "SELECT id, username, full_name, email FROM users WHERE role = 'student'";
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    res.json(results);
  });
};

// Assign lecturer to course
const assignLecturerToCourse = (req, res) => {
  const { lecturer_id, course_id } = req.body;

  if (!lecturer_id || !course_id) {
    return res.status(400).json({ message: "Lecturer ID and Course ID are required" });
  }

  const sql = "INSERT INTO lecturer_courses (lecturer_id, course_id) VALUES (?, ?)";
  
  db.query(sql, [lecturer_id, course_id], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: "Lecturer is already assigned to this course" });
      }
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    res.status(201).json({ message: "Lecturer assigned to course successfully" });
  });
};

// Remove lecturer from course
const removeLecturerFromCourse = (req, res) => {
  const { lecturer_id, course_id } = req.body;

  const sql = "DELETE FROM lecturer_courses WHERE lecturer_id = ? AND course_id = ?";
  
  db.query(sql, [lecturer_id, course_id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    
    res.json({ message: "Lecturer removed from course successfully" });
  });
};

// Enroll student in course
const enrollStudentInCourse = (req, res) => {
  const { student_id, course_id } = req.body;

  if (!student_id || !course_id) {
    return res.status(400).json({ message: "Student ID and Course ID are required" });
  }

  const sql = "INSERT INTO student_enrollments (student_id, course_id) VALUES (?, ?)";
  
  db.query(sql, [student_id, course_id], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: "Student is already enrolled in this course" });
      }
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    res.status(201).json({ message: "Student enrolled in course successfully" });
  });
};

// Bulk enroll multiple students in course
const bulkEnrollStudentsInCourse = (req, res) => {
  const { student_ids, course_id } = req.body;

  if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
    return res.status(400).json({ message: "Student IDs array is required and cannot be empty" });
  }

  if (!course_id) {
    return res.status(400).json({ message: "Course ID is required" });
  }

  // Prepare bulk insert values
  const values = student_ids.map(student_id => [student_id, course_id]);
  const sql = "INSERT IGNORE INTO student_enrollments (student_id, course_id) VALUES ?";
  
  db.query(sql, [values], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    
    const enrolledCount = result.affectedRows;
    const alreadyEnrolledCount = student_ids.length - enrolledCount;
    
    let message = `${enrolledCount} student(s) enrolled successfully`;
    if (alreadyEnrolledCount > 0) {
      message += `, ${alreadyEnrolledCount} student(s) were already enrolled`;
    }
    
    res.status(201).json({ 
      message,
      enrolled_count: enrolledCount,
      already_enrolled_count: alreadyEnrolledCount,
      total_processed: student_ids.length
    });
  });
};

// Remove student from course
const removeStudentFromCourse = (req, res) => {
  const { student_id, course_id } = req.body;

  const sql = "UPDATE student_enrollments SET status = 'dropped' WHERE student_id = ? AND course_id = ?";
  
  db.query(sql, [student_id, course_id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    
    res.json({ message: "Student removed from course successfully" });
  });
};

// Get course assignments for a specific course
const getCourseAssignments = (req, res) => {
  const { courseId } = req.params;
  
  const sql = `
    SELECT 
      'lecturer' as type,
      u.id,
      u.username,
      u.full_name,
      u.email,
      lc.assigned_at as date_assigned
    FROM lecturer_courses lc
    JOIN users u ON lc.lecturer_id = u.id
    WHERE lc.course_id = ?
    
    UNION ALL
    
    SELECT 
      'student' as type,
      u.id,
      u.username,
      u.full_name,
      u.email,
      se.enrollment_date as date_assigned
    FROM student_enrollments se
    JOIN users u ON se.student_id = u.id
    WHERE se.course_id = ? AND se.status = 'active'
    ORDER BY type, full_name
  `;
  
  db.query(sql, [courseId, courseId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    
    const lecturers = results.filter(r => r.type === 'lecturer');
    const students = results.filter(r => r.type === 'student');
    
    res.json({ lecturers, students });
  });
};

module.exports = {
  getAllCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  getAllLecturers,
  getAllStudents,
  assignLecturerToCourse,
  removeLecturerFromCourse,
  enrollStudentInCourse,
  bulkEnrollStudentsInCourse,
  removeStudentFromCourse,
  getCourseAssignments
};
