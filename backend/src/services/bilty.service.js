import prisma from "../config/prisma.js";

/**
 * Generate Bilty Number
 * Format: LR250001
 */
const generateBiltyNumber = async () => {
  const lastBilty = await prisma.bilty.findFirst({
    orderBy: {
      id: "desc",
    },
  });

  if (!lastBilty) {
    return "LR250001";
  }

  const lastNumber = parseInt(lastBilty.biltyNumber.replace("LR", ""), 10);

  return `LR${String(lastNumber + 1).padStart(6, "0")}`;
};

/**
 * Calculate Total Amount
 */
const calculateTotal = ({
  freight,
  gst,
  hamali,
  loadingCharges,
  unloadingCharges,
  insuranceCharges,
}) => {
  return (
    Number(freight || 0) +
    Number(gst || 0) +
    Number(hamali || 0) +
    Number(loadingCharges || 0) +
    Number(unloadingCharges || 0) +
    Number(insuranceCharges || 0)
  );
};

/**
 * Create Bilty
 */
export const createBilty = async (data, userId) => {
  const biltyNumber = await generateBiltyNumber();

  const totalAmount = calculateTotal(data);

  const bilty = await prisma.bilty.create({
    data: {
      biltyNumber,
      bookingDate: new Date(),

      branchId: data.branchId,
      consignorId: data.consignorId,
      consigneeId: data.consigneeId,

      vehicleId: data.vehicleId || null,
      driverId: data.driverId || null,

      pickupAddress: data.pickupAddress,
      deliveryAddress: data.deliveryAddress,
      goodsDescription: data.goodsDescription,

      packageCount: data.packageCount,

      actualWeight: data.actualWeight,
      chargeableWeight: data.chargeableWeight,

      freight: data.freight,
      gst: data.gst || 0,

      hamali: data.hamali || 0,
      loadingCharges: data.loadingCharges || 0,
      unloadingCharges: data.unloadingCharges || 0,
      insuranceCharges: data.insuranceCharges || 0,

      totalAmount,

      paymentType: data.paymentType,

      eWayBillNumber: data.eWayBillNumber,
      remarks: data.remarks,

      createdById: userId,
    },

    include: {
      branch: true,
      consignor: true,
      consignee: true,
      vehicle: true,
      driver: true,
      createdBy: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  return bilty;
};

/**
 * Get All Bilties
 */
export const getBilties = async (
  page = 1,
  limit = 10,
  search = "",
  biltyType = "PAKKA"
) => {
  const where = {
  biltyType,

  ...(search
    ? {
        OR: [
          {
            biltyNumber: {
              contains: search,
            },
          },
          {
            pickupAddress: {
              contains: search,
            },
          },
          {
            deliveryAddress: {
              contains: search,
            },
          },
          {
            consignor: {
              customerName: {
                contains: search,
              },
            },
          },
          {
            consignee: {
              customerName: {
                contains: search,
              },
            },
          },
          {
            consigneeName: {
              contains: search,
            },
          },
          {
            pMarka: {
              contains: search,
            },
          },
        ],
      }
    : {}),
};

  // IMPORTANT:
  // Pehle saari matching bilties lao.
  // Pagination baad mein GROUPS par lagegi.
  const allBilties = await prisma.bilty.findMany({
    where,

    orderBy: {
      createdAt: "desc",
    },

    include: {
      branch: true,
      consignor: true,
      consignee: true,
      vehicle: true,
      driver: true,
      challan: true,
    },
  });

  console.log("========== BILTY GROUP DEBUG ==========");

for (const bilty of allBilties) {
  console.log({
    id: bilty.id,
    biltyNumber: bilty.biltyNumber,
    challanId: bilty.challanId,
    challanVehicleNumber: bilty.challan?.vehicleNumber,
    vehicleId: bilty.vehicleId,
    vehicleNumber: bilty.vehicle?.vehicleNumber,
  });
}

console.log("======================================");

  // -----------------------------------------
  // GROUP BY CHALLAN
  // -----------------------------------------

  const groupsMap = new Map();

  for (const bilty of allBilties) {
    const vehicleNumber =
      bilty.challan?.vehicleNumber ||
      bilty.vehicle?.vehicleNumber ||
      "Vehicle Not Assigned";

    const challanId = bilty.challanId ?? null;

    /*
     * IMPORTANT:
     * Challan ID is part of group ID.
     *
     * Isliye agar same vehicle number
     * alag-alag challan mein hai,
     * dono alag groups rahenge.
     */
    const groupId = challanId
      ? `challan-${challanId}`
      : `bilty-${bilty.id}`;

    if (!groupsMap.has(groupId)) {
      groupsMap.set(groupId, {
        id: groupId,

        challanId,

        vehicleNumber,

        challanNumber:
          bilty.challan?.challanNumber || undefined,

        challanDate:
          bilty.challan?.challanDate
            ? bilty.challan.challanDate.toISOString()
            : undefined,

        totalBilties: 0,
        totalPackages: 0,
        totalWeight: 0,
        totalFreight: 0,

        bilties: [],
      });
    }

    const group = groupsMap.get(groupId);

    group.bilties.push(bilty);

    group.totalBilties += 1;

    group.totalPackages += Number(
      bilty.packageCount || 0
    );

    group.totalWeight += Number(
      bilty.actualWeight || 0
    );

    group.totalFreight += Number(
      bilty.freight || 0
    );
  }

  const allGroups = Array.from(
    groupsMap.values()
  );

  // -----------------------------------------
  // GROUP LEVEL PAGINATION
  // -----------------------------------------

  const pageNumber = Number(page);
  const pageLimit = Number(limit);

  const total = allGroups.length;

  const totalPages = Math.ceil(
    total / pageLimit
  );

  const startIndex =
    (pageNumber - 1) * pageLimit;

  const groups = allGroups.slice(
    startIndex,
    startIndex + pageLimit
  );

  console.log("========== NEW BILTY GROUP API ==========");
  console.log("TOTAL BILTIES:", allBilties.length);
  console.log("TOTAL GROUPS:", allGroups.length);
  console.log("GROUPS:", allGroups);
  console.log("==========================================");

  return {
    groups,

    total,

    page: pageNumber,

    totalPages,
  };
};
/**
 * Get Bilty By Id
 */
export const getBiltyById = async (id) => {
  return await prisma.bilty.findUnique({
    where: {
      id: Number(id),
    },

    include: {
      branch: true,
      consignor: true,
      consignee: true,
      vehicle: true,
      driver: true,
      createdBy: true,
      challan: true,
    },
  });
};

/**
 * Update Bilty
 */
export const updateBilty = async (id, data) => {
  const totalAmount = calculateTotal(data);

  return await prisma.bilty.update({
    where: {
      id: Number(id),
    },

    data: {
      ...data,
      totalAmount,
    },

    include: {
      branch: true,
      consignor: true,
      consignee: true,
      vehicle: true,
      driver: true,
    },
  });
};

/**
 * Delete Bilty
 */
export const deleteBilty = async (id) => {
  return await prisma.bilty.delete({
    where: {
      id: Number(id),
    },
  });
};

export const updateBiltyStatus = async (id, status) => {
  const biltyId = Number(id);

  if (!biltyId) {
    throw new Error("Invalid bilty ID");
  }

  const allowedStatuses = [
    "BOOKED",
    "LOADED",
    "IN_TRANSIT",
    "DELIVERED",
    "CANCELLED",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid bilty status");
  }

  const bilty = await prisma.bilty.findUnique({
    where: {
      id: biltyId,
    },
  });

  if (!bilty) {
    throw new Error("Bilty not found");
  }

  const currentStatus = bilty.status;

  // Same status
  if (currentStatus === status) {
    return bilty;
  }

  const allowedTransitions = {
    BOOKED: ["LOADED", "CANCELLED"],
    LOADED: ["IN_TRANSIT", "CANCELLED"],
    IN_TRANSIT: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
  };

  if (
    !allowedTransitions[currentStatus]?.includes(status)
  ) {
    throw new Error(
      `Cannot change status from ${currentStatus} to ${status}`
    );
  }

  return await prisma.bilty.update({
    where: {
      id: biltyId,
    },

    data: {
      status,
    },

    include: {
      branch: true,
      consignor: true,
      consignee: true,
      vehicle: true,
      driver: true,
      challan: true,
    },
  });
};

/**
 * Delete all bilties belonging to one challan
 */
export const deleteBiltiesByChallan = async (challanId) => {
  const id = Number(challanId);

  if (!id) {
    throw new Error("Invalid challan ID");
  }

  const challan = await prisma.vehicleChallan.findUnique({
    where: {
      id,
    },
  });

  if (!challan) {
    throw new Error("Challan not found");
  }

  return await prisma.$transaction(async (tx) => {
    // Delete all bilties of this challan
    const deletedBilties = await tx.bilty.deleteMany({
      where: {
        challanId: id,
      },
    });

    // Delete OCR preview rows
    await tx.oCRBiltyPreview.deleteMany({
      where: {
        challanId: id,
      },
    });

    // Delete OCR import records
    await tx.oCRImport.deleteMany({
      where: {
        challanId: id,
      },
    });

    // Finally delete challan
    await tx.vehicleChallan.delete({
      where: {
        id,
      },
    });

    return {
      deletedBilties: deletedBilties.count,
    };
  });
};