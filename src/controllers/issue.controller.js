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
            type: result.resource_type, // "image" | "video" | "audio"
            url: result.secure_url,
            publicId: result.public_id,
          };
        })
      );
      media = uploads;
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

    res.status(201).json({ message: "Issue created successfully", issue: newIssue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create issue" });
  }
};
