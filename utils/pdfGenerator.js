const puppeteer = require('puppeteer');

const companyInfo = {
  companyName: "PayTel Terminal Pvt Ltd.(Delhi)",
  addressLine1: "A-212, 1st Floor, Phase-3",
  addressLine2: "Okhla Industrial Area",
  cityPincode: "New Delhi-110020",
  gstin: "07AAMCP1524F1ZK",
  stateName: "Delhi",
  stateCode: "07",
  cin: "U74999DL2020PTC367460",
  email: "customercare@cloudedata.com",
  website: "www.cloudedata.com",
  bankAccountHolder: "PAYTEL TERMINAL PRIVATE LIMITED",
  bankName: "ICIC Bank",
  bankAccountNumber: "002105029512",
  bankBranch: "Defence Colony, Delhi-110020",
  bankIFSC: "ICIC0006300",
  declarationTerms: [
    "Support Other Than Cloud Services will not be Provided.",
    "For Software related query, Kindly Contact to the respected Software Company only.",
  ],
  governmentLaw: "This Agreement shall be governed by the laws of India, and any disputes shall fall under the exclusive jurisdiction of the courts at New Delhi.",
  jurisdiction: "DELHI",
};

const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' and ' + numberToWords(num % 100) : '');
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
  if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
  return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
};

const generatePdf = async (bill, client) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  
  const serviceNames = {
    ERP_ON_CLOUD: 'ERP On Cloud',
    RMS: 'RMS',
    FAIRWOOD: 'Fairwood'
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${bill.billNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Arial', sans-serif;
          font-size: 12px;
        }
        body {
          padding: 20px;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }
        .company-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .company-details {
          font-size: 11px;
          line-height: 1.4;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
        }
        .invoice-box {
          border: 1px solid #000;
          padding: 10px;
        }
        .invoice-box-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .bill-to {
          margin: 20px 0;
        }
        .section-title {
          font-weight: bold;
          margin-bottom: 10px;
          text-decoration: underline;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        th, td {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f0f0f0;
        }
        .amount-section {
          margin: 20px 0;
        }
        .amount-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        .bank-details {
          margin: 20px 0;
        }
        .declaration {
          margin: 20px 0;
        }
        .signature {
          margin-top: 40px;
          text-align: right;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="company-name">${companyInfo.companyName}</div>
          <div class="company-details">
            ${companyInfo.addressLine1}<br>
            ${companyInfo.addressLine2}<br>
            ${companyInfo.cityPincode}<br>
            GSTIN: ${companyInfo.gstin} | CIN: ${companyInfo.cin}<br>
            Email: ${companyInfo.email} | Website: ${companyInfo.website}
          </div>
        </div>

        <div class="invoice-header">
          <div class="invoice-box">
            <div class="invoice-box-title">Invoice Details</div>
            <div>Invoice No: ${bill.billNumber}</div>
            <div>Billing Date: ${new Date(bill.billingDate).toLocaleDateString()}</div>
            <div>Renewal Date: ${new Date(bill.renewalDate).toLocaleDateString()}</div>
            <div>Service: ${serviceNames[bill.service]}</div>
          </div>
        </div>

        <div class="bill-to">
          <div class="section-title">Bill To:</div>
          <div>Company: ${client.companyName}</div>
          <div>Representative: ${client.representativeName}</div>
          <div>Phone: ${client.phone}</div>
          <div>Email: ${client.email}</div>
          ${client.gstNumber ? `<div>GST: ${client.gstNumber}</div>` : ''}
          ${client.address ? `<div>Address: ${client.address}</div>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            ${bill.specifications.map(spec => `
              <tr>
                <td>${spec.key}</td>
                <td>${spec.value}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="amount-section">
          <div class="amount-row">
            <span><strong>Total Amount:</strong></span>
            <span>₹${bill.amount.toFixed(2)}</span>
          </div>
          <div class="amount-row">
            <span><strong>Amount in Words:</strong></span>
            <span>${numberToWords(Math.floor(bill.amount))} Rupees ${bill.amount % 1 > 0 ? `${Math.round((bill.amount % 1) * 100)} Paise` : 'Only'}</span>
          </div>
        </div>

        <div class="bank-details">
          <div class="section-title">Bank Details:</div>
          <div>Account Holder: ${companyInfo.bankAccountHolder}</div>
          <div>Bank Name: ${companyInfo.bankName}</div>
          <div>Account Number: ${companyInfo.bankAccountNumber}</div>
          <div>Branch: ${companyInfo.bankBranch}</div>
          <div>IFSC: ${companyInfo.bankIFSC}</div>
        </div>

        <div class="declaration">
          <div class="section-title">Declaration & Terms:</div>
          ${companyInfo.declarationTerms.map(term => `<div>- ${term}</div>`).join('')}
          <div style="margin-top: 10px;">${companyInfo.governmentLaw}</div>
          <div>Jurisdiction: ${companyInfo.jurisdiction}</div>
        </div>

        <div class="signature">
          <div>Authorized Signatory</div>
          <div style="margin-top: 50px; border-top: 1px solid #000; display: inline-block; padding-top: 5px;">PayTel Terminal Pvt Ltd</div>
        </div>
      </div>
    </body>
    </html>
  `;

  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
  });
  
  await browser.close();
  return pdfBuffer;
};

module.exports = { generatePdf };
