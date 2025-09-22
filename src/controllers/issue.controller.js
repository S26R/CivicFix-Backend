
import Issue from "../models/issue.model.js";
 // your util that returns { url, public_id, resource_type }
import rateLimit from "express-rate-limit";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
// export const createIssue = async (req, res) => {
//   try {
//     let { topic, description, lat, lng, severity, departemnt, joinExisting } =
//       req.body;

//     topic = topic?.replace(/^"(.*)"$/, "$1");
//     description = description?.replace(/^"(.*)"$/, "$1");

//     lat = parseFloat(lat);
//     lng = parseFloat(lng);

//     if (typeof joinExisting === "string") {
//       joinExisting = joinExisting.toLowerCase() === "true";
//     }

//     if (!topic || !description || !lat || !lng || !department) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // Check for nearby similar issue
//     const nearbyIssue = await Issue.findOne({
//       department,
//       location: {
//         $near: {
//           $geometry: { type: "Point", coordinates: [lng, lat] },
//           $maxDistance: 12, // meters
//         },
//       },
//     });

//     // Step 2: Similar issue found
//     if (nearbyIssue && joinExisting === undefined) {
//       return res.status(200).json({
//         similarFound: true,
//         nearbyIssue,
//         msg: "Similar issue found, do you want to join or create a new one?",
//       });
//     }

//     // Step 3: Join existing issue
//     else if (nearbyIssue && joinExisting === true) {
//       const userId = req.user.userId || req.user.id; // ✅ accept new or old
//       if (!nearbyIssue.participants.includes(userId)) {
//         nearbyIssue.participants.push(userId);
//         await nearbyIssue.save();
//       }
//       return res.status(200).json({
//         msg: "Joined existing issue",
//         issue: nearbyIssue,
//       });
//     }

//     // Step 4: Create new issue
//     let media = [];
//     if (req.files && req.files.length > 0) {
//       const uploads = await Promise.all(
//         req.files.map(async (file) => {
//           const result = await uploadOnCloudinary(file.buffer, file.originalname);
//           if (!result) return null;
//           return {
//             type: result.resource_type,
//             url: result.secure_url,
//             publicId: result.public_id,
//           };
//         })
//       );
//       media = uploads.filter(Boolean);
//     }

//     const userId = req.user.userId || req.user.id; // ✅ use new userId if exists

//     const newIssue = new Issue({
//       topic,
//       description,
//       department,
//       severity: severity || "moderate",
//       location: {
//         type: "Point",
//         coordinates: [lng, lat],
//       },
//       media,
//       uploadedBy: userId,
//       participants: [userId], // uploader is first participant
//     });

//     await newIssue.save();
//     res.status(201).json({
//       message: "Issue created successfully",
//       issue: newIssue,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to create issue", details: err.message });
//   }
// };


import compressImage from "../utils/compressImage.js";
import compressVideo from "../utils/compressVideo.js";
import compressAudio from "../utils/compressAudio.js";
import axios from "axios";


// export const createIssue = async (req, res) => {
//   try {
//     let { topic, description, lat, lng, severity, joinExisting } = req.body;

//     topic = topic?.replace(/^"(.*)"$/, "$1");
//     description = description?.replace(/^"(.*)"$/, "$1");

//     lat = parseFloat(lat);
//     lng = parseFloat(lng);

//     if (typeof joinExisting === "string") {
//       joinExisting = joinExisting.toLowerCase() === "true";
//     }

//     if (!topic || !description || !lat || !lng ) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // ✅ Step 1: Check for similar nearby issue
//     const nearbyIssue = await Issue.findOne({
//       assignedDepartmentName,
//       location: {
//         $near: {
//           $geometry: { type: "Point", coordinates: [lng, lat] },
//           $maxDistance: 12,
//         },
//       },
//     });

//     if (nearbyIssue && joinExisting === undefined) {
//       return res.status(200).json({
//         similarFound: true,
//         nearbyIssue,
//         msg: "Similar issue found, do you want to join or create a new one?",
//       });
//     }

//     if (nearbyIssue && joinExisting === true) {
//       const userId = req.user.userId || req.user.id;
//       if (!nearbyIssue.participants.includes(userId)) {
//         nearbyIssue.participants.push(userId);
//         await nearbyIssue.save();
//       }
//       return res.status(200).json({
//         msg: "Joined existing issue",
//         issue: nearbyIssue,
//       });
//     }

//     // ✅ Step 2: Handle uploads
//     let media = [];
//     let audio = null;

//     if (req.files) {
//       // Handle images & videos
//       if (req.files.media && req.files.media.length > 0) {
//         const uploads = await Promise.all(
//           req.files.media.map(async (file) => {
//             let compressedBuffer;
//             if (file.mimetype.startsWith("image")) {
//               compressedBuffer = await compressImage(file.buffer);
//             } else if (file.mimetype.startsWith("video")) {
//               compressedBuffer = await compressVideo(file.buffer);
//             } else {
//               return null;
//             }

//             const result = await uploadOnCloudinary(compressedBuffer, file.originalname);
//             if (!result) return null;

//             return {
//               type: result.resource_type === "video" ? "video" : "image",
//               url: result.secure_url,
//               publicId: result.public_id,
//             };
//           })
//         );
//         media = uploads.filter(Boolean);
//       }

