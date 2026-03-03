import express from "express";
import {
  createTopic,
  getTopicsBySpace,
  getTopicById,
  updateTopic,
  deleteTopic,
} from "../controllers/topicController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createTopic);
router.get("/space/:spaceId", protect, getTopicsBySpace);
router.get("/:topicId", protect, getTopicById);
router.put("/:topicId", protect, updateTopic);
router.delete("/:topicId", protect, deleteTopic);

export default router;