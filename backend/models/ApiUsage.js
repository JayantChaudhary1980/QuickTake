import mongoose from "mongoose";

const apiUsageSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
    enum: ["GROQ"],
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  analysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Analysis",
  },

  inputTokens: {
    type: Number,
    default: 0,
  },

  outputTokens: {
    type: Number,
    default: 0,
  },

  totalTokens: {
    type: Number,
    default: 0,
  },

  success: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("ApiUsage", apiUsageSchema);
