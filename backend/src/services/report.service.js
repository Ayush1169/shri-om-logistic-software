
import prisma from "../config/prisma.js";

const toNumber = (value) => Number(value ?? 0);

export const getBiltyReport = async ({
  fromDate,
  toDate,
  branchId,
  vehicleId,
  paymentType,
  status,
  page = 1,
  limit = 50,
}) => {
  const pageNumber = Math.max(1, Number(page) || 1);
  const pageLimit = Math.min(100, Math.max(1, Number(limit) || 50));

  const where = {
    ...(branchId ? { branchId: Number(branchId) } : {}),
    ...(vehicleId ? { vehicleId: Number(vehicleId) } : {}),
    ...(paymentType ? { paymentType } : {}),
    ...(status ? { status } : {}),
    ...((fromDate || toDate)
      ? {
          bookingDate: {
            ...(fromDate ? { gte: new Date(`${fromDate}T00:00:00.000`) } : {}),
            ...(toDate ? { lte: new Date(`${toDate}T23:59:59.999`) } : {}),
          },
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.bilty.findMany({
      where,
      include: {
        branch: true,
        vehicle: true,
        challan: {
          include: {
            vehicle: true,
          },
        },
      },
      orderBy: { bookingDate: "desc" },
      skip: (pageNumber - 1) * pageLimit,
      take: pageLimit,
    }),
    prisma.bilty.count({ where }),
  ]);

  const data = rows.map((bilty) => ({
    id: bilty.id,
    biltyNumber: bilty.biltyNumber,
    date: bilty.bookingDate,
    loadingDate: bilty.challan?.challanDate ?? null,
    vehicleNumber:
      bilty.challan?.vehicleNumber ??
      bilty.challan?.vehicle?.vehicleNumber ??
      bilty.vehicle?.vehicleNumber ??
      "",
    branchId: bilty.branchId,
    branchName: bilty.branch?.branchName ?? "",
    freight: toNumber(bilty.freight),
    unloadingCharges: toNumber(bilty.unloadingCharges),
    totalAmount: toNumber(bilty.totalAmount),
    paymentType: bilty.paymentType,
    status: bilty.status,
  }));

  // Totals are calculated over ALL filtered records, not only this page.
  const allFilteredRows = await prisma.bilty.findMany({
    where,
    select: {
      freight: true,
      unloadingCharges: true,
      totalAmount: true,
    },
  });

  const totals = allFilteredRows.reduce(
    (result, row) => ({
      freight: result.freight + toNumber(row.freight),
      unloadingCharges:
        result.unloadingCharges + toNumber(row.unloadingCharges),
      totalAmount: result.totalAmount + toNumber(row.totalAmount),
    }),
    { freight: 0, unloadingCharges: 0, totalAmount: 0 }
  );

  return {
    data,
    totals,
    pagination: {
      page: pageNumber,
      limit: pageLimit,
      total,
      totalPages: Math.ceil(total / pageLimit),
    },
  };
};
