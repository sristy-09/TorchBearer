import express from "express";
import {
  addComment,
  getComments,
  deleteComment,
} from "../controllers/commentControllers.js";

const router = express.Router();

router.post("/create/:postId", addComment);
router.get("/:postId", getComments);
router.delete("/:id", deleteComment);

export default router;
