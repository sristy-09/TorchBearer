/**
 * Recommendations proxy route
 * Forwards requests from the frontend to the FastAPI AI service.
 * This avoids CORS issues and keeps the AI service URL server-side.
 */

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getRecommendations, getMyRecommendations, } from "../controllers/recommendationController.js";

const router = express.Router();

// Protected — user must be logged in to get recommendations
router.use(protect);

router.post("/", getRecommendations);
router.get("/me", getMyRecommendations)

export default router;
