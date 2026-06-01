const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");
const analysisRoutes = require("./routes/analysisRoutes");

require("dotenv").config();

connectDB();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/analyses", analysisRoutes);

app.get("/", (req, res) => {
  res.json({ message: "QuickTake API" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "Protected Route Accessed",
    user: req.user,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
