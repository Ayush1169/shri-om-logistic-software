import {
  createBilty,
  getBilties,
  getBiltyById,
  updateBilty,
  deleteBilty,
  updateBiltyStatus,
} from "../services/bilty.service.js";

import { generateBiltyPdf } from "../services/pdf.service.js";

import {
  createBiltySchema,
  updateBiltySchema,
} from "../validators/bilty.validator.js";

/**
 * Create Bilty
 */
export const create = async (req, res) => {
  try {
    const { error, value } = createBiltySchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors: error.details.map((e) => e.message),
      });
    }

    const bilty = await createBilty(value, req.user.id);

    return res.status(201).json({
      success: true,
      message: "Bilty created successfully.",
      data: bilty,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Get All
 */
export const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const result = await getBilties(
      Number(page),
      Number(limit),
      search
    );

    return res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Get By Id
 */
export const getById = async (req, res) => {
  try {
    const bilty = await getBiltyById(req.params.id);

    if (!bilty) {
      return res.status(404).json({
        success: false,
        message: "Bilty not found",
      });
    }

    return res.json({
      success: true,
      data: bilty,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Update
 */
export const update = async (req, res) => {
  try {
    const { error, value } = updateBiltySchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors: error.details.map((e) => e.message),
      });
    }

    const bilty = await updateBilty(req.params.id, value);

    return res.json({
      success: true,
      message: "Bilty updated successfully.",
      data: bilty,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Delete
 */
export const remove = async (req, res) => {
  try {
    await deleteBilty(req.params.id);

    return res.json({
      success: true,
      message: "Bilty deleted successfully.",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const bilty = await updateBiltyStatus(
      req.params.id,
      status
    );

    return res.json({
      success: true,
      message: "Bilty status updated successfully.",
      data: bilty,
    });
  } catch (err) {
    console.error(err);

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const downloadPdf = async (req, res) => {
  try {
    const bilty = await getBiltyById(req.params.id);

    if (!bilty) {
      return res.status(404).json({
        success: false,
        message: "Bilty not found",
      });
    }

    await generateBiltyPdf(bilty, res);
  } catch (err) {
    console.error("Bilty PDF Error:", err);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
};