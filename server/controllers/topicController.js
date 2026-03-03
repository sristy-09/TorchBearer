import { Topic } from "../models/Topic.js";
import { Space } from "../models/Spaces.js";

/* =========================================
   1. CREATE Topic (Student/Alumni only)
========================================= */
export const createTopic = async (req, res) => {
  try {
    const { title, description, spaceId } = req.body;
    const userId = req.user.id;
    const role = req.user.role; // assume middleware sets req.user with role

    // Role-based access
    if (!["Student", "Alumni"].includes(role)) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied" 
    });
    }

    // Validate required fields
    if (!title || !description || !spaceId) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
    });
    }

    // Check if space exists
    const space = await Space.findById(spaceId);
    if (!space) {
      return res.status(404).json({ 
        success: false, 
        message: "Space not found" 
    });
    }
    // Check if user is a member of the space
    if (!space.members.includes(userId)) {
      return res.status(403).json({ 
        success: false, 
        message: "You must join this space to create a topic" 
      });
    }

    // Create topic
    const topic = await Topic.create({
      title,
      description,
      space: spaceId,
      createdBy: userId,
    });

    res.status(201).json({ 
        success: true, 
        message: "Topic created", 
        data: topic 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
        success: false, 
        message: "Failed to create topic", 
        error: error.message 
    });
  }
};

/* =========================================
   2. GET ALL Topics of a Space
========================================= */
export const getTopicsBySpace = async (req, res) => {
  try {
    const { spaceId } = req.params;

    // Check if space exists
    const space = await Space.findById(spaceId);
    if (!space) {
      return res.status(404).json({ 
        success: false, 
        message: "Space not found" 
    });
    }

    const topics = await Topic.find({ space: spaceId })
      .populate("createdBy", "name email role") // show user info
      .populate("space", "title description");

    res.status(200).json({ 
        success: true, 
        count: topics.length, 
        data: topics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
        success: false, 
        message: "Failed to fetch topics", 
        error: error.message 
    });
  }
};

/* =========================================
   3. GET Single Topic
========================================= */
export const getTopicById = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findById(topicId)
      .populate("createdBy", "name email role")
      .populate("space", "title description");

    if (!topic) {
      return res.status(404).json({ 
        success: false, 
        message: "Topic not found" 
    });
    }

    res.status(200).json({ 
        success: true, 
        data: topic 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
        success: false, 
        message: "Failed to fetch topic", 
        error: error.message 
    });
  }
};

/* =========================================
   4. UPDATE Topic (admin only)
========================================= */
export const updateTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { title, description } = req.body;

    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({ 
        success: false, 
        message: "Topic not found" 
    });
    }

    // Owner-only access
    if (topic.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Only the creator can update this topic" 
    });
    }

    // Update fields
    topic.title = title || topic.title;
    topic.description = description || topic.description;

    await topic.save();

    res.status(200).json({ 
        success: true, 
        message: "Topic updated", 
        data: topic 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
        success: false, 
        message: "Failed to update topic", 
        error: error.message 
    });
  }
};

/* =========================================
   5. DELETE Topic (admin)
========================================= */
export const deleteTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const role = req.user.role;

    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({ 
        success: false, 
        message: "Topic not found" 
    });
    }

    //Admin can delete
    if (topic.createdBy.toString() !== req.user.id && role !== "Admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to delete this topic" 
    });
    }

    await topic.deleteOne();

    res.status(200).json({ 
        success: true, 
        message: "Topic deleted successfully" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
        success: false, 
        message: "Failed to delete topic", 
        error: error.message 
    });
  }
};