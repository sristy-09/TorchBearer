import express from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/postController.js";

const router = express.Router();

// CRUD Routes
router.post("/", createPost);       // Create
router.get("/", getPosts);          // Read All
router.get("/:id", getPostById);    // Read One
router.put("/:id", updatePost);     // Update
router.delete("/:id", deletePost);  // Delete

export default router;