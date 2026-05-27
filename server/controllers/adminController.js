import { User } from "../models/User.js";
import { Space } from "../models/Spaces.js";
import { Topic } from "../models/Topics.js";
import { Post } from "../models/Post.js";

/* =========================================
   GET ADMIN DASHBOARD STATS
   ========================================= */
export const getAdminStats = async (req, res) => {
  try {
    // Count total users
    const totalUsers = await User.countDocuments();

    // Count total spaces
    const totalSpaces = await Space.countDocuments();

    // Count total topics
    const totalTopics = await Topic.countDocuments();

    // Count total posts
    const totalPosts = await Post.countDocuments();

    // Get user role breakdown
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format role breakdown
    const roleBreakdown = {
      admin: 0,
      student: 0,
      alumni: 0,
    };

    usersByRole.forEach((item) => {
      if (item._id && roleBreakdown.hasOwnProperty(item._id)) {
        roleBreakdown[item._id] = item.count;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalSpaces,
        totalTopics,
        totalPosts,
        roleBreakdown,
      },
    });
  } catch (error) {
    console.error("Error in getAdminStats:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
