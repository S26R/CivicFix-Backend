// src/utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { promises as fs } from "fs";
import env from "../env.js"; // make sure your env.js exports CLOUDINARY_* variables

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Cleanup local file
    await fs.unlink(localFilePath).catch(() => {});

    return response;
  } catch (error) {
    await fs.unlink(localFilePath).catch(() => {});
    console.error("Cloudinary upload error:", error.message);
    return null;
  }
};
