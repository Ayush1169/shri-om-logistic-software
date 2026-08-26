import prisma from "../config/prisma.js";

export async function getAllCustomersService(query) {
    console.log(query);
console.log("Search =", query.search);
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const search = query.search || "";

  const skip = (page - 1) * limit;

  const where = {};

if (search) {
  where.OR = [
    {
      customerName: {
        contains: search,
      },
    },
    {
      customerCode: {
        contains: search,
      },
    },
    {
      mobile: {
        contains: search,
      },
    },
  ];
}
  const allCustomers = await prisma.customer.findMany();

console.log(allCustomers);
  

  const customers = await prisma.customer.findMany({
    where,

    include: {
      branch: {
        select: {
          id: true,
          branchName: true,
        },
      },
    },

    skip,

    take: limit,

    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.customer.count({
    where,
  });

  return {
    success: true,

    page,

    limit,

    total,

    totalPages: Math.ceil(total / limit),

    customers,
  };
}

export async function createCustomerService(data, user) {
  const {
    customerName,
    gstNumber,
    panNumber,
    contactPerson,
    mobile,
    email,
    address,
    city,
    state,
    creditLimit,
    paymentTerms,
  } = data;

  if (!customerName) {
    throw new Error("Customer Name is required.");
  }

  if (!mobile) {
    throw new Error("Mobile Number is required.");
  }

  const existingCustomer = await prisma.customer.findFirst({
    where: {
      OR: [
        { mobile },
        ...(gstNumber ? [{ gstNumber }] : []),
      ],
    },
  });

  if (existingCustomer) {
    throw new Error(
      "Customer already exists with same Mobile or GST."
    );
  }

  const totalCustomers = await prisma.customer.count();

  const customerCode = `CUS${String(
    totalCustomers + 1
  ).padStart(4, "0")}`;

  const customer = await prisma.customer.create({
    data: {
      customerCode,
      customerName,
      gstNumber,
      panNumber,
      contactPerson,
      mobile,
      email,
      address,
      city,
      state,
      creditLimit,
      paymentTerms,
      branchId: user.branchId,
    },
  });

  return {
    success: true,
    message: "Customer created successfully.",
    customer,
  };
}

export async function getCustomerByIdService(id) {
  const customer = await prisma.customer.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      branch: {
        select: {
          id: true,
          branchName: true,
        },
      },
    },
  });

  if (!customer) {
    throw new Error("Customer not found.");
  }

  return {
    success: true,
    customer,
  };
}

export async function updateCustomerService(id, data) {
  const customerId = Number(id);

  const customer = await prisma.customer.findUnique({
    where: {
      id: customerId,
    },
  });

  if (!customer) {
    throw new Error("Customer not found.");
  }

  const {
    customerName,
    gstNumber,
    panNumber,
    contactPerson,
    mobile,
    email,
    address,
    city,
    state,
    creditLimit,
    paymentTerms,
  } = data;

  const duplicateCustomer = await prisma.customer.findFirst({
    where: {
      id: {
        not: customerId,
      },
      OR: [
        { mobile },
        ...(gstNumber ? [{ gstNumber }] : []),
      ],
    },
  });

  if (duplicateCustomer) {
    throw new Error(
      "Another customer already exists with same Mobile or GST."
    );
  }

  const updatedCustomer = await prisma.customer.update({
    where: {
      id: customerId,
    },
    data: {
      customerName,
      gstNumber,
      panNumber,
      contactPerson,
      mobile,
      email,
      address,
      city,
      state,
      creditLimit,
      paymentTerms,
    },
  });

  return {
    success: true,
    message: "Customer updated successfully.",
    customer: updatedCustomer,
  };
}

export async function toggleCustomerStatusService(id) {
  const customer = await prisma.customer.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!customer) {
    throw new Error("Customer not found.");
  }

  const updatedCustomer = await prisma.customer.update({
    where: {
      id: Number(id),
    },
    data: {
      isActive: !customer.isActive,
    },
  });

  return {
    success: true,
    message: updatedCustomer.isActive
      ? "Customer Activated Successfully."
      : "Customer Deactivated Successfully.",
  };
}