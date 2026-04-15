const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email
 * @param {Object} options - { to, subject, html, text }
 */
exports.sendEmail = async (options) => {
  // If no SMTP config, just log (development mode)
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
    console.log(`📧 [MOCK EMAIL] To: ${options.to} | Subject: ${options.subject}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'Eventify'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    console.log(`📧 Email sent to ${options.to}`);
  } catch (err) {
    console.error('Email error:', err.message);
    // Don't throw — email failure shouldn't break the flow
  }
};