//       // Handle audio separately
//       if (req.files.audio && req.files.audio[0]) {
//         const audioFile = req.files.audio[0];
//         const compressedAudio = await compressAudio(audioFile.buffer);
//         const result = await uploadOnCloudinary(compressedAudio, audioFile.originalname);
//         if (result) {
//           audio = {
//             url: result.secure_url,
//             format: result.format,
//           };
//         }
//       }
//     }

//     const userId = req.user.userId || req.user.id;

//     // ✅ Step 3: Create issue with "raised" status
//     const newIssue = new Issue({
//       topic,
//       description,
//       severity: severity || "moderate",
//       location: { type: "Point", coordinates: [lng, lat] },
//       media,
//       audio,
//       uploadedBy: userId,
//       participants: [userId],
//       status: "raised",
//     });

//     await newIssue.save();

//     // ✅ Step 4: Call verification API
//     try {
//       // Update status → verifying
//       newIssue.status = "verifying";
//       await newIssue.save();

//       const verifyPayload = {
//         description: newIssue.title,
//         image: media.find((m) => m.type === "image")?.url,
//         video: media.find((m) => m.type === "video")?.url,
//         audio: audio?.url,
//       };

//       const verifyResponse = await axios.post("http://localhost:8000/predict_all", verifyPayload);

//       // If verification passes → assign
//       if (verifyResponse.data?.final_departments?.length) {
//         newIssue.status = "assigned";
//         newIssue.assignedDepartmentName = verifyResponse.data.final_departments[0];
//       } else {
//         newIssue.status = "rejected";
//       }
//       await newIssue.save();
//     } catch (verificationError) {
//       console.error("Verification failed:", verificationError.message);
//       newIssue.status = "rejected";
//       await newIssue.save();
//     }

//     res.status(201).json({
//       message: "Issue created successfully",
//       issue: newIssue,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to create issue", details: err.message });
//   }
// };

export const createIssue = async (req, res) => {
  try {
    let { topic, description, lat, lng, severity } = req.body;

    topic = topic?.replace(/^"(.*)"$/, "$1");
    description = description?.replace(/^"(.*)"$/, "$1");

    lat = parseFloat(lat);
    lng = parseFloat(lng);

    if (!topic || !description || !lat || !lng) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userId = req.user.userId || req.user.id;
     console.log(userId,"User ID")
    // Step 1: Handle media & audio uploads with compression
    let media = [];
    let audio = null;

    if (req.files) {
      // Handle images & videos
      if (req.files.media && req.files.media.length > 0) {
        const uploads = await Promise.all(
          req.files.media.map(async (file) => {
            let compressedBuffer;
            if (file.mimetype.startsWith("image")) {
              compressedBuffer = await compressImage(file.buffer);
            } else if (file.mimetype.startsWith("video")) {
              compressedBuffer = await compressVideo(file.buffer);
            } else {
              return null;
            }

            const result = await uploadOnCloudinary(compressedBuffer, file.originalname);
            if (!result) return null;

            return {
              type: result.resource_type === "video" ? "video" : "image",
              url: result.secure_url,
              publicId: result.public_id,
            };
          })
        );
        media = uploads.filter(Boolean);
      }

      // Handle audio separately
      if (req.files.audio && req.files.audio[0]) {
        const audioFile = req.files.audio[0];
        const compressedAudio = await compressAudio(audioFile.buffer);
        const result = await uploadOnCloudinary(compressedAudio, audioFile.originalname);
        if (result) {
          audio = {
            url: result.secure_url,
            format: result.format,
          };
        }
      }
    }

    // Step 2: Create issue with status "raised"
    let newIssue = new Issue({
      topic,
      description,
      severity: severity || "moderate",
      location: { type: "Point", coordinates: [lng, lat] },
      media,
      audio,
      uploadedBy: userId ,
      participants: [userId],
      status: "raised",
      statusHistory: [{ status: "raised", changedBy: userId }],
    });

    await newIssue.save();

    res.status(201).json({
      message: "Issue created successfully and marked as raised",
      issue: newIssue,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create issue", details: err.message });
  }
};



export const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find by Mongo _id first, then fallback to issueId
    let issue = await Issue.findById(id);
    if (!issue) {
      issue = await Issue.findOne({ issueId: id });
    }

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
    const issues = await Issue.find({
      $or: [
        { uploadedBy: userId },
        { participants: userId }
      ]
    });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id) || await Issue.findOne({ issueId: req.params.id });
    if (!issue) return res.status(404).json({ msg: "Issue not found" });

    const userId = req.user.userId || req.user.id;
    if (issue.uploadedBy !== userId) {
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
    const userId = req.user.userId || req.user.id;
    const issue = await Issue.findById(req.params.id) || await Issue.findOne({ issueId: req.params.id });

    if (!issue) return res.status(404).json({ msg: "Issue not found" });

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
    const userId = req.user.userId || req.user.id;
    const issue = await Issue.findById(req.params.id) || await Issue.findOne({ issueId: req.params.id });

    if (!issue) return res.status(404).json({ msg: "Issue not found" });

    if (!issue.upvotes.includes(userId)) {
      return res.status(400).json({ msg: "You haven’t upvoted this issue" });
    }

    issue.upvotes = issue.upvotes.filter((id) => id !== userId);
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
            $min: [{ $divide: [{ $size: "$upvotes" }, 100] }, 1],
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
