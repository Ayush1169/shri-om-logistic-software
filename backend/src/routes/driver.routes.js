import express from "express";

import {
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  toggleDriverStatus,
} from "../controllers/driver.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";

import {
  createDriverSchema,
  updateDriverSchema,
} from "../validators/driver.validator.js";

const router = express.Router();

router.get("/", authMiddleware, getAllDrivers);

router.get("/:id", authMiddleware, getDriverById);

router.post(
  "/",
  authMiddleware,
  validate(createDriverSchema),
  createDriver
);

router.put(
  "/:id",
  authMiddleware,
  validate(updateDriverSchema),
  updateDriver
);

router.patch(
  "/:id/status",
  authMiddleware,
  toggleDriverStatus
);

export default router;