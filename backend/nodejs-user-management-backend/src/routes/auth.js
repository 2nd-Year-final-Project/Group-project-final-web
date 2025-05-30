const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/upload');

// Route for user signup
router.post('/signup', upload.single('idPhoto'), authController.signup);

// Route for user login
router.post('/login', authController.login);

module.exports = router;