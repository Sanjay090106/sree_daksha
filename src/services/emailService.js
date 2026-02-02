const Models = require('sib-api-v3-sdk');
const config = require('../config/config');

const defaultClient = Models.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = config.brevoApiKey;

const apiInstance = new Models.TransactionalEmailsApi();

/**
 * Send pay slip email with attachment
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} month - Pay month
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {string} filename - Name of the PDF file
 */
async function sendPaySlip(email, name, month, pdfBuffer, filename) {
    const sendSmtpEmail = new Models.SendSmtpEmail();

    sendSmtpEmail.subject = `Salary Slip – ${month}`;
    sendSmtpEmail.htmlContent = `<html><body>
    <p>Dear ${name},</p>
    <p>Please find attached your salary slip for the month of ${month}.</p>
    <p>Best Regards,<br>${config.companyName || 'HR Team'}</p>
  </body></html>`;

    sendSmtpEmail.sender = { "name": config.senderName, "email": config.senderEmail };
    sendSmtpEmail.to = [{ "email": email, "name": name }];

    // Attach PDF
    // Brevo expects content as base64 string
    sendSmtpEmail.attachment = [{
        content: pdfBuffer.toString('base64'),
        name: filename
    }];

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`[Brevo Response] Email sent to ${email}. Message ID: ${data.messageId}`);
        return { success: true, messageId: data.messageId };
    } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendPaySlip
};
