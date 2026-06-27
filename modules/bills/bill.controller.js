const billService = require('./bill.service');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

const createBill = async (req, res) => {
  try {
    const bill = await billService.createBill(req.body, req.user.id);
    return successResponse(res, bill, 'Bill created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getBills = async (req, res) => {
  try {
    const result = await billService.getBills(req.query, req.user);
    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getBillById = async (req, res) => {
  try {
    const bill = await billService.getBillById(req.params.id);
    return successResponse(res, bill);
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

const updateBill = async (req, res) => {
  try {
    const bill = await billService.updateBill(req.params.id, req.body, req.user);
    return successResponse(res, bill, 'Bill updated successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const deleteBill = async (req, res) => {
  try {
    const result = await billService.deleteBill(req.params.id, req.user);
    return successResponse(res, result, 'Bill deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const submitBill = async (req, res) => {
  try {
    const bill = await billService.submitBill(req.params.id, req.user.id);
    return successResponse(res, bill, 'Bill submitted for approval successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const approveBill = async (req, res) => {
  try {
    const bill = await billService.approveBill(req.params.id, req.user.id);
    return successResponse(res, bill, 'Bill approved successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const rejectBill = async (req, res) => {
  try {
    const bill = await billService.rejectBill(req.params.id, req.user.id, req.body.reason);
    return successResponse(res, bill, 'Bill rejected successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const sendBillEmailToClient = async (req, res) => {
  try {
    const result = await billService.sendBillEmailToClient(req.params.id, req.user.id);
    return successResponse(res, result, 'Bill email sent successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
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
