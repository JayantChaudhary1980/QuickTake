import mongoose from "mongoose";

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

    keyPoints: {
      type: [String],
      default: [],
    },

    actionItems: {
      type: [String],
      default: [],
    },

    isPublic: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["PROCESSING", "COMPLETED"],
      default: "PROCESSING",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Analysis", analysisSchema);
