import express from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload, { handleUploadError } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// All routes below require a valid JWT token
router.use(protect);

router.post("/", upload.array("attachments", 5), handleUploadError, createPost);
router.get("/", getPosts);
router.get("/:id", getPostById);
router.put("/:id", upload.array("attachments", 5), handleUploadError, updatePost);
router.delete("/:id", deletePost);
router.put("/:id/like", likePost);

export default router;
