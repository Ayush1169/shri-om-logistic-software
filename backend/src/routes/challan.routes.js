import express from "express";
import upload from "../middleware/upload.middleware.js";
import * as challanController from "../controllers/challan.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Upload Challan
router.post(
  "/upload",
  authMiddleware,
  upload.single("challan"),
  challanController.uploadChallan
);

// Get Challan Preview
router.get(
  "/:id/preview",
  authMiddleware,
  challanController.getChallanPreview
);

router.post(
  "/:id/import",
  authMiddleware,
  challanController.importChallanBilties
);

// Get All Challans
router.get(
  "/",
  authMiddleware,
  challanController.getAllChallans
);

export default router;