import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
} from "../controllers/userController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import passport from "../config/passport.js";

const router = express.Router();

/* ── Public routes (no token needed) ──────────────────────── */
router.post("/register", register);
router.post("/login", login);

/* ── Protected routes (valid JWT required) ─────────────────── */
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

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
    // req.user is set by Passport — issue your JWT just like normal login
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
    // Option A: redirect to frontend with token in query string
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    // Option B: return JSON (for mobile/SPA)
    // res.json({ success: true, token });
  },
);

export default router;
