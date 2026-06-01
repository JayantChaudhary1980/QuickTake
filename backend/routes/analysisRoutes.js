import express from "express";
import {
  createAnalysis,
  getAnalyses,
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

export default router;
