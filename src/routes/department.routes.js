import express from "express";

import { authenticateUser, authorizeRoles } from "../middleware/auth.middleware.js";
import { getDepartmentIssues, updateDepartmentIssueStatus,  } from "../controllers/department.controller.js";


const router = express.Router();

// 🔹 Get all issues assigned to the department of the logged-in user
router.get("/issues", authenticateUser, authorizeRoles('department'), getDepartmentIssues);

// 🔹 Update the status of a specific issue
router.put("/issues/:id/status", authenticateUser, authorizeRoles('department'), updateDepartmentIssueStatus);

export default router;



