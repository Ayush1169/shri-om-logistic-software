
import prisma from "../config/prisma.js";

const receiptInclude = {
  bilty: {
    include: {
      consignor: true,
      consignee: true,
      branch: true,
      challan: true,
    },
  },
  branch: true,
  consignee: true,
  createdBy: {
    select: {
      id: true,
      fullName: true,
      username: true,
    },
  },
};

const toMoney = (value, field) => {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`${field} must be a valid non-negative amount`);
  }

  return Math.round((number + Number.EPSILON) * 100) / 100;
};

const calculateReceiptTotal = (data) => {
  const freight = toMoney(data.freight, "Freight");
  const stationCharges = toMoney(data.stationCharges, "Station charges");
  const unloadingCharges = toMoney(data.unloadingCharges, "Unloading charges");
  const godownCharges = toMoney(data.godownCharges, "Godown charges");
  const refund = toMoney(data.refund, "Refund");

  return Math.round(
    (freight + stationCharges + unloadingCharges + godownCharges - refund + Number.EPSILON) * 100
  ) / 100;
};

const generateReceiptNumber = async (tx) => {
  // The unique constraint protects against duplicate receipt numbers.
  // The transaction-scoped sequence is improved in a later step if needed.
  const lastReceipt = await tx.cashReceipt.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });

  const nextId = (lastReceipt?.id ?? 0) + 1;

  return `CR-${String(nextId).padStart(6, "0")}`;
};

export const createCashReceipt = async (data, userId) => {
  const biltyId = Number(data.biltyId);
  const branchId = Number(data.branchId);
  const consigneeId = data.consigneeId
    ? Number(data.consigneeId)
    : null;

  if (!Number.isInteger(biltyId) || biltyId <= 0) {
    throw new Error("A valid bilty is required");
  }

  if (!Number.isInteger(branchId) || branchId <= 0) {
    throw new Error("A valid branch is required");
  }

  if (consigneeId !== null &&
      (!Number.isInteger(consigneeId) || consigneeId <= 0)) {
    throw new Error("Invalid consignee");
  }

  const packageCount = Number(data.packageCount ?? 0);

  if (!Number.isInteger(packageCount) || packageCount < 0) {
    throw new Error("Package count must be a non-negative integer");
  }

  const paidAmount = toMoney(data.paidAmount, "Paid amount");

  const totalAmount = calculateReceiptTotal(data);

  if (paidAmount > totalAmount) {
    throw new Error("Paid amount cannot exceed the receipt total");
  }

  return prisma.$transaction(async (tx) => {
    const [bilty, branch, user] = await Promise.all([
      tx.bilty.findUnique({ where: { id: biltyId } }),
      tx.branch.findUnique({ where: { id: branchId } }),
      tx.user.findUnique({ where: { id: Number(userId) } }),
    ]);

    if (!bilty) throw new Error("Bilty not found");
    if (!branch) throw new Error("Branch not found");
    if (!user) throw new Error("User not found");

    if (consigneeId !== null) {
      const customer = await tx.customer.findUnique({
        where: { id: consigneeId },
      });

      if (!customer) throw new Error("Consignee not found");
    }

    const receiptNumber = await generateReceiptNumber(tx);

    return tx.cashReceipt.create({
      data: {
        receiptNumber,
        receiptDate: data.receiptDate
          ? new Date(data.receiptDate)
          : new Date(),

        biltyId,
        branchId,
        createdById: Number(userId),
        consigneeId,
        consigneeName: data.consigneeName?.trim() || null,
        packageCount,
        fromLocation: data.fromLocation?.trim() || null,

        freight: toMoney(data.freight, "Freight"),
        stationCharges: toMoney(data.stationCharges, "Station charges"),
        unloadingCharges: toMoney(data.unloadingCharges, "Unloading charges"),
        godownCharges: toMoney(data.godownCharges, "Godown charges"),
        refund: toMoney(data.refund, "Refund"),

        totalAmount,
        paidAmount,
        remarks: data.remarks?.trim() || null,
      },
      include: receiptInclude,
    });
  });
};

export const getCashReceipts = async ({
  page = 1,
  limit = 10,
  search = "",
  branchId,
  fromDate,
  toDate,
}) => {
  const pageNumber = Math.max(1, Number(page) || 1);
  const pageLimit = Math.min(100, Math.max(1, Number(limit) || 10));

  const where = {
    ...(branchId ? { branchId: Number(branchId) } : {}),
    ...(fromDate || toDate
      ? {
          receiptDate: {
            ...(fromDate ? { gte: new Date(fromDate) } : {}),
            ...(toDate ? { lte: new Date(toDate) } : {}),
          },
        }
      : {}),
    ...(search.trim()
      ? {
          OR: [
            { receiptNumber: { contains: search.trim() } },
            { consigneeName: { contains: search.trim() } },
            { bilty: { biltyNumber: { contains: search.trim() } } },
          ],
        }
      : {}),
  };

  const [receipts, total] = await Promise.all([
    prisma.cashReceipt.findMany({
      where,
      skip: (pageNumber - 1) * pageLimit,
      take: pageLimit,
      orderBy: [{ receiptDate: "desc" }, { id: "desc" }],
      include: receiptInclude,
    }),
    prisma.cashReceipt.count({ where }),
  ]);

  return {
    data: receipts,
    pagination: {
      page: pageNumber,
      limit: pageLimit,
      total,
      totalPages: Math.ceil(total / pageLimit),
    },
  };
};

export const getCashReceiptById = async (id) => {
  const receiptId = Number(id);

  if (!Number.isInteger(receiptId) || receiptId <= 0) {
    throw new Error("Invalid receipt ID");
  }

  return prisma.cashReceipt.findUnique({
    where: { id: receiptId },
    include: receiptInclude,
  });
};

export const deleteCashReceipt = async (id) => {
  const receiptId = Number(id);

  if (!Number.isInteger(receiptId) || receiptId <= 0) {
    throw new Error("Invalid receipt ID");
  }

  return prisma.cashReceipt.delete({
    where: { id: receiptId },
  });
};
