import { Comment } from "../models/Comment.js";

/* =========================================
   1. ADD Comment
   Params: postId
   Body:   { text, userId }
   ========================================= */
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const comment = await Comment.create({
      text,
      user: req.user._id,
      post: req.params.postId,
    });

    // Return comment with user info populated
    const populated = await comment.populate("user", "name role");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: populated,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error adding comment",
      error: err.message,
    });
  }
};

/* =========================================
   2. GET Comments for a Post
   Params: postId
   ========================================= */
export const getComments = async (req, res) => {
  try {
    // Verify the post exists first
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const comments = await Comment.find({ post: req.params.postId })
      .populate("user", "name role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: err.message,
    });
  }
};

/* =========================================
   3. DELETE Comment
   Params: id
   ========================================= */
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    // Ownership check
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await comment.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: err.message,
    });
  }
};
