import * as challanService from "../services/challan.service.js";

/**
 * Upload Challan
 */
export const uploadChallan = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF or Image.",
      });
    }

    const result = await challanService.uploadChallan(req);

    return res.status(201).json({
      success: true,
      message: "Challan uploaded successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Upload Challan Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getChallanPreview = async (req, res) => {
  try {
    const data = await challanService.getChallanPreview(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Challan preview fetched successfully.",
      data,
    });
  } catch (error) {
    console.error("Get Challan Preview Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const importChallanBilties = async (req, res) => {
  try {
    console.log("========== IMPORT REQUEST ==========");
    console.log("PARAMS:", req.params);
    console.log("BODY:", req.body);
    console.log("USER:", req.user);
    console.log("====================================");

    const challanId = Number(req.params.id);

    const items = req.body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one item to import.",
        receivedBody: req.body,
      });
    }

    const userId = req.user?.id || 1;

    const data = await challanService.importChallanBilties(
      challanId,
      userId,
      items
    );

    return res.status(200).json({
      success: true,
      message: "Challan bilties imported successfully.",
      data,
    });

  } catch (error) {
    console.error("Import Challan Bilties Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to import challan bilties",
    });
  }
};

export const getAllChallans = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
    } = req.query;

    const result = await challanService.getChallans(
      Number(page),
      Number(limit),
      search,
      status
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get Challans Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch challans",
    });
  }
};