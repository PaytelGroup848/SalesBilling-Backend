const Bill = require("./bill.model");
const Client = require("../clients/client.model");
const User = require("../users/user.model");
const { ROLES } = require("../../constants/roles");
const { generatePdf } = require("../../utils/pdfGenerator");
const { sendBillEmail } = require("../../utils/email");


const INVOICE_PREFIX = "PFTPL";
const INVOICE_START_NUMBER = 450; 


const getFinancialYear = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = January
  const startYear = month >= 3 ? year : year - 1;
  return `${String(startYear).slice(-2)}-${String(startYear + 1).slice(-2)}`;
};

const generateBillNumber = async () => {
  const financialYear = getFinancialYear();
  const prefix = `${INVOICE_PREFIX}/${financialYear}/`;


  const bills = await Bill.find({
    billNumber: { $regex: `^${prefix}` },
  }).select("billNumber");

  let maxNumber = 0;

  for (const b of bills) {
    const num = parseInt(b.billNumber.split("/")[2], 10);
    if (!Number.isNaN(num) && num > maxNumber) {
      maxNumber = num;
    }
  }


  const nextNumber = Math.max(INVOICE_START_NUMBER, maxNumber + 1);

  return `${prefix}${String(nextNumber).padStart(4, "0")}`;
};

const createBill = async (billData, userId) => {
  const client = await Client.findById(billData.clientId);
  if (!client) {
    throw new Error("Client not found");
  }

  const billNumber = await generateBillNumber();

  const bill = new Bill({
    billNumber,
    client: billData.clientId,
    createdBy: userId,
    service: billData.service,
    specifications: billData.specifications,
    billingDate: billData.billingDate,
    renewalDate: billData.renewalDate,
    amount: billData.amount,
    remark: billData.remark || "",
    status: "draft",
    parentBill: billData.parentBillId || undefined,
  });

  await bill.save();

  if (billData.parentBillId) {
    await Bill.findByIdAndUpdate(
      billData.parentBillId,
      {
        $set: {
          renewed: true,
          renewedAt: new Date(),
        },
      },
      { new: true },  
    );
  }

  return bill.populate("client createdBy approvedBy correctionBy");
};

const getBills = async (query, user) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    service,
    startDate,
    endDate,
    renewalStartDate,
    renewalEndDate,
    renewalFilter, // 'today', 'this_week', 'this_month'
    billingDateFilter,
    billingStartDate,
    billingEndDate,
    salesPerson,
    client,
  } = query;
  const filter = {};

  if (client) {
    filter.client = client;
  }

  if (user.role === ROLES.SALES) {
    filter.createdBy = user.id;
  } else if (salesPerson) {
    filter.createdBy = salesPerson;
  } else if (user.role === ROLES.ACCOUNTANT) {
    filter.status = { $in: ["pending_approval", "approved", "correction"] };
  }

  if (search) {
    const clientIds = await Client.find({
      $or: [
        { companyName: { $regex: search, $options: "i" } },
        { representativeName: { $regex: search, $options: "i" } },
      ],
    }).distinct("_id");

    filter.$or = [
      { billNumber: { $regex: search, $options: "i" } },
      { client: { $in: clientIds } },
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (service) {
    filter.service = service;
  }

  if (startDate || endDate) {
    filter.billingDate = {};
    if (startDate) filter.billingDate.$gte = new Date(startDate);
    if (endDate) filter.billingDate.$lte = new Date(endDate);
  }

  // Billing date filters (NEW)
  if (billingStartDate || billingEndDate) {
    filter.billingDate = filter.billingDate || {};
    if (billingStartDate) filter.billingDate.$gte = new Date(billingStartDate);
    if (billingEndDate) filter.billingDate.$lte = new Date(billingEndDate);
  } else if (billingDateFilter) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (billingDateFilter === "today") {
      filter.billingDate = {
        $gte: today,
        $lt: tomorrow,
      };
    } else if (billingDateFilter === "this_week") {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      filter.billingDate = {
        $gte: weekStart,
        $lt: weekEnd,
      };
    } else if (billingDateFilter === "this_month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      filter.billingDate = {
        $gte: monthStart,
        $lt: monthEnd,
      };
    }
  }

  // Renewal date filters
  if (renewalStartDate || renewalEndDate) {
    filter.renewalDate = {};
    if (renewalStartDate) filter.renewalDate.$gte = new Date(renewalStartDate);
    if (renewalEndDate) filter.renewalDate.$lte = new Date(renewalEndDate);
  } else if (renewalFilter) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (renewalFilter === "today") {
      filter.renewalDate = {
        $gte: today,
        $lt: tomorrow,
      };
    } else if (renewalFilter === "this_week") {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      filter.renewalDate = {
        $gte: weekStart,
        $lt: weekEnd,
      };
    } else if (renewalFilter === "this_month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      filter.renewalDate = {
        $gte: monthStart,
        $lt: monthEnd,
      };
    }
  }

  const total = await Bill.countDocuments(filter);
  const bills = await Bill.find(filter)
    .populate("client")
    .populate("createdBy", "name email")
    .populate("approvedBy", "name email")
    .populate("correctionBy", "name email")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const salesPersons = await User.find(
    { role: ROLES.SALES },
    "name email"
  );

  const allClientBillCounts = await Bill.aggregate([
    { $group: { _id: '$client', count: { $sum: 1 } } },
    { $match: { count: { $gte: 2 } } },
  ]);
  const clientsWithMultipleBills = allClientBillCounts.map((c) => c._id.toString());

  return {
    bills,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
    salesPersons,
    clientsWithMultipleBills,
  };
};

