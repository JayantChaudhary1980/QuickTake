import express from "express";
import {
  askAnalysis,
  createAnalysis,
  getAnalyses,
  getAnalysisById,
  uploadAnalysis,
  deleteAnalysis,
  updateAnalysisTitle,
  shareAnalysis,
  getAnalysisStats,
  createYoutubeAnalysis,
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

router.get("/stats", protect, getAnalysisStats);

router.post("/:id/ask", protect, askAnalysis);

router.get("/:id", protect, getAnalysisById);

router.delete("/:id", protect, deleteAnalysis);
router.patch("/:id", protect, updateAnalysisTitle);
router.patch("/:id/share", protect, shareAnalysis);

router.post("/youtube", protect, createYoutubeAnalysis);

export default router;