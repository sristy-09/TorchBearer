import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";

// Routes
import topicRoutes from "./routes/Topic.js";
import spaceRoutes from "./routes/Space.js";
import postRoutes from "./routes/Post.js";
import commentRoutes from "./routes/commentRoutes.js";
import userRoutes from "./routes/User.js";

connectDB();

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/spaces", spaceRoutes); // Space routes
app.use("/api/topics", topicRoutes); // Topic routes
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("TorchBearer API is running...");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
