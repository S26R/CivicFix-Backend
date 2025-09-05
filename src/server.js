import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import env from "./env.js";

dotenv.config();
dotenv.config();
console.log("ENV CHECK -> MONGO_URI:", process.env.MONGO_URI);

connectDB();

const app = express();
app.use(cors());
app.use(express.json());
console.log("Registering /api/auth routes...");
app.use("/api/auth", authRoutes);


app.listen(env.PORT, () => console.log(`🚀 Server running on port ${env.PORT}`));
