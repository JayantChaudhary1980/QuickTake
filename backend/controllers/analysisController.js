import mongoose from "mongoose";
import Analysis from "../models/Analysis.js";
import {
  askAnalysisQuestion,
  generateSummary,
} from "../services/aiService.js";
import { transcribeAudio } from "../services/groqService.js";
import { downloadYoutubeAudio } from "../services/youtubeService.js";
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";

export const createAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.create({
      userId: req.user.userId,
      title: req.body.title,
      sourceType: req.body.sourceType,
      durationSeconds: 0,
    });

    res.status(201).json(analysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create analysis" });
  }
};

export const getAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json(analyses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch analyses" });
  }
};

export const getAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    const analysis = await Analysis.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    res.json(analysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch analysis" });
  }
};

export const askAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const question = req.body.question?.trim();

    console.log("Ask analysisId:", id);
    console.log("Ask question received:", question);

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    const analysis = await Analysis.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    if (!analysis.transcript?.trim()) {
      return res.status(400).json({
        message: "This analysis has no transcript to ask about",
      });
    }

    console.log(
      "Ask transcript length from DB:",
      analysis.transcript.length
    );

    const answer = await askAnalysisQuestion(analysis.transcript, question, {
      userId: req.user.userId,
      analysisId: id,
    });

    res.json({ answer });
  } catch (error) {
    console.error("Ask analysis route error:", error);
    res.status(500).json({ message: "Failed to get answer" });
  }
};

export const uploadAnalysis = async (req, res) => {
  try {
    const title = req.body.title?.trim();
    const sourceType = req.body.sourceType === "LIVE_CAPTURE" ? "LIVE_CAPTURE" : "UPLOAD";

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("File received:", req.file.originalname);
    console.log("Size:", req.file.size);

    // Attempt to determine duration using ffprobe
    let durationSeconds = 0;
    const tmpPath = path.join(os.tmpdir(), `upload-${Date.now()}-${req.file.originalname}`);
    try {
      fs.writeFileSync(tmpPath, req.file.buffer);
      const out = execFileSync(
        "ffprobe",
        [
          "-v",
          "quiet",
          "-print_format",
          "json",
          "-show_format",
          "-show_streams",
          tmpPath,
        ],
        { encoding: "utf8" }
      );
      const meta = JSON.parse(out || "{}");
      if (meta.format && meta.format.duration) {
        durationSeconds = Math.round(Number(meta.format.duration) || 0);
      } else if (meta.streams && meta.streams[0] && meta.streams[0].duration) {
        durationSeconds = Math.round(Number(meta.streams[0].duration) || 0);
      }
    } catch (err) {
      console.warn("ffprobe failed or not available:", err);
    } finally {
      try {
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      } catch (e) {}
    }

    const transcript = await transcribeAudio(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      { userId: req.user.userId }
    );

    console.log("Transcript length:", transcript.length);

    let summary = "";
    let keyPoints = [];
    let actionItems = [];

    try {
      console.log("Calling Summary...");
      const result = await generateSummary(transcript, { userId: req.user.userId });
      console.log("Gemini result:", result);

      summary = result.summary;
      keyPoints = result.keyPoints;
      actionItems = result.actionItems;
    } catch (error) {
      console.error("Summary generation failed:");
      console.error(error);
    }

    const analysis = await Analysis.create({
      userId: req.user.userId,
      title,
      sourceType,
      transcript,
      summary,
      keyPoints,
      actionItems,
      durationSeconds,
      status: "COMPLETED",
    });

    res.status(201).json(analysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to upload and transcribe analysis",
    });
  }
};

export const deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    const analysis = await Analysis.findOne({ _id: id, userId: req.user.userId });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    await Analysis.deleteOne({ _id: id });

    res.json({ success: true, message: "Analysis deleted" });
  } catch (error) {
    console.error("Delete analysis error:", error);
    res.status(500).json({ message: "Failed to delete analysis" });
  }
};

export const updateAnalysisTitle = async (req, res) => {
  try {
    const { id } = req.params;
    const title = req.body.title?.trim();

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    const analysis = await Analysis.findOne({ _id: id, userId: req.user.userId });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    analysis.title = title;
    await analysis.save();

    res.json(analysis);
  } catch (error) {
    console.error("Update analysis title error:", error);
    res.status(500).json({ message: "Failed to update analysis" });
  }
};

