import express from "express";
import {
  createTopic,
  getAllTopics,
  getSingleTopic,
  updateTopic,
  deleteTopic,
} from "../controllers/topicController.js";

const router = express.Router();

router.post("/", createTopic);
router.get("/", getAllTopics);
router.get("/:id", getSingleTopic);
router.put("/:id", updateTopic);
router.delete("/:id", deleteTopic);

export default router;