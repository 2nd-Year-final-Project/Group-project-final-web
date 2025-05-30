const PendingUser = require('../models/PendingUser');
const ApprovedUser = require('../models/ApprovedUser');
const usernameGenerator = require('../utils/usernameGenerator');
const passwordGenerator = require('../utils/passwordGenerator');
const emailService = require('../utils/emailService');

// Create a new user
exports.createUser = async (req, res) => {
    const { fullName, email, role } = req.body;
    const idPhoto = req.file.path;

    try {
        const newUser = new PendingUser({
            fullName,
            email,
            role,
            idPhoto,
            status: 'pending'
        });

        await newUser.save();
        res.status(201).json({ message: 'User signup request submitted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user.', error });
    }
};

// Approve a pending user
exports.approveUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const pendingUser = await PendingUser.findById(userId);
        if (!pendingUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const username = usernameGenerator(pendingUser.fullName);
        const password = passwordGenerator();
        
        const approvedUser = new ApprovedUser({
            username,
            password,
            fullName: pendingUser.fullName,
            email: pendingUser.email,
            role: pendingUser.role
        });

        await approvedUser.save();
        await PendingUser.findByIdAndDelete(userId);

        await emailService.sendEmail(pendingUser.email, username, password);
        res.status(200).json({ message: 'User approved successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error approving user.', error });
    }
};

// Reject a pending user
exports.rejectUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const pendingUser = await PendingUser.findById(userId);
        if (!pendingUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        await PendingUser.findByIdAndDelete(userId);
        res.status(200).json({ message: 'User rejected successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting user.', error });
    }
};