import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    issueId: { type: String, unique: true }, // ✅ Custom ID like ISU-123

    topic: { type: String, required: true },
    description: { type: String, required: true },

assignedDepartmentName: {
  type: String,
  enum: [
"Electricity",
 "Garbage & Sanitation",
 "Health Services",
 "Roads & Infrastructure",
 "Street Lights",
 "Water Supply"
  ],
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

    // Media uploads (image + video only)
    media: [
      {
        type: {
          type: String,
          enum: ["image", "video"], // ✅ audio removed here
          required: true,
        },
        url: { type: String, required: true },
      },
    ],

    // 🔹 Separate audio field
    audio: {
      url: { type: String },
      duration: { type: Number }, // optional: length in seconds
      format: { type: String },   // optional: mp3, wav, etc.
    },

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
    status: { 
      type: String, 
      enum: ["raised","verifying", "in-progress", "resolved", "rejected", "assigned"] 
    },
    changedBy: { 
      type: String, 
      validate: {
        validator: function(v) {
          // Accept either "system" or a string that looks like a userId
          return v === "system" || typeof v === "string";
        },
        message: props => `${props.value} is not a valid user ID or "system"`
      }
    },
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
