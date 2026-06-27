const pdfService = require('./pdf.service');
const { errorResponse } = require('../../utils/apiResponse');

const downloadPdf = async (req, res) => {
  try {
    const { pdfBuffer, bill } = await pdfService.downloadPdf(req.params.billId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${bill.billNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = { downloadPdf };
