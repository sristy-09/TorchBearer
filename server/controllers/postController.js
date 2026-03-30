import { Post } from "../models/Post.js";
import { Topic } from "../models/Topics.js";
import APIFunctionality from "../utils/apiFunctionality.js";

/* =========================================
   1. CREATE Post  (must belong to a Topic → Space)
   Body: { title, content, description, image, userId, topicId }
   ========================================= */
export const createPost = async (req, res) => {
  try {
    const { title, content, description, image, userId, topicId } = req.body;

    if (!title || !content || !userId || !topicId) {
      return res.status(400).json({
        message: "title, content, userId, and topicId are required",
      });
    }

    // Verify parent Topic exists and grab its spaceId
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Parent topic not found" });
    }

    const newPost = await Post.create({
      title,
      content,
      description,
      image,
      author: userId,
      topic: topicId,
      space: topic.space, // denormalized from topic's parent space
    });

    // Keep Topic.posts array in sync
    await Topic.findByIdAndUpdate(topicId, {
      $push: { posts: newPost._id },
    });

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================
   2. GET All Posts  (search + filter + paginate)
   Query params:
     ?keyword=alumni        → search by title
     ?topic=<topicId>       → filter by topic
     ?space=<spaceId>       → filter by space
     ?page=1&limit=10       → pagination
   ========================================= */
export const getPosts = async (req, res) => {
  try {
    const api = new APIFunctionality(Post.find(), req.query)
      .search()
      .filter()
      .paginate();

    const posts = await api.query
      .populate("author", "name role")
      .populate("topic", "title")
      .populate("space", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================
   3. GET Single Post
   ========================================= */
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name role")
      .populate("topic", "title")
      .populate("space", "title");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================
   4. UPDATE Post
   ========================================= */
export const updatePost = async (req, res) => {
  try {
    // Prevent overwriting relational fields via update
    const { title, content, description, image } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content, description, image },
      { new: true, runValidators: true },
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================
   5. DELETE Post
   ========================================= */
export const deletePost = async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);

    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Remove post reference from its parent Topic
    await Topic.findByIdAndUpdate(deletedPost.topic, {
      $pull: { posts: deletedPost._id },
    });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================
   6. LIKE / UNLIKE Post (toggle)
   Body: { userId }
   ========================================= */
export const likePost = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();
    res.json({ likesCount: post.likes.length, likes: post.likes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
