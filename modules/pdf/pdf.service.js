const Bill = require('../bills/bill.model');
const { generatePdf } = require('../../utils/pdfGenerator');

const downloadPdf = async (billId) => {
  const bill = await Bill.findById(billId).populate('client');
  if (!bill) {
    throw new Error('Bill not found');
  }

  const pdfBuffer = await generatePdf(bill, bill.client);
  return { pdfBuffer, bill };
};

module.exports = { downloadPdf };
