import mongoose from "mongoose";

const scoresSchema = new mongoose.Schema({
  style: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0,
  },
  grammar: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0,
  },
  creativity: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0,
  },
  clarity: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0,
  },
  relevance: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0,
  },
});

const analysisSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    required: true,
    enum: ["casual", "technical", "creative"],
  },
  scores: {
    type: scoresSchema,
    required: true,
    default: () => ({
      style: 0,
      grammar: 0,
      creativity: 0,
      clarity: 0,
      relevance: 0,
    }),
  },
  response: {
    type: String,
    required: true,
    default: '',
  },
  suggestions: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Add indexes for better query performance
analysisSchema.index({ author: 1, createdAt: -1 });

const Analysis = mongoose.models.Analysis || mongoose.model("Analysis", analysisSchema);

export default Analysis; 