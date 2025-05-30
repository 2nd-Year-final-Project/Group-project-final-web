const bcrypt = require("bcryptjs");

const db = require("../config/db");
const multer = require("multer");
const path = require("path");

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// User Registration Controller
const registerUser = (req, res) => {
  const { fullName, email, role } = req.body;
  const idCard = req.file ? req.file.filename : null;

  if (!fullName || !email || !role || !idCard) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = "INSERT INTO pending_users (full_name, email, role, id_card) VALUES (?, ?, ?, ?)";
  db.query(sql, [fullName, email, role, idCard], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    res.status(201).json({ message: "Registration submitted for approval" });
  });
};

// User Login Controller (Add this function)
const loginUser = (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Please provide both username and password." });
    }
  
    // Query the database to find the user by username
    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const user = results[0];
  
      // Compare the entered password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // Successfully authenticated, send back user data (including role)
      res.json({
        success: true,
        username: user.username,
        role: user.role, // Role: student or lecturer
        message: "Login successful",
      });
    });
  };

  module.exports = { registerUser, upload, loginUser };
