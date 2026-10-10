import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert, Platform, Linking } from "react-native";
import { SERVER_URL } from "../constants/config";

/**
 * Builds clean, professional HTML for Tax Invoice
 */
export function generateInvoiceHTML(invoice) {
  const invoiceNumber = invoice?.invoiceNumber || "INV-0001";
  const category = invoice?.category || "Workshop Service";
  const dateStr = new Date(invoice?.date || invoice?.createdAt || Date.now()).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const amount = Number(invoice?.amount || 0);
  const gst = (amount * 0.1).toFixed(2);
  const subtotal = (amount - Number(gst)).toFixed(2);
  const total = amount.toFixed(2);

  const vendor = invoice?.vendor || "Workfle Commercial Fleet Workshop";
  const customerName = invoice?.customer?.fullName || invoice?.customer?.name || "Valued Fleet Customer";
  const customerCompany = invoice?.customer?.companyName || "";
  const customerPhone = invoice?.customer?.phone || invoice?.customer?.mobileNumber || "";
  const customerEmail = invoice?.customer?.email || "";

  const vehicleRego = invoice?.vehicle?.registration || invoice?.registration || "N/A";
  const vehicleMake = invoice?.vehicle?.make || invoice?.vehicleName || "";
  const vehicleModel = invoice?.vehicle?.model || "";
  const vehicleYear = invoice?.vehicle?.year ? `(${invoice.vehicle.year})` : "";
  const vehicleVin = invoice?.vehicle?.vin || "";
  const vehicleOdo = invoice?.vehicle?.odometer ? `${Number(invoice.vehicle.odometer).toLocaleString()} km` : "";

  const workOrderNumber = invoice?.workOrder?.jobNumber || invoice?.workOrderId || "";
  const notes = invoice?.notes || invoice?.description || "Work completed and verified according to NHVR & Australian commercial workshop standards.";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Tax Invoice - ${invoiceNumber}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        body { background: #FFFFFF; color: #0F172A; padding: 36px 32px; font-size: 13px; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0F172A; padding-bottom: 20px; margin-bottom: 24px; }
        .logo-area h1 { font-size: 26px; font-weight: 900; color: #0F172A; letter-spacing: -0.5px; }
        .logo-area p { color: #64748B; font-size: 11px; margin-top: 3px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { font-size: 24px; font-weight: 800; color: #2563EB; }
        .invoice-title .inv-badge { display: inline-block; background: #EFF6FF; border: 1px solid #BFDBFE; color: #1D4ED8; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 4px; margin-top: 4px; }
        
        .info-grid { display: flex; justify-content: space-between; margin-bottom: 24px; gap: 20px; }
        .info-col { flex: 1; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; }
        .info-col h3 { font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .info-col p { font-size: 13px; color: #1E293B; margin-bottom: 3px; }
        .info-col strong { color: #0F172A; font-weight: 700; }

        .vehicle-strip { background: #0F172A; color: white; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .vehicle-rego { display: inline-block; background: #FEF08A; color: #854D0E; font-weight: 900; font-size: 13px; padding: 2px 8px; border-radius: 4px; margin-right: 10px; }
        .vehicle-meta { font-size: 12px; color: #94A3B8; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #F1F5F9; color: #475569; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; padding: 10px 12px; border-bottom: 2px solid #CBD5E1; }
        td { padding: 12px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #334155; }
        .text-right { text-align: right; }
        .text-bold { font-weight: 700; }

        .calc-section { display: flex; justify-content: flex-end; margin-bottom: 28px; }
        .calc-table { width: 280px; }
        .calc-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #64748B; }
        .calc-row.total { border-top: 2px solid #0F172A; border-bottom: 2px solid #0F172A; padding: 10px 0; font-size: 17px; font-weight: 900; color: #0F172A; margin-top: 6px; }

        .notes-box { background: #F8FAFC; border-left: 4px solid #2563EB; padding: 12px 14px; border-radius: 0 6px 6px 0; margin-bottom: 28px; }
        .notes-box h4 { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 4px; }
        .notes-box p { font-size: 12px; color: #334155; line-height: 1.5; }

        .footer { border-top: 1px solid #E2E8F0; padding-top: 16px; text-align: center; color: #94A3B8; font-size: 11px; }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="logo-area">
          <h1>WORKFLE WORKSHOP</h1>
          <p>Heavy Commercial Fleet Solutions & Workshop</p>
        </div>
        <div class="invoice-title">
          <h2>TAX INVOICE</h2>
          <div class="inv-badge"># ${invoiceNumber}</div>
        </div>
      </div>

      <!-- Info Columns -->
      <div class="info-grid">
        <div class="info-col">
          <h3>Billed To (Customer)</h3>
          <p><strong>${customerName}</strong></p>
          ${customerCompany ? `<p>${customerCompany}</p>` : ""}
          ${customerPhone ? `<p>Phone: ${customerPhone}</p>` : ""}
          ${customerEmail ? `<p>Email: ${customerEmail}</p>` : ""}
        </div>

        <div class="info-col">
          <h3>Invoice Details</h3>
          <p><strong>Date:</strong> ${dateStr}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Vendor / Provider:</strong> ${vendor}</p>
          ${workOrderNumber ? `<p><strong>Linked Work Order:</strong> ${workOrderNumber}</p>` : ""}
        </div>
      </div>

      <!-- Vehicle Strip -->
      <div class="vehicle-strip">
        <div>
          <span class="vehicle-rego">${vehicleRego}</span>
          <span style="font-weight: 700; font-size: 13px;">${vehicleMake} ${vehicleModel} ${vehicleYear}</span>
        </div>
        <div class="vehicle-meta">
          ${vehicleOdo ? `Odo: ${vehicleOdo} &nbsp;|&nbsp; ` : ""}
          ${vehicleVin ? `VIN: ${vehicleVin}` : ""}
        </div>
      </div>

      <!-- Line Items Table -->
      <table>
        <thead>
          <tr>
            <th style="width: 50%;">Description / Scope of Work</th>
            <th>Category</th>
            <th>Vendor</th>
            <th class="text-right">Total ($ AUD)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-bold">
              ${category} - ${vehicleRego}
              <div style="font-size: 11px; font-weight: normal; color: #64748B; margin-top: 2px;">
                ${invoice?.notes || "Commercial service & parts maintenance intake"}
              </div>
            </td>
            <td>${category}</td>
            <td>${vendor}</td>
            <td class="text-right text-bold">$${total}</td>
          </tr>
        </tbody>
      </table>

      <!-- Calculations -->
      <div class="calc-section">
        <div class="calc-table">
          <div class="calc-row">
            <span>Subtotal (Excl. GST):</span>
            <span>$${subtotal}</span>
          </div>
          <div class="calc-row">
            <span>GST (10%):</span>
            <span>$${gst}</span>
          </div>
          <div class="calc-row total">
            <span>Total Amount Due:</span>
            <span>$${total}</span>
          </div>
        </div>
      </div>

      <!-- Notes / Terms -->
      <div class="notes-box">
        <h4>Workshop Remarks & Payment Terms</h4>
        <p>${notes}</p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>Thank you for choosing Workfle Workshop. All services performed adhere to Australian Road Transport & NHVR standards.</p>
        <p style="margin-top: 4px;">Electronic Tax Invoice generated by Workfle Fleet Management System</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generates the PDF file and opens the native OS Save / Share dialog
 * allowing the user to save it directly to their phone (Files / Downloads)
 */
export async function downloadAndSaveInvoicePdf(invoice) {
  try {
    const html = generateInvoiceHTML(invoice);

    // 1. Generate local PDF file using expo-print
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // 2. Check if sharing is available on the device
    const isAvailable = await Sharing.isAvailableAsync();

    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
        dialogTitle: `Save Invoice ${invoice?.invoiceNumber || ""}.pdf`,
      });
      return { success: true, uri };
    } else {
      // Fallback for web or devices without share provider: Print/view
      await Print.printAsync({ html });
      return { success: true, uri };
    }
  } catch (error) {
    console.warn("Direct PDF generation error, trying fallback URL:", error);

    // If local print fails, open the backend PDF URL
    const invoiceId = invoice?._id || invoice?.id;
    if (invoiceId) {
      const backendPdfUrl = `${SERVER_URL}/api/workshop/invoices/${invoiceId}/pdf`;
      const canOpen = await Linking.canOpenURL(backendPdfUrl);
      if (canOpen) {
        await Linking.openURL(backendPdfUrl);
        return { success: true, fallback: true };
      }
    }

    Alert.alert(
      "Download Notice",
      "Could not generate PDF directly on this device. Please ensure storage permissions are enabled."
    );
    throw error;
  }
}

/**
 * Directly prints or previews the invoice
 */
export async function printInvoicePdf(invoice) {
  try {
    const html = generateInvoiceHTML(invoice);
    await Print.printAsync({ html });
  } catch (error) {
    console.error("Print error:", error);
    Alert.alert("Print Error", "Could not open print preview.");
  }
}
