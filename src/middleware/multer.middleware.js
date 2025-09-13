import multer from "multer";

// Memory storage — avoids local disk usage
const storage = multer.memoryStorage();

// Export multer middleware
export const upload = multer({ storage });
