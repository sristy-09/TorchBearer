import { Comment } from "../models/Comment.js";
import { Post } from "../models/Post.js";

/* =========================================
   1. ADD COMMENT
========================================= */
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = await Comment.create({
      text,
      user: req.user._id,
      post: req.params.postId,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("user", "name role avatar");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: populatedComment,
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
   2. GET COMMENTS FOR A POST
========================================= */
export const getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comments = await Comment.find({
      post: req.params.postId,
    })
      .populate("user", "name role avatar")
     .populate({
  path: "parentComment",
  select: "_id"
})
      .select("text user post parentComment createdAt")
  .sort({ createdAt: 1 });

    res.status(200).json({
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
   3. DELETE COMMENT
========================================= */
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Ownership check
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: err.message,
    });
  }
};
/* =========================================
   4. EDIT COMMENT
========================================= */
export const editComment = async (req, res) => {
  try {
    const { text } = req.body;

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // ownership check
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    comment.text = text;

    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate("user", "name role avatar");

    res.status(200).json({
      success: true,
      message: "Comment updated",
      data: updatedComment,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error editing comment",
      error: err.message,
    });
  }
};
/* =========================================
   5. REPLY TO COMMENT
========================================= */
export const replyToComment = async (req, res) => {
  try {
    const { text } = req.body;

    const parent = await Comment.findById(req.params.commentId);

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent comment not found",
      });
    }

   await Comment.create({
  text,
  user: req.user._id,
  post: parent.post,
  parentComment: parent._id,
});

const comments = await Comment.find({
  post: parent.post,
})
  .populate("user", "name role avatar")
  .populate({
    path: "parentComment",
    select: "_id",
  })
  .select("text user post parentComment createdAt")
  .sort({ createdAt: 1 });

return res.status(200).json({
  success: true,
  data: comments,
});

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};