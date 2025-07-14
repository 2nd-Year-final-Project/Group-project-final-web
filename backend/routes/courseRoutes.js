const express = require("express");
const router = express.Router();
const {
  getAllCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  getAllLecturers,
  getAllStudents,
  assignLecturerToCourse,
  removeLecturerFromCourse,
  enrollStudentInCourse,
  removeStudentFromCourse,
  getCourseAssignments
} = require("../controllers/courseController");

// Course management routes
router.get("/courses", getAllCourses);
router.post("/courses", addCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);

// User management routes for course assignment
router.get("/lecturers", getAllLecturers);
router.get("/students", getAllStudents);

// Course assignment routes
router.post("/assign-lecturer", assignLecturerToCourse);
router.delete("/assign-lecturer", removeLecturerFromCourse);

// Student enrollment routes
router.post("/enroll-student", enrollStudentInCourse);
router.delete("/enroll-student", removeStudentFromCourse);

// Get course assignments and enrollments
router.get("/courses/:courseId/assignments", getCourseAssignments);

module.exports = router;
