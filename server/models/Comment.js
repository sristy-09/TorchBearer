import mongoose from "mongoose"

const commentSchema = new mongoose.Schema({
    text: String,

    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

}, {timestamp: true})

export const Comment = mongoose.model("Comment", commentSchema)