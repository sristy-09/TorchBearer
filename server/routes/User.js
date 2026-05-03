import express from "express";
import jwt from "jsonwebtoken";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
  completeProfile,
} from "../controllers/userController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import passport from "../config/passport.js";

const router = express.Router();

/* ── Public routes (no token needed) ──────────────────────── */
router.post("/register", register);
router.post("/login", login);

/* ── Protected routes (valid JWT required) ─────────────────── */
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.put("/complete-profile", protect, completeProfile); // for Google users to finish profile

/* ── User directory (any logged-in user can browse) ────────── */
router.get("/users", protect, getAllUsers);
router.get("/users/:id", protect, getUserById);

// Redirect user to Google's OAuth consent screen
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

// Google redirects here after user approves
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const { user, isNew } = req.user; // passport puts result of done() in req.user

    // req.user is set by Passport — issue your JWT just like normal login
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    if (isNew) {
      // Send to complete-profile page if this is their first login (optional)
      return res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${token}&isNew=true`,
      );
    }

    // Option A: redirect to frontend with token in query string
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    // Option B: return JSON (for mobile/SPA)
    // res.json({ success: true, token });
  },
);

export default router;
