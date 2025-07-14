const express = require("express");
const { 
  getStudentCourses,
  getStudentCourseDetails,
  submitCommonData, 
  submitSubjectData,
  getStudentName 
} = require("../controllers/studentController");

const router = express.Router();

// Get student's enrolled courses
router.get("/courses/:studentId", getStudentCourses);

// Get detailed course information
router.get("/courses/:studentId/:courseId", getStudentCourseDetails);

// Get student name
router.get("/name/:username", getStudentName);

// Submit data
router.post("/common", submitCommonData);
router.post("/subject", submitSubjectData);

module.exports = router;
