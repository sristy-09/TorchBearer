import express from "express";
import {
  addComment,
  getComments,
  deleteComment,
} from "../controllers/commentControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes below require a valid JWT token
router.use(protect);

router.post("/create/:postId", addComment);
router.get("/:postId", getComments);
router.delete("/:id", deleteComment);

export default router;
