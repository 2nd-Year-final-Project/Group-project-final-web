const express = require("express");
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { sendApprovalEmail } = require("../utils/emailService"); // Import email sender
const router = express.Router();
const { 
  submitAdminInput,
  getAllStudentsForAdmin,
  getStudentEnrolledCourses,
  updateStudentMotivation,
  updateStudentAttendance,
  getAllLecturersForAdmin,
  getSystemStats
} = require("../controllers/adminController");

// Import course management routes
const courseRoutes = require("./courseRoutes");

// Use course management routes under /admin prefix
router.use("/", courseRoutes);

// New routes for student and lecturer management
router.get("/students-management", getAllStudentsForAdmin);
router.get("/students/:studentId/courses", getStudentEnrolledCourses);
router.post("/students/motivation", updateStudentMotivation);
router.post("/students/attendance", updateStudentAttendance);
router.get("/lecturers-management", getAllLecturersForAdmin);
router.get("/system-stats", getSystemStats);

// Original admin input route
router.post("/admin-input", submitAdminInput);


// Get all pending users
router.get("/pending-users", (req, res) => {
  db.query(
    "SELECT id, full_name, email, role, id_card FROM pending_users WHERE status = 'pending'",
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.json(results);
    }
  );
});

// Approve user with username generation & email notification
router.post("/approve/:id", async (req, res) => {
  const userId = req.params.id;

  db.query("SELECT * FROM pending_users WHERE id = ?", [userId], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];

    // Extract first name & generate a username
    const firstName = user.full_name.split(" ")[0].toLowerCase();
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    const username = `${firstName}${randomNumber}`;

    // Use fixed password for easy testing
    const plainPassword = "123456";

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Insert user into users table
    db.query(
      "INSERT INTO users (username, full_name, email, role, password) VALUES (?, ?, ?, ?, ?)",
      [username, user.full_name, user.email, user.role, hashedPassword],
      (err) => {
        if (err) {
          return res.status(500).json({ message: "Error adding user to system" });
        }

        // Delete user from pending_users
        db.query("DELETE FROM pending_users WHERE id = ?", [userId], (deleteErr) => {
          if (deleteErr) {
            return res.status(500).json({ message: "Error deleting pending user" });
          }

          // Send email with login credentials
          sendApprovalEmail(user.email, user.full_name, username, plainPassword);

          res.json({ message: "User approved, credentials sent via email" });
        });
      }
    );
  });
});

// Reject user
router.post("/reject/:id", (req, res) => {
  const userId = req.params.id;
  db.query("UPDATE pending_users SET status = 'rejected' WHERE id = ?", [userId], (err) => {
    if (err) return res.status(500).json({ message: "Error rejecting user" });

    res.json({ message: "User rejected" });
  });
});

router.post("/input", submitAdminInput);


module.exports = router;
