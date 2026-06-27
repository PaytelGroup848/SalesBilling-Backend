const puppeteer = require("puppeteer");

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
  bankName: "ICICI Bank",
  bankAccountNumber: "002105029512",
  bankBranch: "Defence Colony, Delhi-110020",
  bankIFSC: "ICICI0006300",
  declarationTerms: [
    "Support Other Than Cloud Services will not be Provided.",
    "For Software related query, Kindly Contact to the respected Software Company only.",
    "Governing Law & Jurisdiction.",
    "This Agreement shall be governed by the laws of India, and any disputes shall fall under the exclusive jurisdiction of the courts at New Delhi.",
  ],
  governmentLaw:
    "Please refer to Page 2 for the Terms & Conditions applicable to this invoice. The attached Terms & Conditions form an integral part of this invoice.",
  jurisdiction: "DELHI",
};

// HSN codes per service
const SERVICE_HSN = {
  ERP_ON_CLOUD: "998315",
  RMS: "998315",
  FAIRWOOD: "998314",
};

const SERVICE_NAMES = {
  ERP_ON_CLOUD: "ERP On Cloud",
  RMS: "RMS (Restaurant Management System)",
  FAIRWOOD: "Fairwood",
};

const GST_RATE = 18; // 18% GST

// ---------- Number to Words (Indian system) ----------
const numberToWords = (num) => {
  if (num === 0) return "Zero";
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  if (num < 20) return ones[num];
  if (num < 100)
    return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
  if (num < 1000)
    return (
      ones[Math.floor(num / 100)] +
      " Hundred" +
      (num % 100 ? " and " + numberToWords(num % 100) : "")
    );
  if (num < 100000)
    return (
      numberToWords(Math.floor(num / 1000)) +
      " Thousand" +
      (num % 1000 ? " " + numberToWords(num % 1000) : "")
    );
  if (num < 10000000)
    return (
      numberToWords(Math.floor(num / 100000)) +
      " Lakh" +
      (num % 100000 ? " " + numberToWords(num % 100000) : "")
    );
  return (
    numberToWords(Math.floor(num / 10000000)) +
    " Crore" +
    (num % 10000000 ? " " + numberToWords(num % 10000000) : "")
  );
};

const amountInWords = (amount) => {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let words = numberToWords(rupees) + " Rupees";
  if (paise > 0) words += " and " + numberToWords(paise) + " Paise";
  words += " Only";
  return words;
};

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

// ---------- Terms & Conditions (condensed key points) ----------
const termsAndConditionsPage1 = [
  {
    title: "Scope of Services",
    points: [
      "Cloudedata shall provide secure, cloud-hosted access to its Accounting ERP solution, including storage and management of the Client's accounting data on its dedicated servers.",
    ],
  },
];

