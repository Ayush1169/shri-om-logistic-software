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
  search = ""
) => {
  const skip = (page - 1) * limit;

  const where = search
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
        ],
      }
    : {};

  const [bilties, total] = await Promise.all([
    prisma.bilty.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        branch: true,
        consignor: true,
        consignee: true,
        vehicle: true,
        driver: true,
      },
    }),

    prisma.bilty.count({
      where,
    }),
  ]);

  return {
    bilties,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
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