import { Topic } from "../models/Topics.js";

/* =========================================
   1. CREATE Topic
========================================= */
export const createTopic = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and Description are required",
      });
    }

    const newTopic = await Topic.create({
      title,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Topic created successfully",
      data: newTopic,
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
   2. GET ALL Topics
========================================= */
export const getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find().sort({ createdAt: -1 });

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
    const { id } = req.params;

    const topic = await Topic.findById(id);

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
    const { id } = req.params;
    const { title, description } = req.body;

    const updatedTopic = await Topic.findByIdAndUpdate(
      id,
      { title, description },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedTopic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

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
    const { id } = req.params;

    const deletedTopic = await Topic.findByIdAndDelete(id);

    if (!deletedTopic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

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
