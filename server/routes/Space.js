import express from "express";
import {
  createSpace,
  getAllSpaces,
  getSingleSpace,
  updateSpace,
  deleteSpace,
} from "../controllers/spaceController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes below require a valid JWT token
router.use(protect);

router.get("/", getAllSpaces); // any logged-in user

router.post("/", restrictTo("admin"), createSpace); // only admin can create spaces
router.get("/:id", getSingleSpace);
router.put("/:id", restrictTo("admin"), updateSpace);
router.delete("/:id", restrictTo("admin"), deleteSpace);

export default router;
