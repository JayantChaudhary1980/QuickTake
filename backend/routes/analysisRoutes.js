const express = require("express");

const router = express.Router();

const {
  createAnalysis,
  getAnalyses,
} = require("../controllers/analysisController");

const protect = require("../middleware/authMiddleware");

router.post("/", protect, createAnalysis);

router.get("/", protect, getAnalyses);

module.exports = router;