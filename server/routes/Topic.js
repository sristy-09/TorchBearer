import express from "express";
import {
  createTopic,
  getAllTopics,
  getSingleTopic,
  updateTopic,
  deleteTopic,
} from "../controllers/topicController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes below require a valid JWT token
router.use(protect);

router.post("/", createTopic);
router.get("/", getAllTopics);
router.get("/:id", getSingleTopic);
router.put("/:id", updateTopic);
router.delete("/:id", deleteTopic);

export default router;
