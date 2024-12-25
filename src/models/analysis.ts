import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({
  userId: String,
  prompt: String,
  mode: String,
  response: String,
  scores: {
    style: Number,
    grammar: Number,
    creativity: Number,
    clarity: Number,
    relevance: Number,
  },
  suggestions: [String],
  createdAt: Date,
});

const Analysis = mongoose.models.Analysis || mongoose.model("Analysis", analysisSchema);

export default Analysis; 