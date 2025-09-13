import e from "express";
import Issue from "../models/issue.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // your util that returns { url, public_id, resource_type }
import rateLimit from "express-rate-limit";

export const createIssue = async (req, res) => {
  try {
    let { topic, description, lat, lng, severity, department, joinExisting } =
      req.body;

    // Remove extra quotes
    topic = topic?.replace(/^"(.*)"$/, "$1");
    description = description?.replace(/^"(.*)"$/, "$1");

    // Convert numbers
    lat = parseFloat(lat);
    lng = parseFloat(lng);

    // Convert to boolean if needed
    if (typeof joinExisting === "string") {
      joinExisting = joinExisting.toLowerCase() === "true";
    }

    if (!topic || !description || !lat || !lng || !department) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const nearbyIssue = await Issue.findOne({
      department,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: 12, // 12 meters
        },
      },
    });

    // Step 2: If similar issue exists & user hasn’t decided yet
    if (nearbyIssue && joinExisting === undefined) {
      return res.status(200).json({
        similarFound: true,
        nearbyIssue,
        msg: "Similar issue found, do you want to join or create a new one?",
      });
    }

    // Step 3: If user wants to join existing issue
    else if (nearbyIssue && joinExisting === true) {
      console.log("Joining existing issue:", nearbyIssue);
      // Add this user to participants
      if (!nearbyIssue.participants.includes(req.user.id)) {
        nearbyIssue.participants.push(req.user.id);
        await nearbyIssue.save();
      }
      return res
        .status(200)
        .json({ msg: "Joined existing issue", issue: nearbyIssue });
    } else {
      let media = [];

      if (req.files && req.files.length > 0) {
        const uploads = await Promise.all(
          req.files.map(async (file) => {
            const result = await uploadOnCloudinary(file.path);

            return {
              type: result.resource_type,
              url: result.secure_url,
              publicId: result.public_id,
            };
          })
        );
        media = uploads.filter(Boolean); // remove nulls
      }

      const newIssue = new Issue({
        topic,
        description,
        department,
        severity: severity || "moderate",
        location: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        media,
        uploadedBy: req.user.id, // from auth middleware
      });

      await newIssue.save();
       res
        .status(201)
        .json({ message: "Issue created successfully", issue: newIssue });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create issue" });
  }
};

export const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }
    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Citizen Feed
export const getNearbyIssues = async (req, res) => {
  try {
    const { lng, lat, radius } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ error: "Longitude and latitude required" });
    }

    const issues = await Issue.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius) || 2000, // default 2 km
        },
      },
    });

    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all issues (for map)
export const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getUserIssues = async (req, res) => {
  try {
    const userId = req.params.id;
    const issues = await Issue.find({ uploadedBy: userId });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};  


export const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ msg: "Issue not found" });
    }

    // Check if the logged-in user is the one who created the issue
    if (issue.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized action" });
    }

    await issue.deleteOne();
    res.json({ msg: "Issue deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};



// ✅ Upvote an issue
export const upvoteIssue = async (req, res) => {
  try {
    const userId = req.user.id; // assuming auth middleware sets req.user
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ msg: "Issue not found" });
    }

    if (issue.upvotes.includes(userId)) {
      return res.status(400).json({ msg: "Already upvoted" });
    }

    issue.upvotes.push(userId);
    await issue.save();

    res.json({ msg: "Upvoted successfully", count: issue.upvotes.length });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ✅ Remove upvote
export const removeUpvote = async (req, res) => {
  try {
    const userId = req.user.id;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ msg: "Issue not found" });
    }

    if (!issue.upvotes.includes(userId)) {
      return res.status(400).json({ msg: "You haven’t upvoted this issue" });
    }

    issue.upvotes = issue.upvotes.filter(
      (id) => id.toString() !== userId.toString()
    );
    await issue.save();

    res.json({ msg: "Upvote removed", count: issue.upvotes.length });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const rateLimiter = rateLimit({
  window: 60 * 1000,
  max: 5,
  message: { msg: "Too many voting actions, please try again after a minute" },
});







//FEEDS OF ISSUES


export const getCitizenFeed = async (req, res) => {
  try {
    const { lat, lng, context = "urban" } = req.query;
      console.log(lat, lng, context);
    const weightMap = {
      rural: { alpha: 0.6, beta: 0.2, gamma: 0.2, delta: 0.0 },
      semiurban: { alpha: 0.4, beta: 0.3, gamma: 0.2, delta: 0.1 },
      urban: { alpha: 0.3, beta: 0.4, gamma: 0.2, delta: 0.1 },
    };
    const { alpha, beta, gamma, delta } = weightMap[context];
    const maxDistance = 5000; // 5km cap

    const issues = await Issue.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          distanceField: "distance",
          spherical: true,
          maxDistance,
          query: { status: { $ne: "resolved" } }, // Exclude resolved issues
        },
      },
      {
        $addFields: {
          proximityFactor: {
            $subtract: [1, { $divide: ["$distance", maxDistance] }],
          },
          upvoteFactor: { 
  $min: [
    { $divide: [{ $size: "$upvotes" }, 100] },
    1
  ] 
},
          recencyFactor: {
            $exp: {
              $multiply: [
                -0.3,
                {
                  $divide: [
                    { $subtract: [new Date(), "$createdAt"] },
                    1000 * 60 * 60 * 24,
                  ],
                },
              ],
            },
          },
          severityFactor: {
            $switch: {
              branches: [
                { case: { $eq: ["$severity", "critical"] }, then: 1.0 },
                { case: { $eq: ["$severity", "moderate"] }, then: 0.6 },
                { case: { $eq: ["$severity", "minor"] }, then: 0.3 },
              ],
              default: 0.5,
            },
          },
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ["$proximityFactor", alpha] },
              { $multiply: ["$upvoteFactor", beta] },
              { $multiply: ["$recencyFactor", gamma] },
              { $multiply: ["$severityFactor", delta] },
            ],
          },
        },
      },
      { $sort: { score: -1 } },
      { $limit: 20 },
    ]);

    res.json({ issues });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
};

// placeholders for future
export const getAuthorityFeed = (req, res) => {
  res.json({ message: "Authority feed - to be implemented" });
};

export const getDepartmentFeed = (req, res) => {
  res.json({ message: "Department feed - to be implemented" });
};
