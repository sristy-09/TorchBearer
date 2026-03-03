import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    space: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Space",
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

});

export const Topic = mongoose.model("Topics", topicSchema);