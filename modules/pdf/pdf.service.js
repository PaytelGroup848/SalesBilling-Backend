const Bill = require("../bills/bill.model");
const { generatePdf } = require("../../utils/pdfGenerator");
const { sendBillEmail } = require("./email.service");

const downloadPdf = async (billId) => {
  const bill = await Bill.findById(billId).populate("client");
  if (!bill) throw new Error("Bill not found");
  if (!bill.client) throw new Error("Client not found for this bill");

  const pdfBuffer = await generatePdf(bill, bill.client);

  return { pdfBuffer: Buffer.from(pdfBuffer), bill };
};

// NEW: Download and send PDF via email
const downloadAndSendPdf = async (billId) => {
  const bill = await Bill.findById(billId).populate("client");
  if (!bill) throw new Error("Bill not found");
  if (!bill.client) throw new Error("Client not found for this bill");
  if (!bill.client.email) throw new Error("Client email is required");

  // Generate PDF
  console.log(`Generating PDF for bill: ${bill.billNumber}`);
  const pdfBuffer = await generatePdf(bill, bill.client);

  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error("PDF generation failed");
  }

  // Send email with PDF attachment
  console.log(` Sending invoice ${bill.billNumber} to ${bill.client.email}`);
  const emailResult = await sendBillEmail(bill, bill.client.email, pdfBuffer);

  return {
    pdfBuffer: Buffer.from(pdfBuffer),
    bill,
    emailResult,
  };
};

// NEW: Send PDF to a specific email
const sendPdfToEmail = async (billId, email) => {
  const bill = await Bill.findById(billId).populate("client");
  if (!bill) throw new Error("Bill not found");
  if (!bill.client) throw new Error("Client not found for this bill");

  // Generate PDF
  console.log(`Generating PDF for bill: ${bill.billNumber}`);
  const pdfBuffer = await generatePdf(bill, bill.client);

  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error("PDF generation failed");
  }

  // Send email with PDF attachment to specified email
  console.log(`Sending invoice ${bill.billNumber} to ${email}`);
  const emailResult = await sendBillEmail(bill, email, pdfBuffer);

  return {
    pdfBuffer: Buffer.from(pdfBuffer),
    bill,
    emailResult,
  };
};

module.exports = {
  downloadPdf,
  downloadAndSendPdf,
  sendPdfToEmail,
};
