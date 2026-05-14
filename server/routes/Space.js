import express from "express";
import {
  createSpace,
  getAllSpaces,
  getSingleSpace,
  updateSpace,
  deleteSpace,
  getSpaceMembers,
  addMemberToSpace,
  removeMemberFromSpace,
} from "../controllers/spaceController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes below require a valid JWT token
router.use(protect);

router.get("/", getAllSpaces); // any logged-in user

router.post("/", createSpace); // only admin can create spaces
router.get("/:id", getSingleSpace);
router.put("/:id", restrictTo("admin"), updateSpace);
router.delete("/:id", restrictTo("admin"), deleteSpace);

// Member management routes
router.get("/:id/members", getSpaceMembers); // Get all members of a space
router.post("/:id/members", addMemberToSpace); // Add a member to a space
router.delete("/:id/members", removeMemberFromSpace); // Remove a member from a space

export default router;