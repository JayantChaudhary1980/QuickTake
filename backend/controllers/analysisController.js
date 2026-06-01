const Analysis = require("../models/Analysis");

const createAnalysis = async (req, res) => {
  try {
    console.log(req.user);
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

const getAnalyses = async (req, res) => {
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

module.exports = {
  createAnalysis,
  getAnalyses,
};