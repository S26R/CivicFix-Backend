import { Router } from "express";
import { getCitizenFeed, getAuthorityFeed, getDepartmentFeed } from "../controllers/issue.controller.js";
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

router.post("/create", upload.array("media", 3), authenticateUser, authorizeRoles("citizen"), createIssue);


export default router;
