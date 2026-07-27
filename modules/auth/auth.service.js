const User = require("../users/user.model");
const jwt = require("jsonwebtoken");
const { canUserLogin } = require("../users/user.schedule.controller");

const login = async (email, password) => {
  // Find user (including inactive ones to give proper message)
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error("Your account has been deactivated. Please contact admin.");
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  if (user.role !== "superadmin") {
    const loginCheck = await canUserLogin(user._id);

    if (!loginCheck.allowed) {
      // Throw error with code for controller to handle
      const error = new Error(loginCheck.reason);
      error.code = loginCheck.code;
      error.statusCode = 403;
      throw error;
    }
  }

  // Generate token
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

module.exports = { login, getMe };
