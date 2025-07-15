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
    text: `Hello ${name},\n\nYour account has been approved!\n\nLogin Credentials:\nUsername: ${username}\nPassword: ${password}\n\nPlease change your password after logging in.\n\nBest,\nAdmin Team`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

function sendAlertEmail(email, name, title, message, severity) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "akilafernando196@gmail.com",
      pass: "lkkl nfqk tgzt hrwu",
    },
  });

  const severityEmojis = {
    critical: "🚨",
    high: "⚠️",
    medium: "📊",
    low: "ℹ️"
  };

  const severityColors = {
    critical: "#ff4444",
    high: "#ff8800",
    medium: "#ffbb33",
    low: "#00C851"
  };

  let actionItems = '<li>Keep up the good work</li><li>Maintain your current study routine</li><li>Continue attending classes regularly</li>';
  
  if (severity === 'critical') {
    actionItems = '<li>Contact your lecturer immediately</li><li>Schedule a meeting with your academic advisor</li><li>Develop an immediate action plan</li>';
  } else if (severity === 'high') {
    actionItems = '<li>Review your study methods</li><li>Seek help from your lecturer or peers</li><li>Consider attending extra help sessions</li>';
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${severityColors[severity]}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .alert-badge { display: inline-block; padding: 5px 10px; background-color: ${severityColors[severity]}; color: white; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${severityEmojis[severity]} Student Performance Alert</h1>
            </div>
            <div class="content">
                <p>Hello ${name},</p>
                
                <div class="alert-badge">${severity.toUpperCase()} PRIORITY</div>
                
                <h2>${title}</h2>
                <p>${message}</p>
                
                <p><strong>What should you do next?</strong></p>
                <ul>
                    ${actionItems}
                </ul>
                
                <p>You can view more details and track your progress by logging into your student dashboard.</p>
                
                <p>Best regards,<br>Academic Performance System</p>
            </div>
            <div class="footer">
                <p>This is an automated message from the Student Performance Monitoring System.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: "akilafernando196@gmail.com",
    to: email,
    subject: `${severityEmojis[severity]} ${title}`,
    text: `${title}\n\n${message}\n\nBest regards,\nAcademic Performance System`,
    html: htmlContent
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending alert email:", error);
    } else {
      console.log("Alert email sent:", info.response);
    }
  });
}

module.exports = { sendApprovalEmail, sendAlertEmail };
