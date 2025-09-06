import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import env from "./env.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import issueRoutes from "./routes/issue.routes.js";

dotenv.config();
dotenv.config();


connectDB();

const app = express();
app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/issues", issueRoutes);

app.listen(env.PORT, () => console.log(`🚀 Server running on port ${env.PORT}`));
