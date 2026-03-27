import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ["student", "alumni"],
        required: true,
    },

    batchYear: Number,
    registrationNumber: Number,
    department: String,
    skills: [String],
    interests: [String],
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);