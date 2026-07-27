// const jwt = require('jsonwebtoken');
// const { errorResponse } = require('../utils/apiResponse');

// const auth = (req, res, next) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');

//     if (!token) {
//       return errorResponse(res, 'No token, authorization denied', 401);
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     return errorResponse(res, 'Token is not valid', 401);
//   }
// };

// module.exports = { auth };

// With Scheduled User
const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/apiResponse");
const User = require("../modules/users/user.model");
const { canUserLogin } = require("../modules/users/user.schedule.controller");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return errorResponse(res, "No token, authorization denied", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //  Fetch full user from database
    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(res, "User not found", 401);
    }

    //  Check schedule restriction (only for Sales and Accountant)
    if (user.role !== "superadmin") {
      const loginCheck = await canUserLogin(user._id);

      if (!loginCheck.allowed) {
        return res.status(403).json({
          success: false,
          message: loginCheck.reason,
          code: loginCheck.code,
        });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return errorResponse(res, "Token is not valid", 401);
  }
};

module.exports = { auth };