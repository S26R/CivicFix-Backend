import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true }, // ✅ Custom ID like USR-123
  name: { type: String },

  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  aadhaar: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  wardNumber: { type: String },
  villageArea: { type: String },
  location: { type: String },

  role: {
    type: String,
    enum: ["citizen", "department", "authority"],
    default: "citizen",
  },

  // 🔹 Department-specific fields
  departmentName: { type: String },       // e.g., "Sanitation Department"
  departmentHeadName: { type: String },   // e.g., "Mr. Rajesh Kumar"

  // 🔹 Department users: track who assigned the issue and when
  assignedIssues: [
    {
      issue: { type: mongoose.Schema.Types.ObjectId, ref: "Issue" },
      assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // authority
      assignedAt: { type: Date, default: Date.now },
    },
  ],

  // 🔹 Authority users: track issues they delegated
  delegatedIssues: [
    {
      issue: { type: mongoose.Schema.Types.ObjectId, ref: "Issue" },
      assignedDepartment: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // department user
      assignedAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

// 🔹 Pre-save hook to auto-generate userId
userSchema.pre("save", async function (next) {
  if (!this.userId) {
    const lastUser = await mongoose.model("User").findOne().sort({ createdAt: -1 });
    let nextId = 1;

    if (lastUser && lastUser.userId) {
      const lastNum = parseInt(lastUser.userId.replace("USR-", ""), 10);
      nextId = lastNum + 1;
    }

    this.userId = `USR-${nextId}`;
  }
  next();
});

export default mongoose.model("User", userSchema);
