import WorkshopInvoice from "../models/WorkshopInvoice.js";
import WorkshopVehicle from "../models/WorkshopVehicle.js";
import WorkshopCustomer from "../models/WorkshopCustomer.js";
import WorkshopWorkOrder from "../models/WorkshopWorkOrder.js";

// @desc    Get all invoices/expenses (supports Parts, Insurances, Other Expenses tabs)
// @route   GET /api/workshop/invoices
export const getWorkshopInvoices = async (req, res) => {
  try {
    const owner = req.user._id;
    const { category, workOrderId, vehicleId, customerId, search } = req.query;

    let query = { owner };
    if (category && category !== "ALL") query.category = category;
    if (workOrderId) query.workOrder = workOrderId;
    if (vehicleId) query.vehicle = vehicleId;
    if (customerId) query.customer = customerId;

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { invoiceNumber: { $regex: s, $options: "i" } },
        { vendor: { $regex: s, $options: "i" } },
        { notes: { $regex: s, $options: "i" } },
      ];
    }

    const invoices = await WorkshopInvoice.find(query)
      .populate("customer", "fullName companyName phone")
      .populate("vehicle", "make model registration vehicleType")
      .populate("workOrder", "jobNumber jobType status")
      .sort({ date: -1 })
      .lean();

    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Server error fetching invoices" });
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/workshop/invoices/:id
export const getWorkshopInvoiceById = async (req, res) => {
  try {
    const owner = req.user._id;
    const invoice = await WorkshopInvoice.findOne({ _id: req.params.id, owner })
      .populate("customer", "fullName companyName phone email")
      .populate("vehicle", "make model registration vehicleType status vin")
      .populate("workOrder", "jobNumber jobType status");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ message: "Server error fetching invoice" });
  }
};

// @desc    Create invoice/expense record
// @route   POST /api/workshop/invoices
export const createWorkshopInvoice = async (req, res) => {
  try {
    const owner = req.user._id;
    const {
      invoiceNumber,
      category,
      customerId,
      vehicleId,
      workOrderId,
      vendor,
      amount,
      date,
      file,
      notes,
    } = req.body;

    if (!invoiceNumber || amount === undefined) {
      return res.status(400).json({ message: "Invoice Number and Amount are required" });
    }

    let finalCustomerId = customerId;
    let finalVehicleId = vehicleId;

    if (workOrderId && (!finalCustomerId || !finalVehicleId)) {
      const wo = await WorkshopWorkOrder.findOne({ _id: workOrderId, owner });
      if (wo) {
        if (!finalCustomerId) finalCustomerId = wo.customer;
        if (!finalVehicleId) finalVehicleId = wo.vehicle;
      }
    }

    const invoice = await WorkshopInvoice.create({
      owner,
      invoiceNumber: invoiceNumber.trim(),
      category: category || "Parts",
      customer: finalCustomerId || undefined,
      vehicle: finalVehicleId || undefined,
      workOrder: workOrderId || undefined,
      vendor: vendor ? vendor.trim() : "",
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      file: file ? file.trim() : "",
      notes: notes ? notes.trim() : "",
    });

    const populated = await WorkshopInvoice.findById(invoice._id)
      .populate("customer", "fullName companyName phone")
      .populate("vehicle", "make model registration vehicleType")
      .populate("workOrder", "jobNumber jobType status");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ message: "Server error creating invoice" });
  }
};

// @desc    Update invoice
// @route   PATCH /api/workshop/invoices/:id
export const updateWorkshopInvoice = async (req, res) => {
  try {
    const owner = req.user._id;
    const invoice = await WorkshopInvoice.findOne({ _id: req.params.id, owner });
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const {
      invoiceNumber,
      category,
      vendor,
      amount,
      date,
      file,
      notes,
    } = req.body;

    if (invoiceNumber) invoice.invoiceNumber = invoiceNumber.trim();
    if (category) invoice.category = category;
    if (vendor !== undefined) invoice.vendor = vendor.trim();
    if (amount !== undefined) invoice.amount = Number(amount);
    if (date) invoice.date = new Date(date);
    if (file !== undefined) invoice.file = file.trim();
    if (notes !== undefined) invoice.notes = notes.trim();

    await invoice.save();

    const updated = await WorkshopInvoice.findById(invoice._id)
      .populate("customer", "fullName companyName phone")
      .populate("vehicle", "make model registration vehicleType")
      .populate("workOrder", "jobNumber jobType status");

    res.json(updated);
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ message: "Server error updating invoice" });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/workshop/invoices/:id
export const deleteWorkshopInvoice = async (req, res) => {
  try {
    const owner = req.user._id;
    const invoice = await WorkshopInvoice.findOne({ _id: req.params.id, owner });
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    await WorkshopInvoice.deleteOne({ _id: invoice._id });
    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ message: "Server error deleting invoice" });
  }
};

// @desc    Download and stream Invoice PDF
// @route   GET /api/workshop/invoices/:id/pdf
export const downloadWorkshopInvoicePdf = async (req, res) => {
  try {
    const { streamInvoicePdf } = await import("../utils/invoicePdfGenerator.js");
    const invoice = await WorkshopInvoice.findById(req.params.id)
      .populate("customer", "fullName companyName phone email")
      .populate("vehicle", "make model registration vehicleType status vin odometer")
      .populate("workOrder", "jobNumber jobType status");

    if (!invoice) {
      return res.status(404).send("Invoice not found");
    }

    streamInvoicePdf(invoice, res);
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    res.status(500).send("Error generating invoice PDF");
  }
};
