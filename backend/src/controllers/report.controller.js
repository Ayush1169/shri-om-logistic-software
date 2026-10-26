import { getBiltyReport } from "../services/report.service.js";

export const getBiltyReportController = async (req, res) => {
  try {
    const {
      fromDate,
      toDate,
      branchId,
      vehicleId,
      paymentType,
      status,
      page,
      limit,
    } = req.query;

    const validPaymentTypes = ["PAID", "TO_PAY", "BILLING"];
    const validStatuses = [
      "BOOKED",
      "LOADED",
      "IN_TRANSIT",
      "DELIVERED",
      "CANCELLED",
    ];

    if (paymentType && !validPaymentTypes.includes(paymentType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment type",
      });
    }

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bilty status",
      });
    }

    const result = await getBiltyReport({
      fromDate,
      toDate,
      branchId,
      vehicleId,
      paymentType,
      status,
      page,
      limit,
    });

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Bilty Report Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate bilty report",
    });
  }
};