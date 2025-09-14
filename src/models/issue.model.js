import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    description: { type: String, required: true },

    department: { 
      type: String, 
      enum: [
        "Roads & Infrastructure Department",
        "Street Lighting & Electricity Department",
        "Water Supply & Drainage Department",
        "Sanitation & Waste Management Department",
        "Public Safety & Transport Department",
        "Parks & Public Spaces Department",
        "Pollution Control Department",
        "Animal Control Department",
        "General Department"
      ],
      required: true 
    },

    // 🔹 Currently assigned department user
    assignedDepartment: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // 🔹 Authority who assigned the issue
    assignedByAuthority: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // 🔹 Assignment history (tracks reassignment too)
    assignmentHistory: [
      {
        assignedDepartment: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // authority
        assignedAt: { type: Date, default: Date.now }
      }
    ],

    // Media uploads
    media: [
      {
        type: {
          type: String,
          enum: ["image", "video", "audio"],
          required: true,
        },
        url: { type: String, required: true }, // Cloudinary or S3 URL
        publicId: { type: String }, // Cloudinary public ID for deletion
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
      enum: ["verifying", "raised", "in-progress", "resolved", "rejected", "assigned"],
      default: "raised",
    },

    // Track status changes
    statusHistory: [
      {
        status: { type: String, enum: ["verifying", "in-progress", "resolved", "rejected", "assigned"] },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changedAt: { type: Date, default: Date.now }
      }
    ],

    // Track the reporting user
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Proof images from municipality for state changes
    municipalityProofs: [
      {
        status: { type: String, enum: ["raised", "in-progress", "resolved"] },
        mediaUrl: { type: String }, // proof image/video
        addedAt: { type: Date, default: Date.now },
      },
    ],

    joinExisting: { type: Boolean, default: false },

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
