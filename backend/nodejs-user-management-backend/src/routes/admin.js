const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Route to get all pending users
router.get('/pending-users', adminController.getPendingUsers);

// Route to approve a pending user
router.post('/approve-user/:id', adminController.approveUser);

// Route to reject a pending user
router.post('/reject-user/:id', adminController.rejectUser);

module.exports = router;