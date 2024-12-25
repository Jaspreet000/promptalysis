import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: {
    type: String,
    enum: ['technical', 'creative', 'academic', 'business', 'casual'],
    required: true
  },
  tags: [String],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  usageCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Template || mongoose.model("Template", templateSchema); 