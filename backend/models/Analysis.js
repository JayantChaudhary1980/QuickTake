const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    sourceType: {
      type: String,
      enum: ["UPLOAD", "LIVE_CAPTURE"],
      default: "UPLOAD",
    },

    transcript: {
      type: String,
      default: "",
    },

    summary: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["PROCESSING", "COMPLETED"],
      default: "PROCESSING",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analysis", analysisSchema);