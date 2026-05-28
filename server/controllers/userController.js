import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { TokenBlacklist } from "../models/TokenBlacklist.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendEmail.js";

// ─── REUSABLE STRONG PASSWORD REGEX ─────────────────────────
// Requires: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const passwordErrorMessage = "Password is too weak. It must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&).";

/* ─── Helper: sign a JWT and send it back ───────────────────── */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

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
   ========================================= */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if fields exist
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    // ENFORCE STRONG PASSWORD HERE
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: passwordErrorMessage,
      });
    }

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
      password, // hashed automatically by pre-save hook
    });

    sendTokenResponse(user, 201, res);
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
   2. LOGIN
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
   ========================================= */
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const expiresAt = new Date(decoded.exp * 1000);

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
   4. GET ME
   ========================================= */
export const getMe = async (req, res) => {
  try {
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
   ========================================= */
export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "department",
      "batchYear",
      "registrationNumber",
      "skills",
      "interests",
      "avatar",
      "socialLinks",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      returnDocument: "after",
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

    // ENFORCE STRONG PASSWORD HERE
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: passwordErrorMessage,
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = newPassword; 
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   FORGOT PASSWORD
   ========================================= */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required.",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If that email is registered, a reset link has been sent.",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; 

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const message = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset for your TorchBearer account.</p>
    <p>Click the link below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
    <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a>
    <p>If you did not request this, you can safely ignore this email.</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "TorchBearer — Password Reset",
      message,
    });

    res.status(200).json({
      success: true,
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (emailError) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    console.error("sendEmail failed:", emailError);
    res.status(500).json({
      success: false,
      message: "Failed to send reset email. Please try again later.",
    });
  }
};

/* =========================================
   RESET PASSWORD
   ========================================= */
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    // ENFORCE STRONG PASSWORD HERE
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: passwordErrorMessage,
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link. Please request a new one.",
      });
    }

    user.password = password; 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   7. GET ALL USERS
   ========================================= */
export const getAllUsers = async (req, res) => {
  try {
    const { role, department, keyword, batchYear } = req.query;

    const filter = {};

    if (role) filter.role = role;
    if (department) filter.department = department;
    if (keyword) filter.name = { $regex: keyword, $options: "i" };
    if (batchYear) filter.batchYear = Number(batchYear);

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

    const regPattern = /^\d-\d-\d{2}-\d{3}-\d{4}$/;
    if (!registrationNumber || !regPattern.test(registrationNumber)) {
      errors.push("Registration number should be like: 5-2-48-483-2018");
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

    //  1. Block re-completion first — clearest error for the current user
    const existingUser = await User.findById(req.user._id);
    if (existingUser.role) {
      return res.status(400).json({
        success: false,
        message: "Profile is already completed.",
      });
    }

    // 2. Check if the registration number is already taken by a *different* user
    const duplicateReg = await User.findOne({
      registrationNumber,
      _id: { $ne: req.user._id },
    });
    if (duplicateReg) {
      return res.status(409).json({
        success: false,
        message: "An account with this registration number already exists.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        role,
        batchYear: Number(batchYear),
        registrationNumber,
        department: department.trim(),
        skills: skills ?? [],
        interests: interests ?? [],
      },
      { returnDocument: "after", runValidators: true }
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
    // MongoDB unique index violation (race condition safety net)
    if (error.code === 11000 && error.keyPattern?.registrationNumber) {
      return res.status(409).json({
        success: false,
        message: "An account with this registration number already exists.",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};