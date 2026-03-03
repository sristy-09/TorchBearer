import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import spaceRoutes from "./routes/Space.js";

connectDB();

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/spaces", spaceRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
