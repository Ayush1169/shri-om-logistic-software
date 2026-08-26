import express from "express";
import {
  getAllVehicles,
  createVehicle,
  getVehicleById,
  updateVehicle,
  toggleVehicleStatus,
} from "../controllers/vehicle.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAllVehicles);

router.post("/", authMiddleware, createVehicle);

router.get("/:id", authMiddleware, getVehicleById);

router.put("/:id", authMiddleware, updateVehicle);

router.patch("/:id/status", authMiddleware, toggleVehicleStatus);

export default router;