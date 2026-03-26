import express from "express"
import {addComment, getComments} from "../controllers/commentControllers.js"

const router = express.Router()

router.post("/create/:postId", addComment)
router.get("/:postId",getComments)

export default router