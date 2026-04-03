import { Topic } from "../models/Topics.js";
import { Space } from "../models/Spaces.js";
import APIFunctionality from "../utils/apiFunctionality.js";

/* =========================================
   1. CREATE Topic  (must belong to a Space)
   Body: { title, description, spaceId }
   ========================================= */
export const createTopic = async (req, res) => {
  try {
    const { title, description, spaceId } = req.body;

    if (!title || !description || !spaceId) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and spaceId are required",
      });
    }

    // Verify the parent Space exists
    const space = await Space.findById(spaceId);
    if (!space) {
      return res.status(404).json({
        success: false,
        message: "Parent space not found",
      });
    }

    const newTopic = await Topic.create({
      title,
      description,
      space: spaceId,
      createdBy: req.user._id, // req.user is set by auth middleware
    });

    // Keep Space.topics array in sync
    await Space.findByIdAndUpdate(spaceId, {
      $push: { topics: newTopic._id },
    });

    const populated = await newTopic.populate([
      { path: "createdBy", select: "name role" },
      { path: "space", select: "title" },
    ]);

    return res.status(201).json({
      success: true,
      message: "Topic created successfully",
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating topic",
      error: error.message,
    });
  }
};

/* =========================================
   2. GET ALL Topics  (search + filter + paginate)
   Query params:
     ?keyword=alumni        → search by title
     ?space=<spaceId>       → filter by space
     ?page=1&limit=10       → pagination
   ========================================= */
export const getAllTopics = async (req, res) => {
  try {
    const api = new APIFunctionality(Topic.find(), req.query)
      .search()
      .filter()
      .paginate();

    const topics = await api.query
      .populate("space", "title")
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: topics.length,
      data: topics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching topics",
      error: error.message,
    });
  }
};

/* =========================================
   3. GET SINGLE Topic
   ========================================= */
export const getSingleTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
      .populate("space", "title description")
      .populate("createdBy", "name role")
      .populate({
        path: "posts",
        populate: { path: "author", select: "name role" },
      });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching topic",
      error: error.message,
    });
  }
};

/* =========================================
   4. UPDATE Topic
   ========================================= */
export const updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    if (topic.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this topic",
      });
    }

    const { title, description } = req.body;

    const updatedTopic = await Topic.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true, runValidators: true },
    )
      .populate("space", "title")
      .populate("createdBy", "name role");

    return res.status(200).json({
      success: true,
      message: "Topic updated successfully",
      data: updatedTopic,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating topic",
      error: error.message,
    });
  }
};

/* =========================================
   5. DELETE Topic
   ========================================= */
export const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    if (topic.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this topic",
      });
    }

    await topic.deleteOne();

    // Remove topic reference from its parent Space
    await Space.findByIdAndUpdate(topic.space, {
      $pull: { topics: topic._id },
    });

    return res.status(200).json({
      success: true,
      message: "Topic deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting topic",
      error: error.message,
    });
  }
};
