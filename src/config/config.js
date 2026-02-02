require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  brevoApiKey: process.env.BREVO_API_KEY,
  senderEmail: process.env.BREVO_SENDER_EMAIL,
  senderName: process.env.BREVO_SENDER_NAME || 'Payroll System',
  companyName: process.env.COMPANY_NAME,
};
