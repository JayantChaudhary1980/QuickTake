import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import connectDB from "./config/db.js";
import protect from "./middleware/authMiddleware.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import { getPublicAnalysis } from "./controllers/analysisController.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";


dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/analyses", analysisRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "QuickTake API" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "Protected Route Accessed",
    user: req.user,
  });
});

app.get("/api/public/analyses/:id", getPublicAnalysis);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