const termsAndConditions = [
  {
    title: "Data Responsibility & Security",
    points: [
      "Cloudedata takes full responsibility for uptime, access, and safeguarding of the Client's ERP data. In the event of a cyber-attack or malicious intrusion, Cloudedata shall restore the most recent verified backup to resume operations. Cloudedata shall not be liable beyond the point of the last backup.",
    ],
  },
  {
    title: "Client Conduct & Liability",
    points: [
      "The Client agrees to maintain responsible, lawful, and respectful usage of the provided services. The Client shall be solely liable for any misconduct, abuse, or inappropriate behavior—whether verbal, written, or digital—by themselves or their authorized users toward Cloudedata's personnel or systems. Cloudedata reserves the right to suspend or terminate services in such cases.",
    ],
  },
  {
    title: "Data Access & Client Control",
    points: [
      "Cloudedata shall have no right to access, view, or alter any of the Client's data stored on the cloud platform or within the designated folders assigned to the Client. The Client shall have full and independent control over their data, including the ability to copy, paste, and delete any files or folders within their allocated space. Cloudedata does not interfere with or modify client data under any circumstances. Accordingly, the entire responsibility for managing the data, including copying, pasting, editing, or deletion, lies solely with the Client or members of the Client",
    ],
  },
  {
    title: "Malicious File Policy",
    points: [
      "Uploading or executing any malicious, harmful, or unauthorized files is strictly prohibited. If such actions result in data loss, damage, or service interruption, the Client shall be fully liable for the total loss, and Cloudedata may recover the full cost of the damage.",
    ],
  },
  {
    title: "Backup Policy",
    points: [
      "Data is backed up at regular intervals (e.g., daily). In the event of data loss, the latest backup will be restored within 6–24 hours.",
    ],
  },
  {
    title: "Server Maintenance & Downtime",
    points: [
      "Cloudedata reserves the right to initiate emergency server maintenance at any time in case of a critical issue. The Client will be given at least one (1) hour's prior notice.",
    ],
  },
  {
    title: "Support Availability",
    points: [
      "Support is available only during working hours (Monday to Saturday, 10:00 AM – 7:30 PM IST). No after-hours, weekend, or holiday support is provided. All support will be provided strictly on a ticket basis. Tickets will be generated via our official support portal or by sending an email to the designated support email address.",
    ],
  },
  {
    title: "No Refund Policy",
    points: [
      "All fees paid to Cloudedata are non-refundable under any circumstances, including but not limited to cancellation, discontinuation, dissatisfaction, or downtime caused by third-party or client-side issues.",
    ],
  },
  {
    title: "Fees & Payment",
    points: [
      "The Client agrees to pay the billing amount as mentioned in the invoice according to the selected Plan and Billing Period.",
    ],
  },
  {
    title: "Term, Renewal & Termination",
    points: [
      "This Agreement shall be automatically renewed with each service renewal unless either party provides 30 days' written notice. Upon termination, data will be made available for export for 2–3 days.",
    ],
  },
  {
    title: "Governing Law & Jurisdiction",
    points: [
      "This Agreement shall be governed by the laws of India, and any disputes shall fall under the exclusive jurisdiction of the courts at New Delhi.",
      "By digitally signing this Agreement, the Client confirms having read, understood, and agreed to all the terms and conditions above.",
    ],
  },
];

