import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    description: { type: String, required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    upvotes: { type: Number, default: 0 },
    severity: {
      type: String,
      enum: ["critical", "moderate", "minor"],
      default: "moderate",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// 2dsphere index for geospatial queries
issueSchema.index({ location: "2dsphere" });

const Issue = mongoose.model("Issue", issueSchema);
export default Issue;
