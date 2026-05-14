import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { TokenBlacklist } from "../models/TokenBlacklist.js";

/* ─── Helper: sign a JWT and send it back ───────────────────── */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Strip password from response even though select:false handles most cases
  user.password = undefined;

  // Set secure cookie options for production
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.status(statusCode).json({
    success: true,
    token,
    data: { user },
  });
};

/* =========================================
   1. REGISTER
   POST /api/auth/register
   Body: { name, email, password, role, batchYear,
           registrationNumber, department, skills, interests }
   ========================================= */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({
      name,
      email,
      password, // hashed automatically by pre-save hook in model
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    // Mongoose validation errors → cleaner message
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   2. LOGIN
   POST /api/auth/login
   Body: { email, password }
   ========================================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Explicitly select password since it's select:false in the model
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   3. LOGOUT
   POST /api/auth/logout
   Requires: protect middleware
   ========================================= */
export const logout = async (req, res) => {
  try {
    // Get token from request (set by protect middleware)
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "No token provided.",
      });
    }

    // Decode token to get expiration time
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const expiresAt = new Date(decoded.exp * 1000);

    // Add token to blacklist
    await TokenBlacklist.create({
      token,
      userId: req.user._id,
      expiresAt,
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   4. GET ME  (current logged-in user)
   GET /api/auth/me
   Requires: protect middleware
   ========================================= */
export const getMe = async (req, res) => {
  try {
    // req.user is attached by the protect middleware
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   5. UPDATE PROFILE
   PUT /api/auth/update-profile
   Requires: protect middleware
   Body: { name, department, batchYear, registrationNumber,
           skills, interests, avatar }
   ========================================= */
export const updateProfile = async (req, res) => {
  try {
    // Fields that are safe to update via this route
    const allowedFields = [
      "name",
      "department",
      "batchYear",
      "registrationNumber",
      "skills",
      "interests",
      "avatar",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: { user: updatedUser },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   6. CHANGE PASSWORD
   PUT /api/auth/change-password
   Requires: protect middleware
   Body: { currentPassword, newPassword }
   ========================================= */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    // Fetch user with password
    const user = await User.findById(req.user._id).select("+password");

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    sendTokenResponse(user, 200, res); // issue a fresh token
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   7. GET ALL USERS  (alumni-only or admin use)
   GET /api/auth/users
   Requires: protect middleware
   Query params: ?role=alumni  ?department=CS  ?keyword=John
   ========================================= */
export const getAllUsers = async (req, res) => {
  try {
    const { role, department, keyword } = req.query;

    const filter = {};

    if (role) filter.role = role;
    if (department) filter.department = department;
    if (keyword) filter.name = { $regex: keyword, $options: "i" };

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: { users },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   8. GET SINGLE USER by ID
   GET /api/auth/users/:id
   Requires: protect middleware
   ========================================= */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   9. COMPLETE PROFILE
   PUT /api/auth/complete-profile
   Requires: protect middleware
   Body: { role, batchYear, registrationNumber,
           department, skills, interests }
   ========================================= */
export const completeProfile = async (req, res) => {
  try {
    const {
      role,
      batchYear,
      registrationNumber,
      department,
      skills,
      interests,
    } = req.body;

    // Manual validation on backend (Zod is frontend-only here)
    const errors = [];

    if (!role || !["student", "alumni"].includes(role)) {
      errors.push("Role must be either student or alumni.");
    }

    if (
      !batchYear ||
      isNaN(Number(batchYear)) ||
      Number(batchYear) < 2076 ||
      Number(batchYear) > 2084
    ) {
      errors.push("Batch year must be between 2076 and 2084.");
    }

    if (
      !registrationNumber ||
      isNaN(Number(registrationNumber)) ||
      Number(registrationNumber) <= 0
    ) {
      errors.push("Please provide a valid registration number.");
    }

    if (!department || typeof department !== "string" || !department.trim()) {
      errors.push("Department is required.");
    }

    if (skills !== undefined && !Array.isArray(skills)) {
      errors.push("Skills must be an array.");
    }

    if (interests !== undefined && !Array.isArray(interests)) {
      errors.push("Interests must be an array.");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join(" "),
      });
    }

    // Check if profile already completed (role already set)
    const existingUser = await User.findById(req.user._id);
    if (existingUser.role) {
      return res.status(400).json({
        success: false,
        message: "Profile is already completed.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        role,
        batchYear: Number(batchYear),
        registrationNumber: Number(registrationNumber),
        department: department.trim(),
        skills: skills ?? [],
        interests: interests ?? [],
      },
      { returnDocument: 'after', runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Profile completed successfully.",
      data: { user: updatedUser },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
