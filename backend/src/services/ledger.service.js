
import prisma from "../config/prisma.js";

const toNumber = (value) => Number(value ?? 0);

const money = (value) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const getLedgerSummary = async ({
  branchId,
  fromDate,
  toDate,
} = {}) => {
  const validBranchId =
    branchId &&
    Number.isInteger(Number(branchId)) &&
    Number(branchId) > 0
      ? Number(branchId)
      : undefined;

  const branchFilter = validBranchId
    ? { branchId: validBranchId }
    : {};

  const dateFilter = (field) => ({
    ...(fromDate || toDate
      ? {
          [field]: {
            ...(fromDate
              ? { gte: new Date(`${fromDate}T00:00:00.000`) }
              : {}),
            ...(toDate
              ? { lte: new Date(`${toDate}T23:59:59.999`) }
              : {}),
          },
        }
      : {}),
  });

  const [receiptTotals, biltyCount, vehicleCount, receipts] =
    await Promise.all([
      prisma.cashReceipt.aggregate({
        where: {
          ...branchFilter,
          ...dateFilter("receiptDate"),
        },
        _sum: {
          paidAmount: true,
          totalAmount: true,
          freight: true,
          stationCharges: true,
          unloadingCharges: true,
          godownCharges: true,
          refund: true,
        },
        _count: { id: true },
      }),

      prisma.bilty.count({
        where: {
          ...branchFilter,
          ...dateFilter("bookingDate"),
        },
      }),

      prisma.vehicle.count(),

      prisma.cashReceipt.findMany({
        where: {
          ...branchFilter,
          ...dateFilter("receiptDate"),
        },
        select: {
          id: true,
          receiptNumber: true,
          receiptDate: true,
          paidAmount: true,
          totalAmount: true,
          freight: true,
          stationCharges: true,
          unloadingCharges: true,
          godownCharges: true,
          refund: true,
          remarks: true,
          branchId: true,
          bilty: {
            select: {
              biltyNumber: true,
              consignor: { select: { customerName: true } },
              consignee: { select: { customerName: true } },
            },
          },
        },
        orderBy: [{ receiptDate: "desc" }, { id: "desc" }],
      }),
    ]);

  const totalReceipts = money(
    toNumber(receiptTotals._sum.paidAmount),
  );

  const totalCharges = money(
    toNumber(receiptTotals._sum.freight) +
      toNumber(receiptTotals._sum.stationCharges) +
      toNumber(receiptTotals._sum.unloadingCharges) +
      toNumber(receiptTotals._sum.godownCharges) -
      toNumber(receiptTotals._sum.refund),
  );

  const totalReceiptDifference = money(totalReceipts - totalCharges);

  return {
    summary: {
      totalReceipts,
      totalCharges,
      totalReceiptDifference,
      totalPayments: null,
      netBalance: null,
      totalBilties: biltyCount,
      totalVehicles: vehicleCount,
      receiptCount: receiptTotals._count.id,
      note:
        "Receipt totals and charge differences are calculated from cash receipts. Overall payments, expenses, and net balance require their confirmed accounting rules and records.",
    },

    transactions: receipts.map((receipt) => {
      const charges = money(
        toNumber(receipt.freight) +
          toNumber(receipt.stationCharges) +
          toNumber(receipt.unloadingCharges) +
          toNumber(receipt.godownCharges) -
          toNumber(receipt.refund),
      );

      const paidAmount = toNumber(receipt.paidAmount);

      return {
        id: receipt.id,
        date: receipt.receiptDate,
        type: "CASH_RECEIPT",
        particulars:
          receipt.bilty?.consignee?.customerName ||
          receipt.bilty?.consignor?.customerName ||
          receipt.bilty?.biltyNumber ||
          "Cash receipt",
        referenceNumber: receipt.receiptNumber,
        totalCharges: charges,
        debit: 0,
        credit: paidAmount,
        difference: money(paidAmount - charges),
        balance: null,
        branchId: receipt.branchId,
        remarks: receipt.remarks,
      };
    }),
  };
};
