import { Space } from "../models/Spaces.js";

/* =========================================
   1. CREATE Space
   ========================================= */
export const createSpace = async (req, res) => {
  try {
    const { title, description } = req.body;

    // validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const newSpace = new Space({
      title,
      description,
    });

    const savedSpace = await newSpace.save();

    res.status(201).json({
      success: true,
      message: "Space created successfully",
      data: savedSpace,
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
   2. GET All Spaces
   ========================================= */
export const getAllSpaces = async (req, res) => {
  try {
    const spaces = await Space.find().sort({ createdAt: -1 });

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
    const { id } = req.params;

    const space = await Space.findById(id);

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
    const { id } = req.params;
    const { title, description } = req.body;

    const updatedSpace = await Space.findByIdAndUpdate(
      id,
      { title, description },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedSpace) {
      return res.status(404).json({
        success: false,
        message: "Space not found",
      });
    }

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
    const { id } = req.params;

    const deletedSpace = await Space.findByIdAndDelete(id);

    if (!deletedSpace) {
      return res.status(404).json({
        success: false,
        message: "Space not found",
      });
    }

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
