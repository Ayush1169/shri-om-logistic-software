
import { getLedgerSummary } from "../services/ledger.service.js";

export const getSummary = async (req, res) => {
  try {
    const result = await getLedgerSummary({
      branchId: req.query.branchId,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get Ledger Summary:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch ledger data",
    });
  }
};
