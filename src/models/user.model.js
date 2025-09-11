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
    default: 'citizen',
  },

  // 🔹 Department users: track who assigned the issue and when
  assignedIssues: [
    {
      issue: { type: mongoose.Schema.Types.ObjectId, ref: "Issue" },
      assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // authority
      assignedAt: { type: Date, default: Date.now }
    }
  ],

  // 🔹 Authority users: track issues they delegated
  delegatedIssues: [
    {
      issue: { type: mongoose.Schema.Types.ObjectId, ref: "Issue" },
      assignedDepartment: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // department user
      assignedAt: { type: Date, default: Date.now }
    }
  ],

}, { timestamps: true });

export default mongoose.model("User", userSchema);
