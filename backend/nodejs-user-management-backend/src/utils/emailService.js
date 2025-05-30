const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use your email service
        auth: {
            user: process.env.EMAIL_USER, // Your email address
            pass: process.env.EMAIL_PASS, // Your email password
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const sendCredentialsEmail = async (userEmail, username, password) => {
    const subject = 'Your Account Credentials';
    const text = `Hello,\n\nYour account has been approved. Here are your credentials:\n\nUsername: ${username}\nPassword: ${password}\n\nPlease log in to your account.\n\nBest regards,\nYour Team`;

    await sendEmail(userEmail, subject, text);
};

module.exports = {
    sendEmail,
    sendCredentialsEmail,
};