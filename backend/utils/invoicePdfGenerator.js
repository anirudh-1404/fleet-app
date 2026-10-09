import PDFDocument from "pdfkit";

/**
 * Streams a professional vector PDF Tax Invoice to an Express HTTP response.
 */
export function streamInvoicePdf(invoice, res) {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  const invoiceNumber = invoice?.invoiceNumber || "INV-0001";
  const filename = `Invoice-${invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`;

  if (typeof res.setHeader === "function") {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  }

  doc.pipe(res);

  // Colors
  const primaryColor = "#2563EB";
  const darkColor = "#0F172A";
  const grayColor = "#64748B";
  const lightBg = "#F8FAFC";

  // Header
  doc.fillColor(darkColor).fontSize(22).font("Helvetica-Bold").text("FLEEV WORKSHOP", 40, 40);
  doc.fillColor(grayColor).fontSize(10).font("Helvetica").text("Commercial Fleet Maintenance & NHVR Compliance", 40, 66);

  // Right Header - Tax Invoice Title
  doc.fillColor(primaryColor).fontSize(20).font("Helvetica-Bold").text("TAX INVOICE", 40, 40, { align: "right" });
  doc.fillColor(darkColor).fontSize(11).font("Helvetica-Bold").text(`# ${invoiceNumber}`, 40, 66, { align: "right" });

  // Divider
  doc.strokeColor("#E2E8F0").lineWidth(1.5).moveTo(40, 88).lineTo(555, 88).stroke();

  // 2-Column Info Grid
  const topY = 104;

  // Left: Billed To
  doc.fillColor(grayColor).fontSize(9).font("Helvetica-Bold").text("BILLED TO (CUSTOMER)", 40, topY);
  const customerName = invoice?.customer?.fullName || invoice?.customer?.name || "Commercial Fleet Customer";
  const customerCompany = invoice?.customer?.companyName || "";
  const customerPhone = invoice?.customer?.phone || invoice?.customer?.mobileNumber || "";
  const customerEmail = invoice?.customer?.email || "";

  let custY = topY + 16;
  doc.fillColor(darkColor).fontSize(11).font("Helvetica-Bold").text(customerName, 40, custY);
  custY += 14;
  if (customerCompany) {
    doc.fillColor(grayColor).fontSize(10).font("Helvetica").text(customerCompany, 40, custY);
    custY += 14;
  }
  if (customerPhone) {
    doc.fillColor(grayColor).fontSize(10).font("Helvetica").text(`Phone: ${customerPhone}`, 40, custY);
    custY += 14;
  }
  if (customerEmail) {
    doc.fillColor(grayColor).fontSize(10).font("Helvetica").text(`Email: ${customerEmail}`, 40, custY);
  }

  // Right: Invoice Meta
  const rightX = 340;
  doc.fillColor(grayColor).fontSize(9).font("Helvetica-Bold").text("INVOICE DETAILS", rightX, topY);
  const dateStr = new Date(invoice?.date || invoice?.createdAt || Date.now()).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  let metaY = topY + 16;
  doc.fillColor(darkColor).fontSize(10).font("Helvetica-Bold").text(`Date: `, rightX, metaY, { continued: true });
  doc.font("Helvetica").text(dateStr);
  metaY += 14;

  doc.font("Helvetica-Bold").text(`Category: `, rightX, metaY, { continued: true });
  doc.font("Helvetica").text(invoice?.category || "Workshop Services");
  metaY += 14;

  doc.font("Helvetica-Bold").text(`Vendor: `, rightX, metaY, { continued: true });
  doc.font("Helvetica").text(invoice?.vendor || "Fleev Service Center");
  metaY += 14;

  if (invoice?.workOrder?.jobNumber) {
    doc.font("Helvetica-Bold").text(`Work Order: `, rightX, metaY, { continued: true });
    doc.fillColor(primaryColor).text(invoice.workOrder.jobNumber);
  }

  // Vehicle Banner Box
  const vehicleBoxY = 190;
  doc.rect(40, vehicleBoxY, 515, 34).fill(lightBg).stroke("#E2E8F0");

  const rego = invoice?.vehicle?.registration || invoice?.registration || "COMMERCIAL-VEHICLE";
  const vehicleMake = invoice?.vehicle?.make || invoice?.vehicleName || "";
  const vehicleModel = invoice?.vehicle?.model || "";
  const vehicleYear = invoice?.vehicle?.year ? `(${invoice.vehicle.year})` : "";
  const odo = invoice?.vehicle?.odometer ? `${Number(invoice.vehicle.odometer).toLocaleString()} km` : "";

  doc.fillColor("#854D0E").fontSize(11).font("Helvetica-Bold").text(`[ ${rego} ]`, 52, vehicleBoxY + 11, { continued: true });
  doc.fillColor(darkColor).fontSize(11).text(`  ${vehicleMake} ${vehicleModel} ${vehicleYear}`, { continued: true });
  if (odo) {
    doc.fillColor(grayColor).fontSize(10).font("Helvetica").text(`   •   Odometer: ${odo}`);
  }

  // Items Table Header
  const tableY = 246;
  doc.rect(40, tableY, 515, 24).fill("#F1F5F9");
  doc.fillColor("#475569").fontSize(9).font("Helvetica-Bold");
  doc.text("DESCRIPTION / SERVICE SCOPE", 50, tableY + 7);
  doc.text("CATEGORY", 280, tableY + 7);
  doc.text("VENDOR", 380, tableY + 7);
  doc.text("AMOUNT ($)", 480, tableY + 7, { align: "right", width: 65 });

  // Table Row
  const rowY = tableY + 24;
  doc.rect(40, rowY, 515, 48).stroke("#E2E8F0");
  doc.fillColor(darkColor).fontSize(10).font("Helvetica-Bold").text(`${invoice?.category || "Service"} - ${rego}`, 50, rowY + 10);
  doc.fillColor(grayColor).fontSize(8.5).font("Helvetica").text(invoice?.notes || "Commercial fleet maintenance & compliance servicing", 50, rowY + 26, { width: 220 });

  doc.fillColor(darkColor).fontSize(9.5).font("Helvetica").text(invoice?.category || "Parts", 280, rowY + 14);
  doc.text(invoice?.vendor || "Fleev", 380, rowY + 14);

  const amount = Number(invoice?.amount || 0);
  const gst = (amount * 0.1).toFixed(2);
  const subtotal = (amount - Number(gst)).toFixed(2);
  const total = amount.toFixed(2);

  doc.font("Helvetica-Bold").text(`$${total}`, 480, rowY + 14, { align: "right", width: 65 });

  // Calculations on Right
  const calcY = rowY + 68;
  const calcX = 350;
  doc.fontSize(10).font("Helvetica").fillColor(grayColor);
  doc.text("Subtotal (Excl. GST):", calcX, calcY);
  doc.text(`$${subtotal}`, 480, calcY, { align: "right", width: 65 });

  doc.text("GST (10%):", calcX, calcY + 18);
  doc.text(`$${gst}`, 480, calcY + 18, { align: "right", width: 65 });

  doc.rect(calcX - 10, calcY + 38, 215, 30).fill(lightBg).stroke(darkColor);
  doc.fillColor(darkColor).fontSize(12).font("Helvetica-Bold").text("Total Amount Due:", calcX, calcY + 46);
  doc.fillColor(primaryColor).text(`$${total}`, 480, calcY + 46, { align: "right", width: 65 });

  // Notes Box
  const notesY = calcY + 90;
  doc.rect(40, notesY, 515, 50).fill("#F8FAFC").stroke("#E2E8F0");
  doc.fillColor(darkColor).fontSize(9).font("Helvetica-Bold").text("NOTES & PAYMENT TERMS:", 50, notesY + 10);
  doc.fillColor(grayColor).fontSize(8.5).font("Helvetica").text(
    invoice?.notes || "Payment is strictly due within trading terms. Direct deposit or commercial fleet account accepted.",
    50,
    notesY + 24,
    { width: 495 }
  );

  // Footer
  doc.fillColor("#94A3B8").fontSize(8).font("Helvetica").text(
    "Fleev Commercial Fleet Management System  •  NHVR Standards Compliant  •  Tax Invoice",
    40,
    760,
    { align: "center", width: 515 }
  );

  doc.end();
}
