import mongoose from "mongoose"
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,

    role:{
        type: String,
        enum: ["student", "alumni"],
        required: true,
    },

    batchYear: Number,
    registrationNumber: Number,
    department: String,
    skills: [String],
    interests: [String],
})

export const User = momgoose.model("User", userSchema)