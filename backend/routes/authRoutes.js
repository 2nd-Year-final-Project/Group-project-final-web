const express = require("express");
const { registerUser, upload, loginUser } = require("../controllers/authController");

const router = express.Router();

// User Registration Route (Handles file upload)
router.post("/register", upload.single("idCard"), registerUser);

// User Login Route (Add this line for login functionality)
router.post("/login", loginUser);  // This is the new login route

module.exports = router;
