const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/apiResponse');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return errorResponse(res, 'No token, authorization denied', 401);
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 'Token is not valid', 401);
  }
};

module.exports = { auth };
