const clientService = require("./client.service");
const { successResponse, errorResponse } = require("../../utils/apiResponse");
const clientModel = require("./client.model");
const Bill = require("../bills/bill.model");
const createClient = async (req, res) => {
  try {
    const client = await clientService.createClient(req.body, req.user.id);
    return successResponse(res, client, "Client created successfully", 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getClients = async (req, res) => {
  try {
    const result = await clientService.getClients(req.query, req.user);
    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getClientById = async (req, res) => {
  try {
    const client = await clientService.getClientById(req.params.id);
    return successResponse(res, client);
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

const updateClient = async (req, res) => {
  try {
    const client = await clientService.updateClient(
      req.params.id,
      req.body,
      req.user,
    );
    return successResponse(res, client, "Client updated successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const deleteClient = async (req, res) => {
  try {
    const result = await clientService.deleteClient(req.params.id);
    return successResponse(res, result, "Client deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getClientsWithoutBills = async (req, res) => {
  try {
    const user = req.user;

    let filter = {};

    const allClients = await clientModel
      .find(filter)
      .populate("createdBy", "name email");

    const bills = await Bill.find({}, "client");
    const clientIdsWithBills = new Set(
      bills.map((bill) => bill.client.toString()),
    );

    const clientsWithoutBills = allClients.filter(
      (client) => !clientIdsWithBills.has(client._id.toString()),
    );

    const totalClients = allClients.length;
    const clientsWithBills = totalClients - clientsWithoutBills.length;

    res.json({
      success: true,
      data: {
        clients: clientsWithoutBills,
        summary: {
          totalClients,
          clientsWithBills,
          clientsWithoutBills: clientsWithoutBills.length,
          percentageWithoutBills: (
            (clientsWithoutBills.length / totalClients) *
            100
          ).toFixed(2),
        },
      },
    });
  } catch (error) {
    console.error("Error getting clients without bills:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getClientBillStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id).populate(
      "createdBy",
      "name email",
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    const bills = await Bill.find({ client: id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        client,
        bills,
        hasBills: bills.length > 0,
        totalBills: bills.length,
        totalAmount: bills.reduce((sum, bill) => sum + (bill.amount || 0), 0),
      },
    });
  } catch (error) {
    console.error("Error getting client bill status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  getClientsWithoutBills,
  getClientBillStatus,
};
