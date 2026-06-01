import express from "express";
import {
  askAnalysis,
  createAnalysis,
  getAnalyses,
  getAnalysisById,
  uploadAnalysis,
} from "../controllers/analysisController.js";
import protect from "../middleware/authMiddleware.js";
import { handleUploadError, upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

const uploadSingle = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    next();
  });
};

router.post("/upload", protect, uploadSingle, uploadAnalysis);

router.post("/", protect, createAnalysis);

router.get("/", protect, getAnalyses);

router.post("/:id/ask", protect, askAnalysis);

router.get("/:id", protect, getAnalysisById);

export default router;
