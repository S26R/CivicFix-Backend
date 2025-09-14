// middleware/multer.middleware.js
import multer from "multer";

// Store files in memory so we can directly send their buffers to Cloudinary
const storage = multer.memoryStorage();

// Export the multer instance
export const upload = multer({ storage });

