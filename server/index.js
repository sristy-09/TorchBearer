import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";

// Routes
import spaceRoutes from "./routes/Space.js";
import topicRoutes from "./routes/Topic.js";

// Middleware
import { protect } from "./middleware/authMiddleware.js";

connectDB();

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/spaces", protect, spaceRoutes);   // Space routes
app.use("/api/topics", protect, topicRoutes);   // Topic routes

// Default route
app.get("/", (req, res) => {
  res.send("TorchBearer API is running...");
});

// Simple error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});