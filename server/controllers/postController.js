import { Post } from "../models/Post.js";
import { Topic } from "../models/Topics.js";
import APIFunctionality from "../utils/apiFunctionality.js";

/* =========================================
   1. CREATE Post  (must belong to a Topic → Space)
   Body: { title, content, description, image, userId, topicId }
   ========================================= */
export const createPost = async (req, res) => {
  try {
    const { title, content, description, image, topicId } = req.body;

    if (!title || !content || !topicId) {
      return res.status(400).json({
        message: "title, content and topicId are required",
      });
    }

    // Verify parent Topic exists and grab its spaceId
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res
        .status(404)
        .json({ success: false, message: "Parent topic not found" });
    }

    const newPost = await Post.create({
      title,
      content,
      description,
      image,
      author: req.user._id,
      topic: topicId,
      space: topic.space, // denormalized from topic's parent space
    });

    // Keep Topic.posts array in sync
    await Topic.findByIdAndUpdate(topicId, {
      $push: { posts: newPost._id },
    });

    const populated = await newPost.populate([
      { path: "author", select: "name role avatar" },
      { path: "topic", select: "title" },
      { path: "space", select: "title" },
    ]);

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating post",
      error: error.message,
    });
  }
};

/* =========================================
   2. GET All Posts  (search + filter + paginate)
   Query params:
     ?keyword=alumni        → search by title
     ?topic=<topicId>       → filter by topic
     ?space=<spaceId>       → filter by space
     ?author=<userId>       → filter by author
     ?page=1&limit=10       → pagination
   ========================================= */
export const getPosts = async (req, res) => {
  try {
    const api = new APIFunctionality(Post.find(), req.query)
      .search()
      .filter()
      .paginate();

    const posts = await api.query
      .populate("author", "name role avatar")
      .populate("topic", "title")
      .populate("space", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching posts",
      error: error.message,
    });
  }
};

/* =========================================
   3. GET Single Post
   ========================================= */
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name role avatar")
      .populate("topic", "title")
      .populate("space", "title");

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching post",
      error: error.message,
    });
  }
};

/* =========================================
   4. UPDATE Post
   ========================================= */
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Only author or admin can update
    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized to update this post" });
    }

    // Prevent overwriting relational fields via update
    const { title, content, description, image } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content, description, image },
      { returnDocument: 'after', runValidators: true },
    )
      .populate("author", "name role avatar")
      .populate("topic", "title")
      .populate("space", "title");

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating post",
      error: error.message,
    });
  }
};

/* =========================================
   5. DELETE Post
   ========================================= */
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Only author or admin can delete
    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized. You can only delete your own posts.",
      });
    }

    // Import Comment model for cascade delete
    const { Comment } = await import("../models/Comment.js");

    // Delete all comments on this post
    await Comment.deleteMany({ post: post._id });

    // Delete the post
    await post.deleteOne();

    // Remove post reference from its parent Topic
    await Topic.findByIdAndUpdate(post.topic, {
      $pull: { posts: post._id },
    });

    res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting post",
      error: error.message,
    });
  }
};

/* =========================================
   6. LIKE / UNLIKE Post (toggle)
   Body: { userId }
   ========================================= */
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const userId = req.user._id.toString();

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("author", "name avatar role")
      .populate("topic", "title")
      .populate("space", "title");

    res.status(200).json({
      success: true,
      data: updatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};