// ---------- Generate HTML ----------
const generateHTML = (bill, client) => {
  const baseAmount = parseFloat(bill.amount) || 0;
  const gstAmount = parseFloat(((baseAmount * GST_RATE) / 100).toFixed(2));
  const totalAmount = parseFloat((baseAmount + gstAmount).toFixed(2));
  const hsnCode = SERVICE_HSN[bill.service] || "998315";
  const serviceName = SERVICE_NAMES[bill.service] || bill.service;

  // Build specs rows — exclude Amount, Billing date, Renewal date from table (shown separately)
  const excludedKeys = [
    "amount",
    "billing date",
    "renewal date",
    "billingdate",
    "renewaldate",
  ];
  const specRows = bill.specifications
    .filter(
      (s) => !excludedKeys.includes(s.key.toLowerCase().replace(/\s/g, "")),
    )
    .map(
      (s) => `
      <tr>
        <td style="border:1px solid #ccc;padding:7px 10px;font-size:11px;">${s.key}</td>
        <td style="border:1px solid #ccc;padding:7px 10px;font-size:11px;">${s.value || "—"}</td>
      </tr>`,
    )
    .join("");

  const Page1termsHTML = termsAndConditionsPage1
    .map(
      (section) => `
      <div style="margin-bottom:10px;">
        <div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.3px;">${section.title}</div>
        <ul style="margin:0;padding-left:18px;">
          ${section.points.map((p) => `<li style="font-size:10.5px;color:#334155;line-height:1.6;margin-bottom:3px;">${p}</li>`).join("")}
        </ul>
      </div>`,
    )
    .join("");

  // Terms HTML
  const termsHTML = termsAndConditions
    .map(
      (section) => `
      <div style="margin-bottom:10px;">
        <div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.3px;">${section.title}</div>
        <ul style="margin:0;padding-left:18px;">
          ${section.points.map((p) => `<li style="font-size:10.5px;color:#334155;line-height:1.6;margin-bottom:3px;">${p}</li>`).join("")}
        </ul>
      </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${bill.billNumber}</title>
  <style>
    @page { size: A4; margin: 0; }
    * { margin:0; padding:0; box-sizing:border-box; font-family: Arial, sans-serif; }

    body { background:#fff; color:#1e293b; }

    /* ===== PAGE 1 ===== */
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 5mm 14mm 0mm  14mm;
      position: relative;
      page-break-after: always;
      overflow: hidden;
    }
    .page:last-child { page-break-after: avoid; }

    .invoice-header {
  position: relative;

  padding-bottom: 6px;
  margin-bottom: 5px;
  min-height: 30px;
}

.page::before {
  content: "";
  position: absolute;

  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-20deg);

  width: 120mm;   /* Adjust as needed */
  height: 120mm;

  background: url("https://cloudedata.com/Cloudedata.svg") no-repeat center;
  background-size: contain;

  opacity: 0.2;      /* 0.02 - 0.08 looks best */
  z-index: 0;

  pointer-events: none;
}

/* Everything else should stay above watermark */
.page > * {
  position: relative;
  z-index: 1;
}

.company-logo {
  position: absolute;
  top: 0;
  left: 0;
  width: 92px;     
  height: auto;
}

.invoice-title {
  text-align: center;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #1e293b;
  line-height: 42px; /* Vertically align with logo */
}

    /* Header */
  /*  .invoice-title {
      text-align:center;
      font-size:15px;
      font-weight:700;
      letter-spacing:1px;
      text-transform:uppercase;
      color:#1e293b;
      margin-bottom:8px;
      padding-bottom:6px;
      border-bottom:2px solid #1e293b;
    } */

    /* Top info grid */
    .top-grid {
      display:grid;
      grid-template-columns: 1fr 1fr;
      gap:0;
      border:1px solid #ccc;
      margin-bottom:0;
    }
    .top-grid .cell {
      padding:8px 10px;
      font-size:10.5px;
      line-height:1.55;
    }
    .top-grid .cell.border-right { border-right:1px solid #ccc; }
    .top-grid .cell.border-bottom { border-bottom:1px solid #ccc; }
    .company-name-top {
      font-size:13px;
      font-weight:700;
      color:#1e293b;
      margin-bottom:3px;
    }
    .label-sm {
      font-size:9.5px;
      font-weight:700;
      color:#64748b;
      text-transform:uppercase;
      letter-spacing:0.3px;
    }
    .value-md {
      font-size:11.5px;
      font-weight:700;
      color:#1e293b;
    }

    /* Bill To */
    .bill-to-section {
      border:1px solid #ccc;
      border-top:none;
      padding:4px 6px;
      font-size:10.5px;
      line-height:1.4;
    }
    .section-head {
      font-size:10px;
      font-weight:700;
      text-transform:uppercase;
      color:#64748b;
      letter-spacing:0.4px;
      margin-bottom:4px;
    }
    .buyer-name {
      font-size:13px;
      font-weight:700;
      color:#1e293b;
    }

    /* Service + Specs Table */
    .specs-table {
      width:100%;
      border-collapse:collapse;
      margin-top:8px;
      font-size:11px;
    }
    .specs-table thead tr {
      background:#f1f5f9;
    }
    .specs-table th {
      border:1px solid #ccc;
      padding:7px 10px;
      text-align:left;
      font-size:10px;
      font-weight:700;
      color:#475569;
      text-transform:uppercase;
      letter-spacing:0.3px;
    }
    .specs-table td {
      border:1px solid #ccc;
      padding:7px 10px;
      font-size:11px;
      color:#1e293b;
    }
    .specs-table tr:nth-child(even) td { background:#f8fafc; }

    /* Amount section */
    .amount-box {
      border:1px solid #ccc;
      border-top:none;
    }
    .amount-row {
      display:flex;
      justify-content:space-between;
      align-items:center;
      padding:6px 10px;
      font-size:11px;
      border-bottom:1px solid #f1f5f9;
    }
    .amount-row:last-child { border-bottom:none; }
    .amount-row.total-row {
      background:#EBEBEB;
      color:#000000;
      font-weight:700;
      font-size:12px;
    }
    .amount-row.words-row {
      font-size:10.5px;
      font-style:italic;
      color:#475569;
      background:#f8fafc;
    }

    /* Tax table */
    .tax-table {
      width:100%;
      border-collapse:collapse;
      margin-top:8px;
      font-size:10.5px;
    }
    .tax-table th {
      border:1px solid #ccc;
      padding:6px 10px;
      background:#f1f5f9;
      font-size:9.5px;
      font-weight:700;
      text-transform:uppercase;
      color:#475569;
      text-align:center;
    }
    .tax-table td {
      border:1px solid #ccc;
      padding:6px 10px;
      text-align:center;
      color:#1e293b;
    }

    /* Bank Details */
    .bank-section {
      margin-top:8px;
      border:1px solid #ccc;
      padding:8px 10px;
      font-size:10.5px;
      line-height:1.7;
    }
    .bank-grid {
      display:grid;
      grid-template-columns:160px 1fr;
      gap:2px 8px;
      font-size:10.5px;
    }
    .bank-key { color:#64748b; font-size:10px; }
    .bank-val { font-weight:600; color:#1e293b; }

    /* Signature row */
    .sig-row {
      display:flex;
      justify-content:space-between;
      margin-top:10px;
      font-size:10.5px;
    }
    .sig-box {
      text-align:center;
      width:180px;
    }
  

    /* Footer p1 */
  .page1-footer {
  position: absolute;
  left: 14mm;
  right: 14mm;
  bottom: 10mm;

  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
  font-size: 9.5px;
  color: #94a3b8;
  text-align: center;
  line-height: 1.5;
}

    /* ===== PAGE 2 - Terms ===== */
    .terms-page {
      width:210mm;
      height:297mm;
      padding:14mm 14mm 14mm 14mm;
      position: relative;
      overflow: hidden;
  page-break-after: avoid;
  box-sizing: border-box;
    }
    .terms-title {
      font-size:12px;
      font-weight:700;
      color:#1e293b;
      text-transform:uppercase;
      letter-spacing:0.5px;
      margin-bottom:2px;
      padding-bottom:4px;
      margin-top:7px;
     border-bottom:1px solid #D5D5D5
; 
    }
    .terms-subtitle {
      font-size:10px;
      color:#64748b;
      margin-bottom:8px;
    }

    .terms-page::before {
  content: "";
  position: absolute;

  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-20deg);

  width: 120mm;
  height: 120mm;

  background: url("https://cloudedata.com/Cloudedata.svg") no-repeat center;
  background-size: contain;

  opacity: 0.2;
  z-index: 0;

  pointer-events: none;
}

.terms-page > * {
  position: relative;
  z-index: 1;
}

  .terms-footer {
  position: absolute;
  left: 14mm;
  right: 14mm;
  bottom: 4mm;

  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
  font-size: 9.5px;
  color: #64748b;
  text-align: center;
  line-height: 1.6;
}
  </style>
</head>
<body>

<!-- ==================== PAGE 1: INVOICE ==================== -->
<div class="page">

     <div class="invoice-header">
    <img
      class="company-logo"
      src="https://cloudedata.com/Cloudedata.svg"
      alt="CloudeData Logo"
    />

    <div class="invoice-title">Tax Invoice</div>
  </div>

  <!-- Top grid: Company info + Invoice details -->
  <div class="top-grid">
    <!-- Left: Company -->
    <div class="cell border-right border-bottom">
      <div class="company-name-top">${companyInfo.companyName}</div>
      <div>${companyInfo.addressLine1}, ${companyInfo.addressLine2}</div>
      <div>${companyInfo.cityPincode}</div>
      <div>GSTIN: <strong>${companyInfo.gstin}</strong></div>
      <div>State: ${companyInfo.stateName} | Code: ${companyInfo.stateCode}</div>
      <div>CIN: ${companyInfo.cin}</div>
      <div>Email: ${companyInfo.email}</div>
      <div>Website: ${companyInfo.website}</div>
    </div>
    <!-- Right: Invoice meta -->
    <div class="cell border-bottom">
      <div style="margin-bottom:6px;">
        <div class="label-sm">Invoice No.</div>
        <div class="value-md">${bill.billNumber}</div>
      </div>
      <div style="margin-bottom:6px;">
        <div class="label-sm">Billing Date</div>
        <div class="value-md">${new Date(bill.billingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
      </div>
      <div style="margin-bottom:6px;">
        <div class="label-sm">Renewal Date</div>
        <div class="value-md">${new Date(bill.renewalDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
      </div>
      <div>
        <div class="label-sm">Service</div>
        <div class="value-md">${serviceName}</div>
      </div>
    </div>
  </div>

  <!-- Bill To -->
  <div class="bill-to-section">
    <div class="section-head">Bill To</div>
    <div class="buyer-name">${client.companyName}</div>
    <div>Representative: <strong>${client.representativeName}</strong></div>
    ${client.phone ? `<div>Phone: ${client.phone}</div>` : ""}
    ${client.email ? `<div>Email: ${client.email}</div>` : ""}
    ${client.gstNumber ? `<div>GSTIN: <strong>${client.gstNumber}</strong></div>` : ""}
    ${client.address ? `<div>Address: ${client.address}</div>` : ""}
  </div>

  <!-- Specifications Table -->

  <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:11px;">
    <thead>
      <tr style="background:#F1F5F9;">
        <th style="border:1px solid #aaa;padding:5px 6px;text-align:center;width:5%;font-size:10px;">Sl<br>No.</th>
        <th style="border:1px solid #aaa;padding:5px 6px;text-align:center;width:36%;font-size:10px;">Description of<br>Services</th>
        <th style="border:1px solid #aaa;padding:5px 6px;text-align:center;width:7%;font-size:10px;">GST<br>Rate</th>
        <th style="border:1px solid #aaa;padding:5px 6px;text-align:center;width:10%;font-size:10px;">Quantity</th>
        <th style="border:1px solid #aaa;padding:5px 6px;text-align:right;width:12%;font-size:10px;">Rate</th>
        <th style="border:1px solid #aaa;padding:5px 6px;text-align:center;width:6%;font-size:10px;">per</th>
        <th style="border:1px solid #aaa;padding:5px 6px;text-align:right;width:14%;font-size:10px;">Amount</th>
      </tr>
    </thead>
    <tbody>

      <!-- Row 1: Main service — bold -->
      <tr>
        <td style="border-left:1px solid #aaa;border-right:1px solid #aaa;padding:5px 6px;text-align:center;font-size:11px;">1</td>
        <td style="border-right:1px solid #aaa;padding:5px 6px;">
          <div style="font-weight:700;font-size:11px;">${serviceName}</div>
          <div style="font-size:10px;color:#555;">From ${new Date(bill.billingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })} to ${new Date(bill.renewalDate).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}</div>
        </td>
        <td style="border-right:1px solid #aaa;padding:5px 6px;text-align:center;font-size:11px;">${GST_RATE}%</td>
        <td style="border-right:1px solid #aaa;padding:5px 6px;text-align:center;font-size:11px;">
          ${(() => {
            const qSpec = bill.specifications.find(
              (s) => s.key.toLowerCase() === "quantity",
            );
            return qSpec ? qSpec.value + " No." : "1 No.";
          })()}
        </td>
        <td style="border-right:1px solid #aaa;padding:5px 6px;text-align:right;font-size:11px;">${formatINR(baseAmount)}</td>
        <td style="border-right:1px solid #aaa;padding:5px 6px;text-align:center;font-size:11px;">No.</td>
        <td style="border-right:1px solid #aaa;padding:5px 6px;text-align:right;font-weight:700;font-size:11px;">${formatINR(baseAmount)}</td>
      </tr>

      <!-- Sub-rows: specs (exclude qty, amount, dates) — indented, no border between them -->
      ${bill.specifications
        .filter(
          (s) =>
            ![
              "quantity",
              "amount",
              "billing date",
              "renewal date",
              "billingdate",
              "renewaldate",
            ].includes(s.key.toLowerCase().replace(/\s/g, "")),
        )
        .map(
          (s) => `
        <tr >
          <td style="border-left:1px solid #aaa;border-right:1px solid #aaa;padding:3px 6px;"></td>
          <td style="border-right:1px solid #aaa;padding:3px 6px 3px 18px;font-size:10.5px;color:#333;">
            ${s.key}${s.value ? " - " + s.value : ""}
          </td>
          <td style="border-right:1px solid #aaa;"></td>
          <td style="border-right:1px solid #aaa;"></td>
          <td style="border-right:1px solid #aaa;"></td>
          <td style="border-right:1px solid #aaa;"></td>
          <td style="border-right:1px solid #aaa;"></td>
        </tr>`,
        )
        .join("")}

      <!-- Empty filler rows to push IGST down (like Tally) -->
      ${Array(6)
        .fill(
          `
        <tr style="height:18px;">
          <td style="border-left:1px solid #aaa;border-right:1px solid #aaa;"></td>
          <td style="border-right:1px solid #aaa;"></td>
          <td style="border-right:1px solid #aaa;"></td>
          <td style="border-right:1px solid #aaa;"></td>
          <td style="border-right:1px solid #aaa;"></td>
          <td style="border-right:1px solid #aaa;"></td>
          <td style="border-right:1px solid #aaa;"></td>
        </tr>`,
        )
        .join("")}

      <!-- IGST row -->
      <tr>
        <td style="border-left:1px solid #aaa;border-right:1px solid #aaa;border-top:1px solid #aaa;"></td>
        <td style="border-right:1px solid #aaa;border-top:1px solid #aaa;padding:5px 6px;text-align:right;font-size:10.5px;color:#333;">
          IGST Output-${GST_RATE}% (${companyInfo.stateName})
        </td>
        <td style="border-right:1px solid #aaa;border-top:1px solid #aaa;"></td>
        <td style="border-right:1px solid #aaa;border-top:1px solid #aaa;"></td>
        <td style="border-right:1px solid #aaa;border-top:1px solid #aaa;padding:5px 6px;text-align:center;font-size:10.5px;">${GST_RATE}</td>
        <td style="border-right:1px solid #aaa;border-top:1px solid #aaa;padding:5px 6px;text-align:center;font-size:10.5px;">%</td>
        <td style="border-right:1px solid #aaa;border-top:1px solid #aaa;padding:5px 6px;text-align:right;font-size:10.5px;">${formatINR(gstAmount)}</td>
      </tr>

      <!-- Round Off row -->
      <tr>
        <td style="border-left:1px solid #aaa;border-right:1px solid #aaa;"></td>
        <td style="border-right:1px solid #aaa;padding:3px 6px;text-align:right;font-size:10.5px;color:#333;">Round Off</td>
        <td style="border-right:1px solid #aaa;"></td>
        <td style="border-right:1px solid #aaa;"></td>
        <td style="border-right:1px solid #aaa;"></td>
        <td style="border-right:1px solid #aaa;"></td>
        <td style="border-right:1px solid #aaa;padding:3px 6px;text-align:right;font-size:10.5px;">
          ${(() => {
            const rounded = Math.round(totalAmount);
            const diff = rounded - totalAmount;
            return (diff >= 0 ? "+" : "") + formatINR(diff);
          })()}
        </td>
      </tr>

      <!-- Total row -->
      <tr style="background:#F1F5F9;border-top:2px solid #aaa;">
        <td style="border:1px solid #aaa;padding:6px;"></td>
        <td style="border:1px solid #aaa;padding:6px;font-weight:700;font-size:11px;">Total</td>
        <td style="border:1px solid #aaa;"></td>
        <td style="border:1px solid #aaa;padding:6px;text-align:center;font-weight:700;font-size:11px;">
          ${(() => {
            const qSpec = bill.specifications.find(
              (s) => s.key.toLowerCase() === "quantity",
            );
            return qSpec ? qSpec.value + " No." : "1 No.";
          })()}
        </td>
        <td style="border:1px solid #aaa;"></td>
        <td style="border:1px solid #aaa;"></td>
        <td style="border:1px solid #aaa;padding:6px;text-align:right;font-weight:700;font-size:12px;">₹ ${formatINR(Math.round(totalAmount))}</td>
      </tr>

    </tbody>
  </table>

  <!-- Amount in Words row (below table, Tally style) -->
  <div style="border:1px solid #aaa;border-top:none;display:flex;justify-content:space-between;padding:5px 8px;font-size:10.5px;background:#F1F5F9;">
    <span><strong>Amount Chargeable (in words):</strong> &nbsp; INR ${amountInWords(Math.round(totalAmount))}</span>
    <span style="color:#555;font-style:italic;">E. &amp; O.E.</span>
  </div>

  <!-- GST / Tax Breakup Table -->
  <table class="tax-table">
    <thead>
      <tr>
        <th>HSN/SAC</th>
        <th>Taxable Value (₹)</th>
        <th>IGST Rate</th>
        <th>IGST Amount (₹)</th>
        <th>Total Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${hsnCode}</td>
        <td>${formatINR(baseAmount)}</td>
        <td>${GST_RATE}%</td>
        <td>${formatINR(gstAmount)}</td>
        <td><strong>${formatINR(totalAmount)}</strong></td>
      </tr>
    </tbody>
  </table>

  <!-- Amount Breakup Box -->
  <div class="amount-box" style="margin-top:0;">
    <div class="amount-row">
      <span>Taxable Amount (Before GST)</span>
      <span>₹ ${formatINR(baseAmount)}</span>
    </div>
    <div class="amount-row">
      <span>IGST @ ${GST_RATE}%</span>
      <span>₹ ${formatINR(gstAmount)}</span>
    </div>
    <div class="amount-row total-row">
      <span>Total Amount Payable</span>
      <span>₹ ${formatINR(totalAmount)}</span>
    </div>
  </div>

<!-- Bank Details + Signature -->

<!-- Bank Details -->
<div style="margin-top:8px;border:1px solid #aaa;padding:10px 14px;page-break-inside:avoid;">
  <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.4px;margin-bottom:6px;">
    Company's Bank Details
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 20px;font-size:10.5px;">
    <div style="display:flex;gap:8px;">
      <span style="color:#64748b;font-size:10px;min-width:100px;">Account Holder</span>
      <span style="font-weight:600;color:#1e293b;">: ${companyInfo.bankAccountHolder}</span>
    </div>
    <div style="display:flex;gap:8px;">
      <span style="color:#64748b;font-size:10px;min-width:100px;">Account No.</span>
      <span style="font-weight:600;color:#1e293b;">: ${companyInfo.bankAccountNumber}</span>
    </div>
    <div style="display:flex;gap:8px;">
      <span style="color:#64748b;font-size:10px;min-width:100px;">Bank Name</span>
      <span style="font-weight:600;color:#1e293b;">: ${companyInfo.bankName}</span>
    </div>
    <div style="display:flex;gap:8px;">
      <span style="color:#64748b;font-size:10px;min-width:100px;">Branch</span>
      <span style="font-weight:600;color:#1e293b;">: ${companyInfo.bankBranch}</span>
    </div>
    <div style="display:flex;gap:8px;">
      <span style="color:#64748b;font-size:10px;min-width:100px;">IFSC Code</span>
      <span style="font-weight:600;color:#1e293b;">: ${companyInfo.bankIFSC}</span>
    </div>
  </div>
</div>

 <div class="terms-title" >Terms &amp; Conditions</div>
  <div class="terms-subtitle">
    Invoice No: <strong>${bill.billNumber}</strong> &nbsp;|&nbsp;
    ${companyInfo.companyName} &nbsp;|&nbsp;
    ${companyInfo.website}
  </div>
  ${Page1termsHTML}

  <!-- Page 1 Footer -->
 <div class="page1-footer" style="position:static;padding-top:8px;border-top:1px solid #e2e8f0;font-size:9.5px;color:#94a3b8;text-align:center;line-height:1.5; page-break-inside:avoid;">
    <strong>SUBJECT TO ${companyInfo.jurisdiction} JURISDICTION</strong> &nbsp;|&nbsp;
    This is a System Generated Invoice |&nbsp; Page 1 of 2
  </div>
</div>



<!-- ==================== PAGE 2: TERMS & CONDITIONS ==================== -->
<div class="terms-page">
 

  ${termsHTML}

  <div class="terms-footer">
  <strong>${companyInfo.companyName}</strong><br>
  ${companyInfo.addressLine1}, ${companyInfo.addressLine2}, ${companyInfo.cityPincode}<br>
  Email: ${companyInfo.email} &nbsp;|&nbsp; Website: ${companyInfo.website}<br>
  GSTIN: ${companyInfo.gstin} &nbsp;|&nbsp; CIN: ${companyInfo.cin}<br><br>
  <strong>SUBJECT TO ${companyInfo.jurisdiction} JURISDICTION</strong>
  &nbsp;|&nbsp; Page 2 of 2
</div>
</div>

</body>
</html>`;
};

// ---------- Main export ----------
const generatePdf = async (bill, client) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    const html = generateHTML(bill, client);

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
};

module.exports = { generatePdf };
