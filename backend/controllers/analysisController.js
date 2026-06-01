import Analysis from "../models/Analysis.js";
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

export const uploadAnalysis = async (req, res) => {
  try {
    const title = req.body.title?.trim();

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

    const analysis = await Analysis.create({
      userId: req.user.userId,
      title,
      sourceType: "UPLOAD",
      transcript,
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
