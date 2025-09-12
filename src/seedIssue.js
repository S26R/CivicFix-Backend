import mongoose from "mongoose";
import dotenv from "dotenv";
import Issue from "./models/issue.model.js";
import env from "./env.js";

dotenv.config();

const seedIssues = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);

    // Clear old data (optional)
    await Issue.deleteMany({});

    const issues = [
      {
        topic: "Burst water pipeline",
        description: "Water flooding near central road",
        location: { type: "Point", coordinates: [88.3645, 22.5731] },
        upvotes: 12,
        severity: "critical",
        status: "in-progress",
      },
      {
        topic: "Major traffic light failure",
        description: "Signal not working at busy junction",
        location: { type: "Point", coordinates: [88.39, 22.57] },
        upvotes: 50,
        severity: "critical",
        status: "pending",
      },
      {
        topic: "Garbage overflow near market",
        description: "Bin overflowing, bad smell",
        location: { type: "Point", coordinates: [88.37, 22.575] },
        upvotes: 20,
        severity: "moderate",
        status: "in-progress",
      },
      {
        topic: "School boundary wall broken",
        description: "Unsafe for children",
        location: { type: "Point", coordinates: [88.38, 22.571] },
        upvotes: 8,
        severity: "moderate",
        status:"pending",
      },
      {
        topic: "Pothole in residential lane",
        description: "Causing two-wheeler accidents",
        location: { type: "Point", coordinates: [88.365, 22.572] },
        upvotes: 5,
        severity: "minor",
        status:"pending",
      },
      {
        topic: "Broken public bench in park",
        description: "Metal frame sticking out",
        location: { type: "Point", coordinates: [88.40, 22.58] },
        upvotes: 15,
        severity: "minor",
        status:"in-progress",
      }
    ];

    await Issue.insertMany(issues);
    console.log("✅ Issues seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedIssues();