export const shareAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    const analysis = await Analysis.findOne({ _id: id, userId: req.user.userId });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    analysis.isPublic = true;
    await analysis.save();

    const host = process.env.PUBLIC_HOST || "http://localhost:3000";
    const shareUrl = `${host}/share/${analysis._id}`;

    res.json({ url: shareUrl });
  } catch (error) {
    console.error("Share analysis error:", error);
    res.status(500).json({ message: "Failed to share analysis" });
  }
};

export const getPublicAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    const analysis = await Analysis.findOne({ _id: id, isPublic: true });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found or not public" });
    }

    const { title, summary, keyPoints, actionItems, transcript, sourceType, createdAt } = analysis;

    res.json({ title, summary, keyPoints, actionItems, transcript, sourceType, createdAt });
  } catch (error) {
    console.error("Get public analysis error:", error);
    res.status(500).json({ message: "Failed to fetch public analysis" });
  }
};

export const getAnalysisStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const totalAnalyses = await Analysis.countDocuments({ userId });

    const now = new Date();
    const day = now.getDay(); // 0 (Sun) - 6 (Sat)
    const daysSinceMonday = (day + 6) % 7; // convert so Monday=0
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysSinceMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeek = await Analysis.countDocuments({
      userId,
      createdAt: { $gte: startOfWeek },
    });

    const agg = await Analysis.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalDurationSeconds: { $sum: "$durationSeconds" } } },
    ]);

    const totalDurationSeconds = agg?.[0]?.totalDurationSeconds || 0;
    const hoursSaved = totalDurationSeconds / 3600;

    res.json({ totalAnalyses, thisWeek, hoursSaved });
  } catch (error) {
    console.error("Get analysis stats error:", error);
    res.status(500).json({ message: "Failed to fetch analysis stats" });
  }
};

export const createYoutubeAnalysis = async (req, res) => {
  try {
    const { title, url } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    if (!url?.trim()) {
      return res.status(400).json({
        message: "YouTube URL is required",
      });
    }

    // Create a placeholder analysis so the frontend can poll status.
    const placeholder = await Analysis.create({
      userId: req.user.userId,
      title,
      sourceType: "YOUTUBE",
      transcript: "",
      summary: "",
      keyPoints: [],
      actionItems: [],
      durationSeconds: 0,
      status: "PROCESSING",
      statusMessage: "Downloading audio...",
    });

    // Return the placeholder immediately so the client can navigate to details and poll.
    res.status(201).json(placeholder);

    // Continue processing in background and update statusMessage along the way.
    (async () => {
      try {
        // Download audio
        await Analysis.findByIdAndUpdate(placeholder._id, { statusMessage: "Downloading audio..." });
        const audio = await downloadYoutubeAudio(url);
        const durationSeconds = Number(audio?.durationSeconds) || 0;

        // Transcribing
        await Analysis.findByIdAndUpdate(placeholder._id, { durationSeconds, statusMessage: "Transcribing..." });
        const transcript = await transcribeAudio(audio.buffer, audio.filename, audio.mimetype, {
          userId: req.user.userId,
          analysisId: placeholder._id,
        });

        // Generating summary
        await Analysis.findByIdAndUpdate(placeholder._id, { statusMessage: "Generating summary..." });
        let summary = "";
        let keyPoints = [];
        let actionItems = [];

        try {
          const result = await generateSummary(transcript, {
            userId: req.user.userId,
            analysisId: placeholder._id,
          });
          summary = result.summary;
          keyPoints = result.keyPoints;
          actionItems = result.actionItems;
        } catch (err) {
          console.error("Summary generation failed:", err);
        }

        // Finalize
        await Analysis.findByIdAndUpdate(placeholder._id, {
          transcript,
          summary,
          keyPoints,
          actionItems,
          status: "COMPLETED",
          statusMessage: "Completed",
        });
      } catch (err) {
          console.error("Background YouTube processing failed:", err);

          try {
            await Analysis.findByIdAndUpdate(placeholder._id, {
              status: "FAILED",
              statusMessage: err.message || "Processing failed",
            });
          } catch (e) {
            console.error("Failed to update placeholder on error:", e);
          }
        }
    })();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to process YouTube video",
    });
  }
};