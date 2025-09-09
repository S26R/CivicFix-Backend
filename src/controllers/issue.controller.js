import Issue from "../models/issue.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // your util that returns { url, public_id, resource_type }

export const createIssue = async (req, res) => {
  try {
    const { topic, description, lat, lng, severity } = req.body;

    if (!topic || !description || !lat || !lng) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Upload media files (if any)
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
      severity: severity || "moderate",
      location: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
      media,
    });

    await newIssue.save();

    res
      .status(201)
      .json({ message: "Issue created successfully", issue: newIssue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create issue" });
  }
};

// Citizen Feed
export const getCitizenFeed = async (req, res) => {
  try {
    const { lat, lng, context = "urban" } = req.query;

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
          upvoteFactor: { $min: [{ $divide: ["$upvotes", 100] }, 1] },
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

// Authority Feed
export const getAuthorityFeed = async (req, res) => {
  try {
    const { status = "pending", minScore } = req.query;

    // Weights for authority scoring
    const weightMap = {
      importance: 0.5, // pre-defined severity or citizen-reported importance
      upvotes: 0.3, // community support
      aging: 0.2, // older unresolved issues escalate
    };

    // Fetch issues by status
    let issues = await Issue.find({ status }).lean();

    // Calculate score dynamically
    issues = issues.map((issue) => {
      const importanceFactor =
        issue.severity === "critical"
          ? 1
          : issue.severity === "major"
          ? 0.6
          : 0.3;

      const upvoteFactor = Math.min(issue.upvotes / 100, 1); // normalized

      const daysPending = Math.floor(
        (Date.now() - new Date(issue.createdAt)) / (1000 * 60 * 60 * 24)
      );
      const agingFactor = Math.min(daysPending / 30, 1); // max 1 after 30 days

      const score =
        weightMap.importance * importanceFactor +
        weightMap.upvotes * upvoteFactor +
        weightMap.aging * agingFactor;

      return { ...issue, score };
    });

    // Optional Top Priority filter
    if (minScore) {
      issues = issues.filter((issue) => issue.score >= parseFloat(minScore));
    }

    // Sort by score descending
    issues.sort((a, b) => b.score - a.score);

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const startIndex = (page - 1) * limit;
    const paginatedIssues = issues.slice(startIndex, startIndex + limit);

    // Summary stats
    const summary = {
      new: await Issue.countDocuments({ status: "new" }),
      inProgress: await Issue.countDocuments({ status: "inProgress" }),
      resolved: await Issue.countDocuments({ status: "resolved" }),
    };

    res.json({
      summary,
      total: issues.length,
      page,
      issues: paginatedIssues,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch authority feed" });
  }
};

export const getDepartmentFeed = (req, res) => {
  res.json({ message: "Department feed - to be implemented" });
};
