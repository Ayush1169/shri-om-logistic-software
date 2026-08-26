import express from "express";

import {
  create,
  getAll,
  getById,
  update,
  remove,
  updateStatus,
  downloadPdf,
} from "../controllers/bilty.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * Create Bilty
 */
router.post("/", authMiddleware, create);

/**
 * Get All Bilties
 */
router.get("/", authMiddleware, getAll);

/**
 * Get Bilty By ID
 */
router.get("/:id", authMiddleware, getById);

/**
 * Update Bilty
 */
router.put("/:id", authMiddleware, update);

/**
 * Delete Bilty
 */
router.delete("/:id", authMiddleware, remove);

router.patch("/:id/status", authMiddleware, updateStatus);

router.get("/:id/pdf", authMiddleware, downloadPdf);

export default router;