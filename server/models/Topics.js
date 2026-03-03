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
    createdAt: {
         type: Date,
    default: Date.now,
    },
});

export const Topic = mongoose.model("Topics", topicSchema);