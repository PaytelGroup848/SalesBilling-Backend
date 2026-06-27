const express = require("express");
const router = express.Router();
const pdfController = require("./pdf.controller");

router.get("/:billId", pdfController.downloadPdf);

module.exports = router;
