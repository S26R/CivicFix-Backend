import { Router } from "express";
import { signup, login,  authorityLogin, departmentLogin, logout, profile } from "../controllers/auth.controller.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", signup);           // citizen signup
router.post("/login", login); 
router.get("/profile/:id", authenticateUser, authorizeRoles('citizen'), profile);
// citizen login
router.post("/login/department", departmentLogin); // department login
router.post("/login/authority", authorityLogin);
router.post('/logout',logout) // logout

export default router;
