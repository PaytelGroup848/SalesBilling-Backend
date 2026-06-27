const express = require('express');
const router = express.Router();
const pdfController = require('./pdf.controller');
const { auth } = require('../../middleware/auth.middleware');

router.use(auth);
router.get('/:billId', pdfController.downloadPdf);

module.exports = router;
