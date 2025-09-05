import dotenv from "dotenv";
import path from "path";

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const env = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT || 5000,
};



if (!env.MONGO_URI) {
  throw new Error("❌ MONGO_URI is missing in .env file");
}

if (!env.JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is missing in .env file");
}

export default env;
