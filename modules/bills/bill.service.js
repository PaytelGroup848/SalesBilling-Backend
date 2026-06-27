const Bill = require('./bill.model');
const Client = require('../clients/client.model');
const { ROLES } = require('../../constants/roles');
const { generatePdf } = require('../../utils/pdfGenerator');
const { sendBillEmail } = require('../../utils/email');

const generateBillNumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}-`;
  
  const latestBill = await Bill.findOne({ billNumber: { $regex: `^${prefix}` } })
    .sort({ billNumber: -1 });
  
  let nextNumber = 1;
  if (latestBill) {
    const latestNumber = parseInt(latestBill.billNumber.split('-')[2]);
    nextNumber = latestNumber + 1;
  }
  
  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

const createBill = async (billData, userId) => {
  const client = await Client.findById(billData.clientId);
  if (!client) {
    throw new Error('Client not found');
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
    status: 'draft',
  });

  await bill.save();
  return bill.populate('client createdBy approvedBy rejectedBy');
};

const getBills = async (query, user) => {
  const { page = 1, limit = 10, search, status, service, startDate, endDate } = query;
  const filter = {};

  if (user.role === ROLES.SALES) {
    filter.createdBy = user.id;
  } else if (user.role === ROLES.ACCOUNTANT) {
    filter.status = { $in: ['pending_approval', 'approved', 'rejected'] };
  }

  if (search) {
    const clientIds = await Client.find({
      companyName: { $regex: search, $options: 'i' },
    }).distinct('_id');
    
    filter.$or = [
      { billNumber: { $regex: search, $options: 'i' } },
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

  const total = await Bill.countDocuments(filter);
  const bills = await Bill.find(filter)
    .populate('client', 'companyName email representativeName phone')
    .populate('createdBy', 'name email')
    .populate('approvedBy', 'name email')
    .populate('rejectedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  return {
    bills,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
  };
};

const getBillById = async (id) => {
  const bill = await Bill.findById(id)
    .populate('client')
    .populate('createdBy', 'name email')
    .populate('approvedBy', 'name email')
    .populate('rejectedBy', 'name email');
  
  if (!bill) {
    throw new Error('Bill not found');
  }
  return bill;
};

const updateBill = async (id, updateData, user) => {
  const bill = await Bill.findById(id);
  if (!bill) {
    throw new Error('Bill not found');
  }

  if (user.role === ROLES.SALES) {
    if (bill.createdBy.toString() !== user.id) {
      throw new Error('Not authorized to update this bill');
    }
    if (!['draft', 'rejected'].includes(bill.status)) {
      throw new Error('Can only update bills in draft or rejected status');
    }
  }

  const updatedBill = await Bill.findByIdAndUpdate(id, updateData, { new: true })
    .populate('client createdBy approvedBy rejectedBy');
  return updatedBill;
};

const deleteBill = async (id, user) => {
  const bill = await Bill.findById(id);
  if (!bill) {
    throw new Error('Bill not found');
  }

  if (user.role === ROLES.SALES) {
    if (bill.createdBy.toString() !== user.id) {
      throw new Error('Not authorized to delete this bill');
    }
    if (bill.status !== 'draft') {
      throw new Error('Can only delete draft bills');
    }
  }

  await Bill.findByIdAndDelete(id);
  return { message: 'Bill deleted successfully' };
};

const submitBill = async (id, userId) => {
  const bill = await Bill.findById(id);
  if (!bill) {
    throw new Error('Bill not found');
  }

  if (bill.createdBy.toString() !== userId) {
    throw new Error('Not authorized to submit this bill');
  }

  if (bill.status !== 'draft') {
    throw new Error('Only draft bills can be submitted');
  }

  bill.status = 'pending_approval';
  await bill.save();
  return bill.populate('client createdBy approvedBy rejectedBy');
};

const approveBill = async (id, userId) => {
  const bill = await Bill.findById(id);
  if (!bill) {
    throw new Error('Bill not found');
  }

  if (bill.status !== 'pending_approval') {
    throw new Error('Only pending approval bills can be approved');
  }

  bill.status = 'approved';
  bill.approvedBy = userId;
  bill.approvedAt = new Date();
  await bill.save();
  return bill.populate('client createdBy approvedBy rejectedBy');
};

const rejectBill = async (id, userId, reason) => {
  const bill = await Bill.findById(id);
  if (!bill) {
    throw new Error('Bill not found');
  }

  if (bill.status !== 'pending_approval') {
    throw new Error('Only pending approval bills can be rejected');
  }

  bill.status = 'rejected';
  bill.rejectedBy = userId;
  bill.rejectedAt = new Date();
  bill.rejectionReason = reason;
  await bill.save();
  return bill.populate('client createdBy approvedBy rejectedBy');
};

const sendBillEmailToClient = async (id, userId) => {
  const bill = await Bill.findById(id).populate('client');
  if (!bill) {
    throw new Error('Bill not found');
  }

  if (bill.createdBy.toString() !== userId) {
    throw new Error('Not authorized to send this bill');
  }

  if (bill.status !== 'approved') {
    throw new Error('Only approved bills can be sent');
  }

  const pdfBuffer = await generatePdf(bill, bill.client);
  await sendBillEmail(bill, bill.client.email, pdfBuffer);

  bill.emailSentAt = new Date();
  await bill.save();
  return { message: 'Bill email sent successfully' };
};

module.exports = {
  createBill,
  getBills,
  getBillById,
  updateBill,
  deleteBill,
  submitBill,
  approveBill,
  rejectBill,
  sendBillEmailToClient,
};
