
import {
  createCashReceipt,
  getCashReceipts,
  getCashReceiptById,
  deleteCashReceipt,
} from "../services/cashReceipt.service.js";

export const create = async (req, res) => {
  try {
    const receipt = await createCashReceipt(req.body, req.user.id);

    return res.status(201).json({
      success: true,
      message: "Cash receipt created successfully",
      data: receipt,
    });
  } catch (error) {
    console.error("Create Cash Receipt:", error);

    const knownErrors = [
      "A valid bilty is required",
      "A valid branch is required",
      "Invalid consignee",
      "Package count must be a non-negative integer",
      "Paid amount cannot exceed the receipt total",
      "Bilty not found",
      "Branch not found",
      "User not found",
      "Consignee not found",
    ];

    if (
      knownErrors.includes(error.message) ||
      /must be a valid non-negative amount/.test(error.message)
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create cash receipt",
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const result = await getCashReceipts({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search || "",
      branchId: req.query.branchId,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
    });

    return res.json({ success: true, ...result });
  } catch (error) {
    console.error("Get Cash Receipts:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch cash receipts",
    });
  }
};

export const getById = async (req, res) => {
  try {
    const receipt = await getCashReceiptById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Cash receipt not found",
      });
    }

    return res.json({ success: true, data: receipt });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const remove = async (req, res) => {
  try {
    await deleteCashReceipt(req.params.id);

    return res.json({
      success: true,
      message: "Cash receipt deleted successfully",
    });
  } catch (error) {
    console.error("Delete Cash Receipt:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Cash receipt not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to delete cash receipt",
    });
  }
};
