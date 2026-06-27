const clientService = require('./client.service');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

const createClient = async (req, res) => {
  try {
    const client = await clientService.createClient(req.body, req.user.id);
    return successResponse(res, client, 'Client created successfully', 201);
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
    const client = await clientService.updateClient(req.params.id, req.body, req.user);
    return successResponse(res, client, 'Client updated successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const deleteClient = async (req, res) => {
  try {
    const result = await clientService.deleteClient(req.params.id);
    return successResponse(res, result, 'Client deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = { createClient, getClients, getClientById, updateClient, deleteClient };
