import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: [true, "Email is required"],
  },
  password: String,
  image: String,
  emailVerified: Date,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User; 