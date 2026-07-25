const billService = require("./bill.service");
const { successResponse, errorResponse } = require("../../utils/apiResponse");
const billModel = require("./bill.model");

const createBill = async (req, res) => {
  try {
    const bill = await billService.createBill(req.body, req.user.id);
    return successResponse(res, bill, "Bill created successfully", 201);
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
    const bill = await billService.updateBill(
      req.params.id,
      req.body,
      req.user,
    );
    return successResponse(res, bill, "Bill updated successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const deleteBill = async (req, res) => {
  try {
    const result = await billService.deleteBill(req.params.id, req.user);
    return successResponse(res, result, "Bill deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const submitBill = async (req, res) => {
  try {
    const bill = await billService.submitBill(req.params.id, req.user.id);
    return successResponse(
      res,
      bill,
      "Bill submitted for approval successfully",
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const approveBill = async (req, res) => {
  try {
    const bill = await billService.approveBill(
      req.params.id,
      req.user.id,
      req.body.billNumber,
    );

    return successResponse(res, bill, "Bill approved successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const sendForCorrection = async (req, res) => {
  try {
    const bill = await billService.sendForCorrection(
      req.params.id,
      req.user.id,
      req.body.reason,
    );
    return successResponse(res, bill, "Bill sent for correction successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const sendBillEmailToClient = async (req, res) => {
  try {
    const result = await billService.sendBillEmailToClient(
      req.params.id,
      req.user.id,
    );
    return successResponse(res, result, "Bill email sent successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const stopRenewalAlerts = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const bill = await billModel.findById(id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    // Check if alerts can be stopped
    const today = new Date();
    const daysLeft = Math.ceil(
      (new Date(bill.renewalDate) - today) / (1000 * 60 * 60 * 24),
    );

    if (daysLeft > 7) {
      return res.status(400).json({
        success: false,
        message: "Alerts can only be stopped when renewal is within 7 days",
      });
    }

    if (bill.renewalAlertsStopped) {
      return res.status(400).json({
        success: false,
        message: "Alerts already stopped for this bill",
      });
    }

    // Stop alerts
    bill.renewalAlertsStopped = true;
    bill.renewalAlertsStoppedAt = new Date();
    bill.clientRenewed = true;
    bill.clientRenewedAt = new Date();
    await bill.save();

    res.json({
      success: true,
      message: "Renewal alerts stopped successfully",
      bill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get renewal alert status
const getRenewalAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await billModel.findById(id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    const today = new Date();
    const daysLeft = Math.ceil(
      (new Date(bill.renewalDate) - today) / (1000 * 60 * 60 * 24),
    );
    const canStopAlerts =
      daysLeft <= 7 && daysLeft >= 0 && !bill.renewalAlertsStopped;

    res.json({
      success: true,
      data: {
        daysLeft,
        alertsStopped: bill.renewalAlertsStopped,
        canStopAlerts,
        reminderSent: bill.reminderSent || [],
        clientRenewed: bill.clientRenewed,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
  sendForCorrection,
  sendBillEmailToClient,
  stopRenewalAlerts,
  getRenewalAlertStatus,
};
