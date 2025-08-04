const nodemailer = require("nodemailer");

function sendApprovalEmail(email, name, username, password) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "akilafernando196@gmail.com", // Use your email
      pass: "lkkl nfqk tgzt hrwu",  // Use an App Password (not your real password)
    },
  });

  const mailOptions = {
    from: "akilafernando196@gmail.com",
    to: email,
    subject: "Your Account Has Been Approved",
    text: `Hello ${name},\n\nWe are pleased to inform you that your account has been approved!\n\nLogin Credentials:\nUsername: ${username}\nPassword: ${password}\n\nFor security reasons, please make sure to change your password after logging in.\n\nBest regards,\nAdmin Team`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

module.exports = { sendApprovalEmail };
