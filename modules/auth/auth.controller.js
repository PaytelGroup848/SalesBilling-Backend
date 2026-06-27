const authService = require('./auth.service');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return successResponse(res, result, 'Login successful');
  } catch (error) {
    return errorResponse(res, error.message, 401);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id);
    return successResponse(res, user);
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

module.exports = { login, getMe };
