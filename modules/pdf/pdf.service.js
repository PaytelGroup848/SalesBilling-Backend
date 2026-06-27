const Bill = require("../bills/bill.model");
const { generatePdf } = require("../../utils/pdfGenerator");

const downloadPdf = async (billId) => {
  const bill = await Bill.findById(billId).populate("client");
  if (!bill) throw new Error("Bill not found");
  if (!bill.client) throw new Error("Client not found for this bill");

  const pdfBuffer = await generatePdf(bill, bill.client);

  return { pdfBuffer: Buffer.from(pdfBuffer), bill };
};

module.exports = { downloadPdf };
