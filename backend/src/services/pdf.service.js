import { PDFParse } from "pdf-parse";
import fs from "fs";
import PDFDocument from "pdfkit";

/**
 * Extract text from uploaded PDF
 * Used by Challan OCR
 */
export async function extractPdfText(filePath) {
  const buffer = fs.readFileSync(filePath);

  const parser = new PDFParse({
    data: buffer,
  });

  const result = await parser.getText();

  return result.text;
}

/**
 * Generate Bilty PDF
 */
export async function generateBiltyPdf(bilty, res) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
  });

  // PDF response headers
  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `inline; filename="${bilty.biltyNumber}.pdf"`
  );

  // PDF stream
  doc.pipe(res);

  // =========================
  // COMPANY HEADER
  // =========================

  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("SHRI OM LOGISTICS", {
      align: "center",
    });

  doc
    .fontSize(10)
    .font("Helvetica")
    .text("Transport & Logistics Services", {
      align: "center",
    });

  doc.moveDown(1);

  // Divider
  doc
    .moveTo(40, doc.y)
    .lineTo(555, doc.y)
    .stroke();

  doc.moveDown(1);

  // =========================
  // BILTY TITLE
  // =========================

  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("BILTY / LR", {
      align: "center",
    });

  doc.moveDown(1);

  // =========================
  // BASIC DETAILS
  // =========================

  const startY = doc.y;

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Bilty Number:", 50, startY);

  doc
    .font("Helvetica")
    .text(bilty.biltyNumber || "-", 150, startY);

  doc
    .font("Helvetica-Bold")
    .text("Booking Date:", 350, startY);

  doc
    .font("Helvetica")
    .text(
      formatDate(bilty.bookingDate),
      430,
      startY
    );

  doc.moveDown(2);

  // =========================
  // CONSIGNOR / CONSIGNEE
  // =========================

  const partyY = doc.y;

  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("CONSIGNOR", 50, partyY);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      bilty.consignor?.customerName || "-",
      50,
      partyY + 20
    );

  doc.text(
    bilty.consignor?.address || "-",
    50,
    partyY + 35,
    {
      width: 220,
    }
  );

  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("CONSIGNEE", 320, partyY);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      bilty.consignee?.customerName || "-",
      320,
      partyY + 20
    );

  doc.text(
    bilty.consignee?.address || "-",
    320,
    partyY + 35,
    {
      width: 220,
    }
  );

  doc.moveDown(4);

  // =========================
  // ROUTE
  // =========================

  drawSectionTitle(doc, "TRANSPORT DETAILS");

  drawRow(
    doc,
    "Pickup Address",
    bilty.pickupAddress
  );

  drawRow(
    doc,
    "Delivery Address",
    bilty.deliveryAddress
  );

  drawRow(
    doc,
    "Vehicle Number",
    bilty.vehicle?.vehicleNumber || "-"
  );

  drawRow(
    doc,
    "Driver",
    bilty.driver?.driverName || "-"
  );

  drawRow(
    doc,
    "Payment Type",
    bilty.paymentType || "-"
  );

  drawRow(
    doc,
    "Status",
    bilty.status || "-"
  );

  doc.moveDown(1);

  // =========================
  // GOODS DETAILS
  // =========================

  drawSectionTitle(doc, "GOODS DETAILS");

  drawRow(
    doc,
    "Goods Description",
    bilty.goodsDescription || "-"
  );

  drawRow(
    doc,
    "Packages",
    String(bilty.packageCount ?? 0)
  );

  drawRow(
    doc,
    "Actual Weight",
    `${bilty.actualWeight ?? 0} KG`
  );

  drawRow(
    doc,
    "Chargeable Weight",
    `${bilty.chargeableWeight ?? 0} KG`
  );

  if (bilty.eWayBillNumber) {
    drawRow(
      doc,
      "E-Way Bill",
      bilty.eWayBillNumber
    );
  }

  doc.moveDown(1);

  // =========================
  // CHARGES
  // =========================

  drawSectionTitle(doc, "CHARGES");

  drawCharge(
    doc,
    "Freight",
    bilty.freight
  );

  drawCharge(
    doc,
    "GST",
    bilty.gst
  );

  drawCharge(
    doc,
    "Hamali",
    bilty.hamali
  );

  drawCharge(
    doc,
    "Loading Charges",
    bilty.loadingCharges
  );

  drawCharge(
    doc,
    "Unloading Charges",
    bilty.unloadingCharges
  );

  drawCharge(
    doc,
    "Insurance Charges",
    bilty.insuranceCharges
  );

  doc.moveDown(0.5);

  doc
    .moveTo(300, doc.y)
    .lineTo(555, doc.y)
    .stroke();

  doc.moveDown(0.5);

  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text(
      `TOTAL AMOUNT: Rs. ${bilty.totalAmount ?? 0}`,
      300,
      doc.y,
      {
        width: 255,
        align: "right",
      }
    );

  // =========================
  // REMARKS
  // =========================

  if (bilty.remarks) {
    doc.moveDown(2);

    drawSectionTitle(doc, "REMARKS");

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(bilty.remarks);
  }

  // =========================
  // FOOTER
  // =========================

  doc.moveDown(4);

  doc
    .fontSize(9)
    .font("Helvetica")
    .text(
      "This is a computer generated document.",
      {
        align: "center",
      }
    );

  doc.end();
}

/**
 * Section heading
 */
function drawSectionTitle(doc, title) {
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(title);

  doc.moveDown(0.4);

  doc
    .moveTo(40, doc.y)
    .lineTo(555, doc.y)
    .stroke();

  doc.moveDown(0.5);
}

/**
 * Normal key/value row
 */
function drawRow(doc, label, value) {
  const y = doc.y;

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text(`${label}:`, 50, y);

  doc
    .font("Helvetica")
    .text(String(value ?? "-"), 180, y, {
      width: 350,
    });

  doc.moveDown(0.5);
}

/**
 * Charge row
 */
function drawCharge(doc, label, value) {
  const y = doc.y;

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(label, 320, y);

  doc
    .text(
      `Rs. ${value ?? 0}`,
      450,
      y,
      {
        width: 100,
        align: "right",
      }
    );

  doc.moveDown(0.4);
}

/**
 * Format date
 */
function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN");
}