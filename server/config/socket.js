import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

let io;

// Store connected admin sockets
const adminSockets = new Map(); // userId -> socketId
const userSockets = new Map(); // userId -> socketId

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    const userRole = socket.user.role;

    console.log(`✅ User connected: ${socket.user.name} (${userRole}) - Socket ID: ${socket.id}`);

    // Store socket reference
    userSockets.set(userId, socket.id);

    // If admin, join admin room and store in admin sockets
    if (userRole === "admin") {
      socket.join("admin-room");
      adminSockets.set(userId, socket.id);
      console.log(`👑 Admin ${socket.user.name} joined admin-room`);
    }

    // Join personal room for direct notifications
    socket.join(`user-${userId}`);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.user.name} - Socket ID: ${socket.id}`);
      userSockets.delete(userId);
      
      if (userRole === "admin") {
        adminSockets.delete(userId);
        console.log(`👑 Admin ${socket.user.name} left admin-room`);
      }
    });

    // Handle mark notification as read
    socket.on("notification:read", (notificationId) => {
      console.log(`📖 Notification ${notificationId} marked as read by ${socket.user.name}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// Emit notification to all admins
export const emitToAdmins = (event, data) => {
  if (!io) {
    console.error("Socket.io not initialized");
    return;
  }
  
  console.log(`📢 Broadcasting to admin-room: ${event}`, data);
  io.to("admin-room").emit(event, data);
};

// Emit notification to specific user
export const emitToUser = (userId, event, data) => {
  if (!io) {
    console.error("Socket.io not initialized");
    return;
  }

  const roomName = `user-${userId}`;
  console.log(`📨 Sending to ${roomName}: ${event}`, data);
  io.to(roomName).emit(event, data);
};

// Get online admin count
export const getOnlineAdminCount = () => {
  return adminSockets.size;
};

// Check if user is online
export const isUserOnline = (userId) => {
  return userSockets.has(userId.toString());
};
