import prisma from "../config/prisma.js";

export async function getAllDriversService(query) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const search = query.search || "";

  const skip = (page - 1) * limit;

  const where = {};

  if (search) {
    where.OR = [
      {
        driverName: {
          contains: search,
        },
      },
      {
        mobile: {
          contains: search,
        },
      },
      {
        licenseNumber: {
          contains: search,
        },
      },
      {
        aadhaarNumber: {
          contains: search,
        },
      },
    ];
  }

  const drivers = await prisma.driver.findMany({
    where,

    include: {
      company: {
        select: {
          id: true,
          companyName: true,
        },
      },

      document: true,
    },

    skip,

    take: limit,

    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.driver.count({
    where,
  });

  return {
    success: true,

    page,

    limit,

    total,

    totalPages: Math.ceil(total / limit),

    drivers,
  };
}

export async function createDriverService(data, user) {
  const {
    driverName,
    mobile,
    aadhaarNumber,
    licenseNumber,
    address,
    emergencyContact,

    licenseExpiry,
    aadhaarFront,
    aadhaarBack,
    licenseImage,
  } = data;

  const existingAadhaar = await prisma.driver.findUnique({
    where: {
      aadhaarNumber,
    },
  });

  if (existingAadhaar) {
    throw new Error("Aadhaar Number already exists.");
  }

  const existingLicense = await prisma.driver.findUnique({
    where: {
      licenseNumber,
    },
  });

  if (existingLicense) {
    throw new Error("License Number already exists.");
  }

  const driver = await prisma.driver.create({
    data: {
      driverName,
      mobile,
      aadhaarNumber,
      licenseNumber,
      address,
      emergencyContact,

      companyId: user.companyId,

      document: {
        create: {
          licenseExpiry: licenseExpiry
            ? new Date(licenseExpiry)
            : null,

          aadhaarFront,
          aadhaarBack,
          licenseImage,
        },
      },
    },

    include: {
      company: {
        select: {
          id: true,
          companyName: true,
        },
      },

      document: true,
    },
  });

  return {
    success: true,
    message: "Driver created successfully.",
    driver,
  };
}

export async function getDriverByIdService(id) {
  const driver = await prisma.driver.findUnique({
    where: {
      id: Number(id),
    },

    include: {
      company: {
        select: {
          id: true,
          companyName: true,
        },
      },

      document: true,
    },
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  return {
    success: true,
    driver,
  };
}

export async function updateDriverService(id, data) {
  const driverId = Number(id);

  const driver = await prisma.driver.findUnique({
    where: {
      id: driverId,
    },

    include: {
      document: true,
    },
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  const {
    driverName,
    mobile,
    aadhaarNumber,
    licenseNumber,
    address,
    emergencyContact,

    licenseExpiry,
    aadhaarFront,
    aadhaarBack,
    licenseImage,
  } = data;

  const duplicateAadhaar = await prisma.driver.findFirst({
    where: {
      id: {
        not: driverId,
      },
      aadhaarNumber,
    },
  });

  if (duplicateAadhaar) {
    throw new Error("Aadhaar Number already exists.");
  }

  const duplicateLicense = await prisma.driver.findFirst({
    where: {
      id: {
        not: driverId,
      },
      licenseNumber,
    },
  });

  if (duplicateLicense) {
    throw new Error("License Number already exists.");
  }

  const updatedDriver = await prisma.driver.update({
    where: {
      id: driverId,
    },

    data: {
      driverName,
      mobile,
      aadhaarNumber,
      licenseNumber,
      address,
      emergencyContact,

      document: {
        update: {
          licenseExpiry: licenseExpiry
            ? new Date(licenseExpiry)
            : null,

          aadhaarFront,
          aadhaarBack,
          licenseImage,
        },
      },
    },

    include: {
      company: {
        select: {
          id: true,
          companyName: true,
        },
      },

      document: true,
    },
  });

  return {
    success: true,
    message: "Driver updated successfully.",
    driver: updatedDriver,
  };
}

export async function toggleDriverStatusService(id) {
  const driver = await prisma.driver.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  const updatedDriver = await prisma.driver.update({
    where: {
      id: Number(id),
    },

    data: {
      isActive: !driver.isActive,
    },
  });

  return {
    success: true,
    message: updatedDriver.isActive
      ? "Driver Activated Successfully."
      : "Driver Deactivated Successfully.",
  };
}