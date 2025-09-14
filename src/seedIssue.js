import mongoose from "mongoose";
import dotenv from "dotenv";
import Issue from "./models/issue.model.js";
import env from "./env.js"; // Your env file

dotenv.config();

const seedIssues = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);

    // Clear old data
    await Issue.deleteMany({});

    const issues = [
      {
        topic: "Burst water pipeline",
        description: "Water flooding near central road",
        department: "Water Supply & Drainage Department",
        location: { type: "Point", coordinates: [78.601, 13.010] },
        media: [{ type: "image", url: "https://res.cloudinary.com/dwxjpdtqf/image/upload/v1757563224/wk64v6jezyyjuryzo2hv.png" }],
        severity: "critical",
        status: "raised",
        uploadedBy: new mongoose.Types.ObjectId(),
      },
      {
        topic: "Traffic light not working",
        description: "Signal not functioning at busy junction",
        department: "Public Safety & Transport Department",
        location: { type: "Point", coordinates: [78.602, 13.011] },
        media: [],
        severity: "critical",
        status: "in-progress",
        uploadedBy: new mongoose.Types.ObjectId(),
      },
      {
        topic: "Overflowing garbage bin",
        description: "Bad smell near the marketplace",
        department: "Sanitation & Waste Management Department",
        location: { type: "Point", coordinates: [78.603, 13.012] },
        media: [],
        severity: "moderate",
        status: "raised",
        uploadedBy: new mongoose.Types.ObjectId(),
      },
      {
        topic: "Pothole in main road",
        description: "Two-wheeler accidents reported",
        department: "Roads & Infrastructure Department",
        location: { type: "Point", coordinates: [78.604, 13.013] },
        media: [],
        severity: "moderate",
        status: "in-progress",
        uploadedBy: new mongoose.Types.ObjectId(),
      },
      {
        topic: "Streetlight not working",
        description: "Area dark at night",
        department: "Street Lighting & Electricity Department",
        location: { type: "Point", coordinates: [78.605, 13.014] },
        media: [],
        severity: "moderate",
        status: "raised",
        uploadedBy: new mongoose.Types.ObjectId(),
      },
      {
        topic: "Broken park bench",
        description: "Metal protruding, unsafe",
        department: "Parks & Public Spaces Department",
        location: { type: "Point", coordinates: [78.606, 13.015] },
        media: [],
        severity: "minor",
        status: "raised",
        uploadedBy: new mongoose.Types.ObjectId(),
      },
      {
        topic: "Illegal dumping",
        description: "Construction waste near river",
        department: "Pollution Control Department",
        location: { type: "Point", coordinates: [78.607, 13.016] },
        media: [],
        severity: "moderate",
        status: "raised",
        uploadedBy: new mongoose.Types.ObjectId(),
      },
      {
        topic: "Stray dogs attack",
        description: "Residents scared, minor injuries",
        department: "Animal Control Department",
        location: { type: "Point", coordinates: [78.608, 13.017] },
        media: [],
        severity: "minor",
        status: "raised",
        uploadedBy: new mongoose.Types.ObjectId(),
      },
      {
        topic: "Cracked sidewalk",
        description: "Dangerous for pedestrians",
        department: "Roads & Infrastructure Department",
        location: { type: "Point", coordinates: [78.609, 13.018] },
        media: [],
        severity: "minor",
        status: "in-progress",
        uploadedBy: new mongoose.Types.ObjectId(),
      },
      {
        topic: "Water leakage in street",
        description: "Slippery surface, risk of accident",
        department: "Water Supply & Drainage Department",
        location: { type: "Point", coordinates: [78.610, 13.019] },
        media: [],
        severity: "moderate",
        status: "raised",
        uploadedBy: new mongoose.Types.ObjectId(),
      },
    ];

    await Issue.insertMany(issues);
    console.log("✅ 10 Issues seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedIssues();
