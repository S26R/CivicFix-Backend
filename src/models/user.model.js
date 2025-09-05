import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  aadhaar: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wardNumber: { type: String },
  villageArea: { type: String },
  location: { type: String },
  role: {
    type: String,
    enum: ['citizen', 'department', 'authority'],
    default: 'citizen', // 💡 Fix: Add a default value
  },
}, { timestamps: true });

export default mongoose.model("User", userSchema);