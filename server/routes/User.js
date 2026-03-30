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

export default router;
