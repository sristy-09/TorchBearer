import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { TokenBlacklist } from "../models/TokenBlacklist.js";

/* =========================================
   protect  —  verifies JWT, attaches user to req
   ========================================= */
export const protect = async (req, res, next) => {
  try {
    // 1. Pull token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Check if token is blacklisted (user logged out)
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({
        success: false,
        message: "Token has been invalidated. Please log in again.",
      });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Check user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User belonging to this token no longer exists.",
      });
    }

    // 5. Attach user to request for downstream use
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again.",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   restrictTo  —  role-based access control
   Usage: restrictTo("alumni")  or  restrictTo("alumni", "student")
   ========================================= */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only ${roles.join(" or ")} can perform this action.`,
      });
    }
    next();
  };
};
