import prisma from "../config/prisma.js";

export async function savePreviewRows(challanId, rows) {
  await prisma.oCRBiltyPreview.deleteMany({
    where: {
      challanId: Number(challanId),
    },
  });

  await prisma.oCRBiltyPreview.createMany({
    data: rows.map((row) => ({
      challanId: Number(challanId),

      serialNo: row.serialNo ?? null,
      lrNo: row.lrNo ?? null,
      biltyDate: row.biltyDate ?? null,

      weight: row.weight ?? null,
      packages: row.packages ?? null,
      freight: row.freight ?? null,

      goods: row.goods ?? null,
      consignee: row.consignee ?? null,
      destination: row.destination ?? null,
      marka: row.marka ?? null,
    })),
  });

  return prisma.oCRBiltyPreview.findMany({
    where: {
      challanId: Number(challanId),
    },
    orderBy: {
      serialNo: "asc",
    },
  });
}

export async function getPreviewRows(challanId) {
  const rows = await prisma.oCRBiltyPreview.findMany({
    where: {
      challanId: Number(challanId),
    },
    orderBy: {
      serialNo: "asc",
    },
  });

  return rows.map((row) => ({
    id: row.id,

    serialNo: row.serialNo,
    biltyDate: row.biltyDate,
    lrNo: row.lrNo,

    weight: row.weight
      ? Number(row.weight)
      : null,

    packages: row.packages,

    freight: row.freight
      ? Number(row.freight)
      : null,

    // Frontend names
    item: row.goods,
    consigneeName: row.consignee,
    pMarka: row.marka,

    paymentType: "TO_PAY",

    imported: row.imported,

    gst: null,
    hamali: null,
    loadingCharges: null,
    unloadingCharges: null,
    insuranceCharges: null,

    chargeableWeight: row.weight
      ? Number(row.weight)
      : null,

    eWayBillNumber: null,
    remarks: null,
  }));
}