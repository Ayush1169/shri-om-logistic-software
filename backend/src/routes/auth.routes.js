import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { login, getCurrentUser } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", authMiddleware, getCurrentUser);

export default router;