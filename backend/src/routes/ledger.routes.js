
import express from "express";
import { getSummary } from "../controllers/ledger.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/summary", getSummary);

export default router;
