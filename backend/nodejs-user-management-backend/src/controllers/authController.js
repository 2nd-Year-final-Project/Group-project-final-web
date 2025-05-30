const PendingUser = require('../models/PendingUser');
const ApprovedUser = require('../models/ApprovedUser');
const emailService = require('../utils/emailService');
const usernameGenerator = require('../utils/usernameGenerator');
const passwordGenerator = require('../utils/passwordGenerator');

exports.signup = async (req, res) => {
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
        res.status(201).json({ message: 'Signup request submitted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting signup request.', error });
    }
};

exports.approveUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const pendingUser = await PendingUser.findById(userId);
        if (!pendingUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const username = usernameGenerator.generateUsername(pendingUser.fullName);
        const password = passwordGenerator.generatePassword();

        const approvedUser = new ApprovedUser({
            username,
            password,
            fullName: pendingUser.fullName,
            email: pendingUser.email,
            role: pendingUser.role
        });

        await approvedUser.save();
        await PendingUser.deleteOne({ _id: userId });

        await emailService.sendEmail(pendingUser.email, username, password);
        res.status(200).json({ message: 'User approved and notified.' });
    } catch (error) {
        res.status(500).json({ message: 'Error approving user.', error });
    }
};

exports.rejectUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const pendingUser = await PendingUser.findById(userId);
        if (!pendingUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        await PendingUser.deleteOne({ _id: userId });
        res.status(200).json({ message: 'User request rejected.' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting user.', error });
    }
};