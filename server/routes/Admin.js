import express from "express";
import { getAdminStats } from "../controllers/adminController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(restrictTo("admin"));

// Get admin dashboard stats
router.get("/stats", getAdminStats);

export default router;
