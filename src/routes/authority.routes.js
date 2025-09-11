import { Router } from "express";
import { authenticateUser, authorizeRoles } from "../middleware/auth.middleware.js";

import { assignIssueToDepartment, getAllIssuesForAuthority, getAllUsers, getAnalyticsData, updateIssueStatus } from "../controllers/authority.dashboard.controller.js";


const router=Router();


router.get('/dashboard/analytics',authenticateUser, authorizeRoles("authority"), getAnalyticsData);
router.get('/allIssues',authenticateUser, authorizeRoles("authority"), getAllIssuesForAuthority);
router.get('/allUsers',authenticateUser, authorizeRoles("authority"), getAllUsers);


//ISSUE MANAGEMENT BY AUTHORITY
router.put('/issue/:id/updateStatus', authenticateUser, authorizeRoles("authority"), updateIssueStatus);

// routes/admin.routes.js
router.put("/issues/:id/assignIssue", authenticateUser, authorizeRoles("authority"), assignIssueToDepartment);
//here param id is issue id but department id and admin id should be from body





export default router;

