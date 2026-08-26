import prisma from "../config/prisma.js";
import { extractPdfText } from "./pdf.service.js";
import { parseManifest } from "./parser.service.js";

import {
  savePreviewRows,
  getPreviewRows,
} from "./preview.service.js";

/**
 * =========================================================
 * IMPORT CHALLAN BILTIES
 * =========================================================
 *
 * Important:
 * - Customer master mein customer hona compulsory nahi hai.
 * - consigneeId / consignorId optional hain.
 * - OCR se mila consigneeName direct Bilty mein save hoga.
 * - Partial import allowed hai.
 * - Challan tabhi IMPORTED hoga jab saari rows import ho jayengi.
 */
export async function importChallanBilties(
  challanId,
  userId,
  items = []
) {
  const id = Number(challanId);

  if (!id) {
    throw new Error("Invalid challan ID");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("No items selected for import");
  }

  const result = await prisma.$transaction(async (tx) => {
    // -----------------------------------------
    // 1. CHALLAN
    // -----------------------------------------

    const challan =
      await tx.vehicleChallan.findUnique({
        where: {
          id,
        },
        include: {
          vehicle: true,
          driver: true,
        },
      });

    if (!challan) {
      throw new Error("Challan not found");
    }

    if (challan.status === "IMPORTED") {
      throw new Error(
        "This challan is already imported"
      );
    }

    // -----------------------------------------
    // 2. SELECTED PREVIEW IDS
    // -----------------------------------------

    const previewIds = items
      .map((item) => Number(item.previewId))
      .filter(Boolean);

    if (previewIds.length === 0) {
      throw new Error(
        "No valid preview rows selected"
      );
    }

    // -----------------------------------------
    // 3. PREVIEW ROWS
    // -----------------------------------------

    const previewRows =
      await tx.oCRBiltyPreview.findMany({
        where: {
          id: {
            in: previewIds,
          },
          challanId: id,
          imported: false,
        },
        orderBy: {
          serialNo: "asc",
        },
      });

    if (previewRows.length === 0) {
      throw new Error(
        "Selected preview rows not found"
      );
    }

    // -----------------------------------------
    // 4. FRONTEND DATA MAP
    // -----------------------------------------

    const itemMap = new Map(
      items.map((item) => [
        Number(item.previewId),
        item,
      ])
    );

    const createdBilties = [];

    // -----------------------------------------
    // 5. CREATE BILTIES
    // -----------------------------------------

    for (const row of previewRows) {
      const item = itemMap.get(row.id);

      if (!item) {
        throw new Error(
          `Details missing for preview row ${row.serialNo}`
        );
      }

      // -----------------------------------------
      // LR NO = BILTY NO
      // -----------------------------------------

      const lrNo = String(
        row.lrNo || ""
      ).trim();

      if (!lrNo) {
        throw new Error(
          `LR No missing for row ${row.serialNo}`
        );
      }

      // -----------------------------------------
      // PAYMENT
      // -----------------------------------------

      if (!item.paymentType) {
        throw new Error(
          `Payment type missing for LR ${lrNo}`
        );
      }

      // -----------------------------------------
      // ITEM / GOODS
      // -----------------------------------------

      const goodsDescription =
        item.goodsDescription ||
        row.goods ||
        "General Goods";

      // -----------------------------------------
      // CONSIGNEE NAME
      // Customer module is NOT required
      // -----------------------------------------

      const consigneeName =
        item.consigneeName ||
        row.consignee ||
        null;

      // -----------------------------------------
      // FREIGHT
      // -----------------------------------------

      const freight =
        Number(row.freight || 0);

      const gst =
        Number(item.gst || 0);

      const hamali =
        Number(item.hamali || 0);

      const loadingCharges =
        Number(item.loadingCharges || 0);

      const unloadingCharges =
        Number(item.unloadingCharges || 0);

      const insuranceCharges =
        Number(item.insuranceCharges || 0);

      // -----------------------------------------
      // TOTAL
      // -----------------------------------------

      const totalAmount =
        freight +
        gst +
        hamali +
        loadingCharges +
        unloadingCharges +
        insuranceCharges;

      // -----------------------------------------
      // BILTY CREATE
      // -----------------------------------------

      const biltyNumber = String(row.lrNo || "").trim();

if (!biltyNumber) {
  throw new Error(
    `LR number missing for row ${row.serialNo}`
  );
}

// Check duplicate LR / Bilty number
const existingBilty = await tx.bilty.findUnique({
  where: {
    biltyNumber,
  },
});

if (existingBilty) {
  throw new Error(
    `LR ${biltyNumber} already exists as Bilty`
  );
}

const bilty = await tx.bilty.create({
  data: {
    // =========================
    // BASIC
    // =========================
    biltyNumber,

    bookingDate: parseBiltyDate(
      row.biltyDate
    ),

    branchId: challan.branchId,

    challanId: challan.id,

    // =========================
    // CUSTOMER
    // =========================
    // Customer master mein ho toh ID save hogi.
    // Nahi ho toh null rahega.
    consignorId:
      item.consignorId
        ? Number(item.consignorId)
        : null,

    consigneeId:
      item.consigneeId
        ? Number(item.consigneeId)
        : null,

    // IMPORTANT:
    // Customer master mein na hone par bhi
    // actual consignee name save hoga.
    consigneeName:
      item.consigneeName ||
      row.consignee ||
      null,

    // =========================
    // ADDRESS
    // =========================
    pickupAddress:
      item.pickupAddress ||
      null,

    deliveryAddress:
      item.deliveryAddress ||
      row.destination ||
      null,

    // =========================
    // MARKA + GOODS
    // =========================
    pMarka:
      item.pMarka ||
      row.marka ||
      null,

    goodsDescription:
      item.goodsDescription ||
      row.goods ||
      "General Goods",

    // =========================
    // PACKAGE + WEIGHT
    // =========================
    packageCount:
      Number(
        row.packages ||
        item.packageCount ||
        0
      ),

    actualWeight:
      row.weight != null
        ? Number(row.weight)
        : null,

    chargeableWeight:
      item.chargeableWeight != null
        ? Number(item.chargeableWeight)
        : row.weight != null
          ? Number(row.weight)
          : null,

    // =========================
    // MONEY
    // =========================
    freight:
      Number(row.freight || 0),

    gst:
      Number(item.gst || 0),

    hamali:
      Number(item.hamali || 0),

    loadingCharges:
      Number(item.loadingCharges || 0),

    unloadingCharges:
      Number(item.unloadingCharges || 0),

    insuranceCharges:
      Number(item.insuranceCharges || 0),

    totalAmount:
      Number(row.freight || 0) +
      Number(item.gst || 0) +
      Number(item.hamali || 0) +
      Number(item.loadingCharges || 0) +
      Number(item.unloadingCharges || 0) +
      Number(item.insuranceCharges || 0),

    // =========================
    // PAYMENT
    // =========================
    paymentType:
      item.paymentType || "TO_PAY",

    // =========================
    // OTHER
    // =========================
    eWayBillNumber:
      item.eWayBillNumber ||
      null,

    remarks:
      item.remarks ||
      null,

    // =========================
    // STATUS
    // =========================
    status: "BOOKED",

    // =========================
    // VEHICLE / DRIVER
    // =========================
    vehicleId:
      challan.vehicleId ||
      null,

    driverId:
      challan.driverId ||
      null,

    createdById:
      Number(userId || 1),
  },

  include: {
    branch: true,
    consignor: true,
    consignee: true,
    vehicle: true,
    driver: true,
    challan: true,

    createdBy: {
      select: {
        id: true,
        fullName: true,
        username: true,
      },
    },
  },
});

      // -----------------------------------------
      // MARK PREVIEW IMPORTED
      // -----------------------------------------

      await tx.oCRBiltyPreview.update({
        where: {
          id: row.id,
        },
        data: {
          imported: true,
        },
      });

      createdBilties.push(bilty);
    }

    // -----------------------------------------
    // 6. CHALLAN TOTALS
    // -----------------------------------------

    const totalPackages =
      previewRows.reduce(
        (sum, row) =>
          sum +
          Number(row.packages || 0),
        0
      );

    const totalWeight =
      previewRows.reduce(
        (sum, row) =>
          sum +
          Number(row.weight || 0),
        0
      );

    const totalFreight =
      previewRows.reduce(
        (sum, row) =>
          sum +
          Number(row.freight || 0),
        0
      );

    // -----------------------------------------
    // 7. UPDATE CHALLAN
    // -----------------------------------------

    const updatedChallan =
      await tx.vehicleChallan.update({
        where: {
          id,
        },
        data: {
          totalBilties:
            createdBilties.length,

          totalPackages,

          totalWeight,

          totalFreight,

          status:
            "IMPORTED",
        },
      });

    return {
      challan:
        updatedChallan,

      bilties:
        createdBilties,

      totalBilties:
        createdBilties.length,

      totalPackages,

      totalWeight,

      totalFreight,
    };
  });

  return result;
}


