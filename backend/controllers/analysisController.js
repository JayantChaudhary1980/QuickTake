import mongoose from "mongoose";
import Analysis from "../models/Analysis.js";
import {
  askAnalysisQuestion,
  generateSummary,
} from "../services/geminiService.js";
import { transcribeAudio } from "../services/groqService.js";

export const createAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.create({
      userId: req.user.userId,
      title: req.body.title,
      sourceType: req.body.sourceType,
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

    const answer = await askAnalysisQuestion(analysis.transcript, question);

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

    const transcript = await transcribeAudio(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    console.log("Transcript length:", transcript.length);

    let summary = "";
    let keyPoints = [];
    let actionItems = [];

    try {
      // const result = await generateSummary(transcript);

      // summary = result.summary;
      // keyPoints = result.keyPoints;
      // actionItems = result.actionItems;
    } catch (error) {
      console.log("Gemini unavailable, saving transcript only");
    }

    const analysis = await Analysis.create({
      userId: req.user.userId,
      title,
      sourceType,
      transcript,
      summary,
      keyPoints,
      actionItems,
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
