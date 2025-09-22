import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    issueId: { type: String, unique: true }, // ✅ Custom ID like ISU-123

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

    // 🔹 Currently assigned department user (custom userId)
    assignedDepartment: { type: String, ref: "User" },

    // 🔹 Authority who assigned the issue (custom userId)
    assignedByAuthority: { type: String, ref: "User" },

    // 🔹 Assignment history
    assignmentHistory: [
      {
        assignedDepartment: { type: String, ref: "User" },
        assignedBy: { type: String, ref: "User" }, // authority userId
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
        url: { type: String, required: true },
      },
    ],

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },

    upvotes: [{ type: String, ref: "User" }], // ✅ store userId

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
        changedBy: { type: String, ref: "User" }, // ✅ custom userId
        changedAt: { type: Date, default: Date.now }
      }
    ],

    // Track the reporting user
    uploadedBy: {
      type: String,
      ref: "User", // ✅ custom userId
      required: true,
    },

    participants: [{ type: String, ref: "User" }], // ✅ custom userId

    // Proof images from municipality for state changes
    municipalityProofs: [
      {
        status: { type: String, enum: ["raised", "in-progress", "resolved"] },
        mediaUrl: { type: String },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    joinExisting: { type: Boolean, default: false },

    falseReportChecks: [
      {
        userId: { type: String, ref: "User" }, // ✅ custom userId
        confirmed: { type: Boolean },
      },
    ],
  },
  { timestamps: true }
);

// 🔹 Geospatial index
issueSchema.index({ location: "2dsphere" });

// 🔹 Pre-save hook to auto-generate issueId
issueSchema.pre("save", async function (next) {
  if (!this.issueId) {
    const lastIssue = await mongoose.model("Issue").findOne().sort({ createdAt: -1 });
    let nextId = 1;

    if (lastIssue && lastIssue.issueId) {
      const lastNum = parseInt(lastIssue.issueId.replace("ISU-", ""), 10);
      nextId = lastNum + 1;
    }

    this.issueId = `ISU-${nextId}`;
  }
  next();
});

const Issue = mongoose.model("Issue", issueSchema);
export default Issue;
