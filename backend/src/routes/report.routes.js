import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getBiltyReportController } from "../controllers/report.controller.js";

const router = express.Router();

router.get("/bilties", authMiddleware, getBiltyReportController);

export default router;