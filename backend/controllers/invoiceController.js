import Invoice from "../models/Invoice.js";
import Vehicle from "../models/Vehicle.js";

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .sort({ createdAt: -1 })
      .populate("vehicle", "registration fleetNumber vehicleType");
    return res.json(invoices);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching invoices" });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "vehicle",
      "registration fleetNumber vehicleType"
    );
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    return res.json(invoice);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching invoice" });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const { category, vendor, amount, date, vehicleId, status, notes } = req.body;
    let vehicle = null;
    if (vehicleId) vehicle = await Vehicle.findById(vehicleId);

    const invoiceNumber = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      category: category || "Services",
      vendor: vendor || "Fleet Vendor",
      amount: amount || "$0",
      date: date || "Aug 05, 2026",
      vehicle: vehicle ? vehicle._id : null,
      status: status || "Paid",
      notes: notes || "",
      createdBy: req.user._id,
    });

    const populated = await Invoice.findById(invoice._id).populate("vehicle", "registration fleetNumber");
    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: "Server error creating invoice" });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
      "vehicle",
      "registration fleetNumber"
    );
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    return res.json(invoice);
  } catch (error) {
    return res.status(500).json({ message: "Server error updating invoice" });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    return res.json({ message: "Invoice deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error deleting invoice" });
  }
};
