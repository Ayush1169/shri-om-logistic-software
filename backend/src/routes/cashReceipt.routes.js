
import express from "express";
import {
  create,
  getAll,
  getById,
  remove,
} from "../controllers/cashReceipt.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", create);
router.get("/", getAll);
router.get("/:id", getById);
router.delete("/:id", remove);

export default router;
