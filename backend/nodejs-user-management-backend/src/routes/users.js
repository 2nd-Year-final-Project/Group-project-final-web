const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');
const upload = require('../middleware/upload');

// Route for user signup
router.post('/signup', upload.single('idPhoto'), userController.signup);

// Route for retrieving user details
router.get('/:id', userController.getUserDetails);

// Route for admin to approve a pending user
router.post('/admin/approve/:id', adminController.approveUser);

// Route for admin to reject a pending user
router.post('/admin/reject/:id', adminController.rejectUser);

// Route for retrieving all pending users
router.get('/admin/pending', adminController.getPendingUsers);

module.exports = router;