import { Router } from "express";
import { getCitizenFeed, getAuthorityFeed, getDepartmentFeed, getAllIssues, getNearbyIssues, upvoteIssue, removeUpvote, rateLimiter, getIssueById, getUserIssues, deleteIssue } from "../controllers/issue.controller.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { createIssue } from "../controllers/issue.controller.js";


const router = Router();

// Citizen feed (no role check yet)
router.get("/feed/citizen", authenticateUser, authorizeRoles("citizen"), getCitizenFeed);

// Authority feed (later add verifyRole("authority"))
router.get("/feed/authority", authenticateUser, authorizeRoles("authority"), getAuthorityFeed);

// Department feed (later add verifyRole("department"))
router.get("/feed/department", authenticateUser, authorizeRoles("department"), getDepartmentFeed);




//ISSUES
router.post("/create", upload.array("media", 3), authenticateUser, authorizeRoles("citizen"), createIssue);
router.get("/allissues", authenticateUser,  getAllIssues);
router.get("/:id",authenticateUser, getIssueById);
router.get("/user/:id", authenticateUser,authorizeRoles("citizen"), getUserIssues); // issues by user id
router.get("/nearby", authenticateUser, getNearbyIssues);
router.delete("/:id", authenticateUser, authorizeRoles("citizen"), deleteIssue);





router.post("/:id/upvote", authenticateUser, authorizeRoles("citizen"), rateLimiter, upvoteIssue);

router.delete("/:id/upvote", authenticateUser, authorizeRoles("citizen"), rateLimiter, removeUpvote);


export default router;
