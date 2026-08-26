import prisma from "../config/prisma.js";

export async function getAllVehiclesService(query) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const search = query.search || "";

  const skip = (page - 1) * limit;

  const where = {};

  if (search) {
    where.OR = [
      {
        vehicleNumber: {
          contains: search,
        },
      },
      {
        ownerName: {
          contains: search,
        },
      },
      {
        vehicleType: {
          contains: search,
        },
      },
    ];
  }

  const vehicles = await prisma.vehicle.findMany({
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

  const total = await prisma.vehicle.count({
    where,
  });

  return {
    success: true,

    page,

    limit,

    total,

    totalPages: Math.ceil(total / limit),

    vehicles,
  };
}

export async function createVehicleService(data, user) {
  const {
    vehicleNumber,
    ownerName,
    vehicleType,
    capacity,
    gpsNumber,

    rcNumber,
    insuranceNumber,
    permitNumber,
    fitnessNumber,
    pollutionNumber,

    insuranceExpiry,
    permitExpiry,
    fitnessExpiry,
    pollutionExpiry,
  } = data;

  if (!vehicleNumber) {
    throw new Error("Vehicle Number is required.");
  }

  if (!ownerName) {
    throw new Error("Owner Name is required.");
  }

  if (!vehicleType) {
    throw new Error("Vehicle Type is required.");
  }

  const existingVehicle = await prisma.vehicle.findUnique({
    where: {
      vehicleNumber,
    },
  });

  if (existingVehicle) {
    throw new Error("Vehicle Number already exists.");
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      vehicleNumber,
      ownerName,
      vehicleType,
      capacity,
      gpsNumber,

      companyId: user.companyId,

      document: {
        create: {
          rcNumber,
          insuranceNumber,
          permitNumber,
          fitnessNumber,
          pollutionNumber,

          insuranceExpiry: insuranceExpiry
            ? new Date(insuranceExpiry)
            : null,

          permitExpiry: permitExpiry
            ? new Date(permitExpiry)
            : null,

          fitnessExpiry: fitnessExpiry
            ? new Date(fitnessExpiry)
            : null,

          pollutionExpiry: pollutionExpiry
            ? new Date(pollutionExpiry)
            : null,
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
    message: "Vehicle created successfully.",
    vehicle,
  };
}

export async function getVehicleByIdService(id) {
  const vehicle = await prisma.vehicle.findUnique({
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

  if (!vehicle) {
    throw new Error("Vehicle not found.");
  }

  return {
    success: true,
    vehicle,
  };
}

export async function updateVehicleService(id, data) {
  const vehicleId = Number(id);

  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: vehicleId,
    },
    include: {
      document: true,
    },
  });

  if (!vehicle) {
    throw new Error("Vehicle not found.");
  }

  const {
    vehicleNumber,
    ownerName,
    vehicleType,
    capacity,
    gpsNumber,

    rcNumber,
    insuranceNumber,
    permitNumber,
    fitnessNumber,
    pollutionNumber,

    insuranceExpiry,
    permitExpiry,
    fitnessExpiry,
    pollutionExpiry,
  } = data;

  const duplicateVehicle = await prisma.vehicle.findFirst({
    where: {
      id: {
        not: vehicleId,
      },
      vehicleNumber,
    },
  });

  if (duplicateVehicle) {
    throw new Error("Vehicle Number already exists.");
  }

  const updatedVehicle = await prisma.vehicle.update({
    where: {
      id: vehicleId,
    },
    data: {
      vehicleNumber,
      ownerName,
      vehicleType,
      capacity,
      gpsNumber,

      document: {
        update: {
          rcNumber,
          insuranceNumber,
          permitNumber,
          fitnessNumber,
          pollutionNumber,

          insuranceExpiry: insuranceExpiry
            ? new Date(insuranceExpiry)
            : null,

          permitExpiry: permitExpiry
            ? new Date(permitExpiry)
            : null,

          fitnessExpiry: fitnessExpiry
            ? new Date(fitnessExpiry)
            : null,

          pollutionExpiry: pollutionExpiry
            ? new Date(pollutionExpiry)
            : null,
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
    message: "Vehicle updated successfully.",
    vehicle: updatedVehicle,
  };
}

export async function toggleVehicleStatusService(id) {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!vehicle) {
    throw new Error("Vehicle not found.");
  }

  const updatedVehicle = await prisma.vehicle.update({
    where: {
      id: Number(id),
    },
    data: {
      isActive: !vehicle.isActive,
    },
  });

  return {
    success: true,
    message: updatedVehicle.isActive
      ? "Vehicle Activated Successfully."
      : "Vehicle Deactivated Successfully.",
  };
}