const getBillById = async (id) => {
  const bill = await Bill.findById(id)
    .populate("client")
    .populate("createdBy", "name email")
    .populate("approvedBy", "name email")
    .populate("correctionBy", "name email");

  if (!bill) {
    throw new Error("Bill not found");
  }
  return bill;
};

const updateBill = async (id, updateData, user) => {
  const bill = await Bill.findById(id);
  if (!bill) {
    throw new Error("Bill not found");
  }

  if (user.role === ROLES.SALES) {
    if (bill.createdBy.toString() !== user.id) {
      throw new Error("Not authorized to update this bill");
    }
    if (!["draft", "correction"].includes(bill.status)) {
      throw new Error("Can only update bills in draft or correction status");
    }
  }

  const updatedBill = await Bill.findByIdAndUpdate(id, updateData, {
    new: true,
  }).populate("client createdBy approvedBy correctionBy");
  return updatedBill;
};

const updateRemark = async (id, data, user) => {
  const bill = await Bill.findById(id);
  if (!bill) {
    throw new Error("Bill not found");
  }

  const canEditSalesRemark = [ROLES.SALES, ROLES.SUPERADMIN].includes(
    user.role,
  );
  const canEditAccountantRemark = [ROLES.ACCOUNTANT, ROLES.SUPERADMIN].includes(
    user.role,
  );

  if (data.remark !== undefined && canEditSalesRemark) {
    bill.remark = String(data.remark).trim();
  }

  if (data.accountantRemark !== undefined && canEditAccountantRemark) {
    bill.accountantRemark = String(data.accountantRemark).trim();
  }

  await bill.save();
  return bill.populate("client createdBy approvedBy correctionBy");
};

const deleteBill = async (id, user) => {
  const bill = await Bill.findById(id);
  if (!bill) {
    throw new Error("Bill not found");
  }

  if (user.role === ROLES.SALES) {
    if (bill.createdBy.toString() !== user.id) {
      throw new Error("Not authorized to delete this bill");
    }
    if (bill.status !== "draft") {
      throw new Error("Can only delete draft bills");
    }
  }

  await Bill.findByIdAndDelete(id);
  return { message: "Bill deleted successfully" };
};

const submitBill = async (id, userId) => {
  const bill = await Bill.findById(id);
  if (!bill) {
    throw new Error("Bill not found");
  }

  if (bill.createdBy.toString() !== userId) {
    throw new Error("Not authorized to submit this bill");
  }

  if (!["draft", "correction"].includes(bill.status)) {
    throw new Error("Only draft or correction bills can be submitted");
  }

  bill.status = "pending_approval";
  await bill.save();
  return bill.populate("client createdBy approvedBy correctionBy");
};

const approveBill = async (id, userId, billNumber, remark) => {
  const bill = await Bill.findById(id);

  if (!bill) {
    throw new Error("Bill not found");
  }

  if (bill.status !== "pending_approval") {
    throw new Error("Only pending approval bills can be approved");
  }

  // optional remark added by accountant while approving (stored separately)
  if (remark !== undefined && remark !== null) {
    bill.accountantRemark = String(remark).trim();
  }

  // if accountant changed invoice number
  if (
    billNumber &&
    billNumber.trim() !== "" &&
    bill.billNumber !== billNumber
  ) {
    const exists = await Bill.findOne({
      billNumber,
      _id: { $ne: id },
    });

    if (exists) {
      throw new Error("Invoice number already exists");
    }

    bill.billNumber = billNumber;
  }

  bill.status = "approved";
  bill.approvedBy = userId;
  bill.approvedAt = new Date();

  await bill.save();

  return bill.populate("client createdBy approvedBy correctionBy");
};

const sendForCorrection = async (id, userId, reason) => {
  const bill = await Bill.findById(id);
  if (!bill) {
    throw new Error("Bill not found");
  }

  if (bill.status !== "pending_approval") {
    throw new Error("Only pending approval bills can be sent for correction");
  }

  bill.status = "correction";
  bill.correctionBy = userId;
  bill.correctionAt = new Date();
  bill.correctionReason = reason;
  await bill.save();
  return bill.populate("client createdBy approvedBy correctionBy");
};

const sendBillEmailToClient = async (id, userId) => {
  const bill = await Bill.findById(id).populate("client");

  if (!bill) {
    throw new Error("Bill not found");
  }

  if (!bill.client?.email) {
    throw new Error("Client email not found");
  }

  // Draft -> Proforma Invoice
  if (bill.status === "draft") {
    if (bill.proformaSentAt) {
      throw new Error("Proforma Invoice has already been sent.");
    }

    const pdfBuffer = await generatePdf(bill, bill.client);

    await sendBillEmail(bill, bill.client.email, pdfBuffer);

    bill.proformaSentAt = new Date();
    bill.proformaSentBy = userId;

    await bill.save();

    return {
      message: "Proforma Invoice sent successfully.",
    };
  }

  // Approved -> Tax Invoice
  if (bill.status === "approved") {
    if (bill.emailSentAt) {
      throw new Error("Invoice has already been sent.");
    }

    const pdfBuffer = await generatePdf(bill, bill.client);

    await sendBillEmail(bill, bill.client.email, pdfBuffer);

    bill.emailSentAt = new Date();

    await bill.save();

    return {
      message: "Invoice sent successfully.",
    };
  }

  throw new Error("Only Draft or Approved invoices can be sent.");
};

module.exports = {
  createBill,
  getBills,
  getBillById,
  updateBill,
  updateRemark,
  deleteBill,
  submitBill,
  approveBill,
  sendForCorrection,
  sendBillEmailToClient,
};
