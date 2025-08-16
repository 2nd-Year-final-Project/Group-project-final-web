const express = require("express");
const { 
  getLecturerCourses, 
  getCourseStudents, 
  getAtRiskStudents, 
  submitMarks 
} = require("../controllers/lecturerController");

const router = express.Router();

// Get lecturer's assigned courses
router.get("/courses/:lecturerId", getLecturerCourses);

// Get students in a specific course
router.get("/courses/:courseId/students", getCourseStudents);

// Get at-risk students for a lecturer
router.get("/at-risk/:lecturerId", getAtRiskStudents);

// Submit marks
router.post("/marks", submitMarks);

module.exports = router;
