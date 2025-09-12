import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import env from "./env.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import authorityRoutes from "./routes/authority.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import job from "./utils/cron.js";
    
// Start the cron job
job.start();
dotenv.config();
dotenv.config();


connectDB();

const app = express();


app.use(cors({
  origin: '*',
}));

app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/issues", issueRoutes);
app.use('/api/authority', authorityRoutes);
app.use('/api/department', departmentRoutes);

app.listen(env.PORT, () => console.log(`🚀 Server running on port ${env.PORT}`));



