import express from "express";
import {
  createSpace,
  getAllSpaces,
  getSingleSpace,
  updateSpace,
  deleteSpace,
} from "../controllers/spaceController.js";

const router = express.Router();

router.post("/", createSpace);
router.get("/", getAllSpaces);
router.get("/:id", getSingleSpace);
router.put("/:id", updateSpace);
router.delete("/:id", deleteSpace);

export default router;
