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
      uploadedBy: req.user.id, // from auth middleware
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

// placeholders for future
export const getAuthorityFeed = (req, res) => {
  res.json({ message: "Authority feed - to be implemented" });
};

export const getDepartmentFeed = (req, res) => {
  res.json({ message: "Department feed - to be implemented" });
};
