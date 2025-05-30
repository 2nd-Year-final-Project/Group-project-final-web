const PendingUser = require('../models/PendingUser');
const ApprovedUser = require('../models/ApprovedUser');
const emailService = require('../utils/emailService');
const usernameGenerator = require('../utils/usernameGenerator');
const passwordGenerator = require('../utils/passwordGenerator');

// Function to review pending user requests
exports.reviewPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await PendingUser.findAll();
        res.status(200).json(pendingUsers);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving pending users', error });
    }
};

// Function to approve a user request
exports.approveUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const pendingUser = await PendingUser.findByPk(userId);
        if (!pendingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const username = usernameGenerator.generateUsername(pendingUser.fullName);
        const password = passwordGenerator.generatePassword();

        const approvedUser = await ApprovedUser.create({
            username,
            password,
            fullName: pendingUser.fullName,
            email: pendingUser.email,
            role: pendingUser.role,
        });

        // Send email with username and password
        await emailService.sendApprovalEmail(pendingUser.email, username, password);

        // Remove from pending users
        await PendingUser.destroy({ where: { id: userId } });

        res.status(200).json({ message: 'User approved successfully', approvedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error approving user', error });
    }
};

// Function to reject a user request
exports.rejectUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const pendingUser = await PendingUser.findByPk(userId);
        if (!pendingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove from pending users
        await PendingUser.destroy({ where: { id: userId } });

        res.status(200).json({ message: 'User rejected successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting user', error });
    }
};