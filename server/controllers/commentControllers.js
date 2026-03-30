import { Comment } from "../models/Comment.js";

/* =========================================
   1. ADD Comment
   Params: postId
   Body:   { text, userId }
   ========================================= */
export const addComment = async (req, res) => {
  try {
    const { text, userId } = req.body;

    if (!text || !userId) {
      return res.status(400).json({ message: "text and userId are required" });
    }

    const comment = await Comment.create({
      text,
      user: userId,
      post: req.params.postId,
    });

    // Return comment with user info populated
    const populated = await comment.populate("user", "name role");

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================================
   2. GET Comments for a Post
   Params: postId
   ========================================= */
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("user", "name role")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================================
   3. DELETE Comment
   Params: id
   ========================================= */
export const deleteComment = async (req, res) => {
  try {
    const deleted = await Comment.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
