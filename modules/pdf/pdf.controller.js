const pdfService = require("./pdf.service");
const { errorResponse } = require("../../utils/apiResponse");

const downloadPdf = async (req, res) => {
  try {
    const { pdfBuffer, bill } = await pdfService.downloadPdf(req.params.billId);

    const buffer = Buffer.isBuffer(pdfBuffer)
      ? pdfBuffer
      : Buffer.from(pdfBuffer);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${bill.billNumber}.pdf"`,
    );
    res.setHeader("Content-Length", buffer.length);
    res.end(buffer);
  } catch (error) {
    console.error("PDF error:", error);
    return errorResponse(res, error.message);
  }
};

module.exports = { downloadPdf };