/**
 * =========================================================
 * UPLOAD CHALLAN
 * =========================================================
 */

export async function uploadChallan(req) {
  const file = req.file;

  if (!file) {
    throw new Error(
      "Challan file is required"
    );
  }

  console.log(
    "========== CHALLAN UPLOAD =========="
  );

  console.log(
    "File:",
    file.originalname
  );

  console.log(
    "Path:",
    file.path
  );

  console.log(
    "===================================="
  );

  // =====================================================
  // 1. EXTRACT PDF TEXT
  // =====================================================

  const text =
    await extractPdfText(
      file.path
    );

  // =====================================================
  // 2. PARSE MANIFEST
  // =====================================================

  const parsed =
    parseManifest(text);

  console.log(
    "========== PARSED CHALLAN =========="
  );

  console.log(
    parsed
  );

  console.log(
    "===================================="
  );

  // =====================================================
  // 3. CREATE CHALLAN
  // =====================================================

  const challan =
    await prisma.vehicleChallan.create({
      data: {
        challanNumber:
          `CH-${Date.now()}`,

        challanDate:
          parseBiltyDate(
            parsed.header?.challanDate
          ),

        fileName:
          file.originalname,

        fileUrl:
          file.filename,

        branchId:
          Number(
            req.user?.branchId || 1
          ),

        createdById:
          Number(
            req.user?.id || 1
          ),

        status:
          "UPLOADED",
      },
    });

  // =====================================================
  // 4. SAVE PREVIEW ROWS
  // =====================================================

  await savePreviewRows(
    challan.id,
    parsed.rows || []
  );

  return {
    challan,

    parsed,
  };
}


