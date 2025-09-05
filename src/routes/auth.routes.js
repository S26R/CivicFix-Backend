import { Router } from "express";
import { signup, login,  authorityLogin, departmentLogin, logout } from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", signup);           // citizen signup
router.post("/login", login);             // citizen login
router.post("/login/department", departmentLogin); // department login
router.post("/login/authority", authorityLogin);
router.post('/logout',logout) // logout

export default router;
