import { v2 as cloudinary } from 'cloudinary';
import env from '../env.js'; // make sure CLOUDINARY_* vars exist

// Configure Cloudinary once
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a Buffer to Cloudinary.
 * @param {Buffer} fileBuffer
 * @param {string} fileName
 * @returns {Promise<object|null>} result from Cloudinary
 */
export const uploadOnCloudinary = async (fileBuffer, fileName) => {
  if (!fileBuffer) return null;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        public_id: fileName?.split('.')[0], // optional: keep original name
      },
      (err, result) => {
        if (err) {
          console.error('Cloudinary upload error:', err);
          return reject(err);
        }
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};
