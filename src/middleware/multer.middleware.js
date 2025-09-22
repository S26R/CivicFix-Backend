import multer from "multer";

const storage = multer.memoryStorage(); // store in memory for processing

const upload = multer({ storage });

export default upload; // ✅ default export
