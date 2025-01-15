import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["analysis", "community", "template", "challenge"],
    required: true,
  },
  earnedAt: {
    type: Date,
    default: Date.now,
  },
});

const Achievement = mongoose.models.Achievement || mongoose.model("Achievement", achievementSchema);

export default Achievement; 