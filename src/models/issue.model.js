import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    description: { type: String, required: true },

    // Media uploads
    media: [
      {
        type: {
          type: String,
          enum: ["image", "video", "audio"],
          required: true,
        },
        url: { type: String, required: true }, // Cloudinary or S3 URL
      },
    ],

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },

    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    severity: {
      type: String,
      enum: ["critical", "moderate", "minor"],
      default: "moderate",
    },

    status: {
      type: String,
      enum: ["pending", "raised", "in-progress", "resolved"],
      default: "pending",
    },

    // Track the reporting user
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
linkedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Proof images from municipality for state changes
    municipalityProofs: [
      {
        status: { type: String, enum: ["raised", "in-progress", "resolved"] },
        mediaUrl: { type: String }, // proof image/video
        addedAt: { type: Date, default: Date.now },
      },
    ],

    falseReportChecks: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        confirmed: { type: Boolean }, // true = valid, false = fake
      },
    ],
  },
  { timestamps: true }
);

issueSchema.index({ location: "2dsphere" });

const Issue = mongoose.model("Issue", issueSchema);
export default Issue;
