import { v2 as cloudinary } from "cloudinary";
import env from "../env.js"; // make sure your env has CLOUDINARY_* vars

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// Upload buffer to Cloudinary
export const uploadOnCloudinary = async (fileBuffer, fileName) => {
  try {
    if (!fileBuffer) return null;

    const response = await cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        public_id: fileName?.split(".")[0], // optional: keep original name
      },
      (error, result) => {
        if (error) throw error;
        return result;
      }
    );

    // Return uploaded result
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", public_id: fileName?.split(".")[0] },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );

      stream.end(fileBuffer);
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error.message);
    return null;
  }
};
