import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
dotenv.config();

import { connectDB } from "./config/db.js";
import passport from "./config/passport.js";
import { initializeSocket } from "./config/socket.js";

// Routes
import topicRoutes from "./routes/Topic.js";
import spaceRoutes from "./routes/Space.js";
import postRoutes from "./routes/Post.js";
import commentRoutes from "./routes/commentRoutes.js";
import userRoutes from "./routes/User.js";
import notificationRoutes from "./routes/Notification.js";

const app = express();
const server = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// No session needed — we use JWT
app.use(passport.initialize());

connectDB();

// Initialize Socket.io
initializeSocket(server);

const PORT = process.env.PORT || 3000;

// Routes
app.use("/api/spaces", spaceRoutes); // Space routes
app.use("/api/topics", topicRoutes); // Topic routes
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/notifications", notificationRoutes); // Notification routes


// Default route
app.get("/", (req, res) => {
  res.send("TorchBearer API is running...");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Socket.io is ready for real-time notifications`);
});
