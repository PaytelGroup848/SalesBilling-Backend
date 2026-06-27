const axios = require('axios');

const sendEmail = async (to, subject, htmlContent, attachments = []) => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: process.env.FROM_NAME,
          email: process.env.FROM_EMAIL,
        },
        to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
        subject,
        htmlContent,
        attachments,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending email via Brevo:', error.response?.data || error.message);
    throw new Error('Failed to send email');
  }
};

const sendBillEmail = async (bill, clientEmail, pdfBuffer) => {
  const subject = `Invoice ${bill.billNumber}`;
  const htmlContent = `
    <p>Dear ${bill.client.representativeName},</p>
    <p>Please find attached invoice ${bill.billNumber}.</p>
    <p>Regards,<br>${process.env.FROM_NAME}</p>
  `;
  
  const attachments = [
    {
      content: pdfBuffer.toString('base64'),
      name: `${bill.billNumber}.pdf`,
      type: 'application/pdf',
    },
  ];
  
  return sendEmail(clientEmail, subject, htmlContent, attachments);
};

module.exports = { sendEmail, sendBillEmail };
