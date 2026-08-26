import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getAllCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  toggleCustomerStatus,
} from "../controllers/customer.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getAllCustomers);
router.get("/:id", authMiddleware, getCustomerById);
router.post("/", authMiddleware, createCustomer);
router.put("/:id", authMiddleware, updateCustomer);
router.patch("/:id/status",authMiddleware,toggleCustomerStatus);

export default router;