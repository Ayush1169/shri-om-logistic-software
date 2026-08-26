import express from "express";
import { createSuperAdmin } from "../controllers/setup.controller.js";

const router = express.Router();

router.post("/create-super-admin", createSuperAdmin);

export default router;