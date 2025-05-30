const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const db = require('../db');

// Storage config
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// User registration
router.post('/signup', upload.single('id_photo'), (req, res) => {
  const { full_name, university_email, role } = req.body;
  const id_photo = req.file.filename;

  const sql = 'INSERT INTO pending_users (full_name, university_email, role, id_photo) VALUES (?, ?, ?, ?)';
  db.query(sql, [full_name, university_email, role, id_photo], (err) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.status(201).json({ message: 'Signup request submitted' });
  });
});


const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

// Helper to generate username and password
const generateUsername = (name) => {
  const first = name.split(' ')[0].toLowerCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${first}${rand}`;
};

const generatePassword = () => Math.random().toString(36).slice(-8);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Admin approval
router.post('/approve/:id', async (req, res) => {
  const userId = req.params.id;

  db.query('SELECT * FROM pending_users WHERE id = ?', [userId], async (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = results[0];
    const username = generateUsername(user.full_name);
    const passwordPlain = generatePassword();
    const hashedPassword = await bcrypt.hash(passwordPlain, 10);

    const insertSql = `
      INSERT INTO approved_users (full_name, university_email, role, username, password, id_photo)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(insertSql, [user.full_name, user.university_email, user.role, username, hashedPassword, user.id_photo], (err2) => {
      if (err2) return res.status(500).json({ message: 'Approval error', error: err2 });

      // Send Email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.university_email,
        subject: 'Account Approved - Your Login Credentials',
        text: `Hello ${user.full_name},\n\nYour account has been approved.\n\nUsername: ${username}\nPassword: ${passwordPlain}\n\nPlease log in and change your password.\n\nBest,\nTeam`
      };

      transporter.sendMail(mailOptions, (err3, info) => {
        if (err3) return res.status(500).json({ message: 'Email sending failed', error: err3 });

        // Delete from pending_users
        db.query('DELETE FROM pending_users WHERE id = ?', [userId]);
        res.status(200).json({ message: 'User approved and credentials sent' });
      });
    });
  });
});


router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM approved_users WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ message: 'Invalid username or password' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(401).json({ message: 'Invalid username or password' });

    res.status(200).json({ message: 'Login successful', user: { id: user.id, role: user.role, username: user.username } });
  });
});