/**
 * =========================================================
 * GET CHALLAN PREVIEW
 * =========================================================
 */

export async function getChallanPreview(
  challanId
) {
  const id =
    Number(challanId);

  if (!id) {
    throw new Error(
      "Invalid challan ID"
    );
  }

  // =====================================================
  // FETCH CHALLAN
  // =====================================================

  const challan =
    await prisma.vehicleChallan.findUnique({
      where: {
        id,
      },

      include: {
        vehicle: true,
        driver: true,
        branch: true,
      },
    });

  if (!challan) {
    throw new Error(
      "Challan not found"
    );
  }

  // =====================================================
  // FETCH PREVIEW ROWS
  // =====================================================

  const rows =
    await getPreviewRows(id);

  return {
    challan,

    rows,

    totalRows:
      rows.length,
  };
}


/**
 * =========================================================
 * PARSE BILTY DATE
 * DD/MM/YY -> Date
 * =========================================================
 */

function parseBiltyDate(value) {
  if (!value) {
    return new Date();
  }

  const parts =
    String(value)
      .trim()
      .split("/");

  if (parts.length !== 3) {
    return new Date();
  }

  const day =
    Number(parts[0]);

  const month =
    Number(parts[1]);

  const year =
    Number(parts[2]);

  if (
    !day ||
    !month ||
    !year
  ) {
    return new Date();
  }

  const fullYear =
    year < 50
      ? 2000 + year
      : 1900 + year;

  return new Date(
    fullYear,
    month - 1,
    day
  );
}


/**
 * =========================================================
 * NORMALIZE PAYMENT TYPE
 * =========================================================
 *
 * Frontend/OCR mein:
 *
 * "TO PAY"
 * "TO_PAY"
 * "to pay"
 *
 * sab ko:
 *
 * TO_PAY
 *
 * mein convert karega.
 */

function normalizePaymentType(
  value
) {
  if (!value) {
    return null;
  }

  const normalized =
    String(value)
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");

  if (
    normalized === "PAID"
  ) {
    return "PAID";
  }

  if (
    normalized === "TO_PAY"
  ) {
    return "TO_PAY";
  }

  if (
    normalized === "BILLING"
  ) {
    return "BILLING";
  }

  return null;
}


/**
 * =========================================================
 * GET ALL CHALLANS
 * =========================================================
 */

export async function getChallans(
  page = 1,
  limit = 10,
  search = "",
  status = ""
) {
  const currentPage =
    Number(page) || 1;

  const currentLimit =
    Number(limit) || 10;

  const skip =
    (currentPage - 1) *
    currentLimit;

  const where = {};

  // =====================================================
  // SEARCH
  // =====================================================

  if (search) {
    where.OR = [
      {
        challanNumber: {
          contains: search,
        },
      },

      {
        vehicle: {
          vehicleNumber: {
            contains: search,
          },
        },
      },
    ];
  }

  // =====================================================
  // STATUS FILTER
  // =====================================================

  if (status) {
    where.status =
      status;
  }

  // =====================================================
  // FETCH CHALLANS + TOTAL
  // =====================================================

  const [
    challans,
    total,
  ] = await Promise.all([
    prisma.vehicleChallan.findMany({
      where,

      skip,

      take:
        currentLimit,

      orderBy: {
        createdAt:
          "desc",
      },

      include: {
        vehicle: true,

        driver: true,

        branch: true,

        _count: {
          select: {
            bilties: true,

            previewRows: true,
          },
        },
      },
    }),

    prisma.vehicleChallan.count({
      where,
    }),
  ]);

  return {
    challans,

    total,

    page:
      currentPage,

    limit:
      currentLimit,

    totalPages:
      Math.ceil(
        total /
          currentLimit
      ),
  };
}