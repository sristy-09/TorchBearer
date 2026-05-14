import { Space } from "../models/Spaces.js";
import APIFunctionality from "../utils/apiFunctionality.js";

/* =========================================
   1. CREATE Space
   ========================================= */
export const createSpace = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const newSpace = await Space.create({
      title,
      description,
      createdBy: req.user._id, // req.user is set by auth middleware
    });

    const populated = await newSpace.populate("createdBy", "name role");

    res.status(201).json({
      success: true,
      message: "Space created successfully",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating space",
      error: error.message,
    });
  }
};

/* =========================================
   2. GET All Spaces  (search + filter + paginate)
   Query params:
     ?keyword=engineering   → search by title
     ?page=1&limit=10       → pagination
   ========================================= */
export const getAllSpaces = async (req, res) => {
  try {
    const api = new APIFunctionality(Space.find(), req.query)
      .search()
      .filter()
      .paginate();

    const spaces = await api.query
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: spaces.length,
      data: spaces,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching spaces",
      error: error.message,
    });
  }
};

/* =========================================
   3. GET Single Space
   ========================================= */
export const getSingleSpace = async (req, res) => {
  try {
    const space = await Space.findById(req.params.id)
      .populate("createdBy", "name role")
      .populate("topics", "title description");

    if (!space) {
      return res.status(404).json({
        success: false,
        message: "Space not found",
      });
    }

    res.status(200).json({
      success: true,
      data: space,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching space",
      error: error.message,
    });
  }
};

/* =========================================
   4. UPDATE Space
   ========================================= */
export const updateSpace = async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);

    if (!space) {
      return res.status(404).json({
        success: false,
        message: "Space not found",
      });
    }

    // Only creator or admin can update
    if (
      space.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized to update this space" });
    }

    const { title, description } = req.body;

    const updatedSpace = await Space.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { returnDocument: 'after', runValidators: true },
    ).populate("createdBy", "name role");

    res.status(200).json({
      success: true,
      message: "Space updated successfully",
      data: updatedSpace,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating space",
      error: error.message,
    });
  }
};

/* =========================================
   5. DELETE Space
   ========================================= */
export const deleteSpace = async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);

    if (!space) {
      return res.status(404).json({
        success: false,
        message: "Space not found",
      });
    }

    // Only creator or admin can delete
    if (
      space.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized to delete this space" });
    }

    await space.deleteOne();

    res.status(200).json({
      success: true,
      message: "Space deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting space",
      error: error.message,
    });
  }
};

/* =========================================
   6. GET Space Members
   ========================================= */
export const getSpaceMembers = async (req, res) => {
  try {
    const space = await Space.findById(req.params.id).populate(
      "members",
      "name email role avatar department batchYear"
    );

    if (!space) {
      return res.status(404).json({
        success: false,
        message: "Space not found",
      });
    }

    res.status(200).json({
      success: true,
      count: space.members.length,
      data: space.members,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching space members",
      error: error.message,
    });
  }
};

/* =========================================
   7. ADD Member to Space
   ========================================= */
export const addMemberToSpace = async (req, res) => {
  try {
    const { userId } = req.body;
    const spaceId = req.params.id;

    const space = await Space.findById(spaceId);

    if (!space) {
      return res.status(404).json({
        success: false,
        message: "Space not found",
      });
    }

    // Check if user is already a member
    if (space.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this space",
      });
    }

    space.members.push(userId);
    await space.save();

    const updatedSpace = await Space.findById(spaceId).populate(
      "members",
      "name email role avatar"
    );

    res.status(200).json({
      success: true,
      message: "Member added successfully",
      data: updatedSpace.members,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding member to space",
      error: error.message,
    });
  }
};

/* =========================================
   8. REMOVE Member from Space
   ========================================= */
export const removeMemberFromSpace = async (req, res) => {
  try {
    const { userId } = req.body;
    const spaceId = req.params.id;

    const space = await Space.findById(spaceId);

    if (!space) {
      return res.status(404).json({
        success: false,
        message: "Space not found",
      });
    }

    // Only creator or admin can remove members
    if (
      space.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to remove members from this space",
      });
    }

    space.members = space.members.filter(
      (memberId) => memberId.toString() !== userId
    );
    await space.save();

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing member from space",
      error: error.message,
    });
  }
};
