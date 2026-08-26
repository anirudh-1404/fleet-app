import WorkshopWorkOrder from "../models/WorkshopWorkOrder.js";
import WorkshopVehicle from "../models/WorkshopVehicle.js";
import WorkshopCustomer from "../models/WorkshopCustomer.js";
import WorkshopInspection from "../models/WorkshopInspection.js";
import WorkshopService from "../models/WorkshopService.js";
import WorkshopInvoice from "../models/WorkshopInvoice.js";
import WorkshopNote from "../models/WorkshopNote.js";

// Helper to generate next unique Job Number
const generateJobNumber = async (owner) => {
  const count = await WorkshopWorkOrder.countDocuments({ owner });
  const year = new Date().getFullYear();
  return `WO-${year}-${String(count + 1).padStart(4, "0")}`;
};

// @desc    Get all workshop work orders
// @route   GET /api/workshop/work-orders
export const getWorkshopWorkOrders = async (req, res) => {
  try {
    const owner = req.user._id;
    const { status, priority, jobType, vehicleId, customerId, search } = req.query;

    let query = { owner };
    if (status && status !== "ALL") query.status = status;
    if (priority && priority !== "ALL") query.priority = priority;
    if (jobType && jobType !== "ALL") query.jobType = jobType;
    if (vehicleId) query.vehicle = vehicleId;
    if (customerId) query.customer = customerId;

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { jobNumber: { $regex: s, $options: "i" } },
        { description: { $regex: s, $options: "i" } },
        { assignedMechanic: { $regex: s, $options: "i" } },
      ];
    }

    const workOrders = await WorkshopWorkOrder.find(query)
      .populate("customer", "fullName companyName phone")
      .populate("vehicle", "make model registration vehicleType status odometer")
      .sort({ createdAt: -1 })
      .lean();

    res.json(workOrders);
  } catch (error) {
    console.error("Error fetching work orders:", error);
    res.status(500).json({ message: "Server error fetching work orders" });
  }
};

// @desc    Get single work order by ID with linked inspections, services, invoices, notes
// @route   GET /api/workshop/work-orders/:id
export const getWorkshopWorkOrderById = async (req, res) => {
  try {
    const owner = req.user._id;
    const workOrder = await WorkshopWorkOrder.findOne({ _id: req.params.id, owner })
      .populate("customer", "fullName companyName phone email address")
      .populate("vehicle", "make model registration vehicleType status odometer vin photo");

    if (!workOrder) {
      return res.status(404).json({ message: "Work order not found" });
    }

    const inspections = await WorkshopInspection.find({ owner, workOrder: workOrder._id }).sort({ date: -1 });
    const services = await WorkshopService.find({ owner, workOrder: workOrder._id }).sort({ date: -1 });
    const invoices = await WorkshopInvoice.find({ owner, workOrder: workOrder._id }).sort({ date: -1 });
    const notes = await WorkshopNote.find({ owner, workOrder: workOrder._id }).sort({ date: -1 });

    const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

    res.json({
      workOrder,
      inspections,
      services,
      invoices,
      notes,
      totalInvoiceAmount,
    });
  } catch (error) {
    console.error("Error fetching work order details:", error);
    res.status(500).json({ message: "Server error fetching work order details" });
  }
};

// @desc    Create new work order
// @route   POST /api/workshop/work-orders
export const createWorkshopWorkOrder = async (req, res) => {
  try {
    const owner = req.user._id;
    const {
      customerId,
      vehicleId,
      jobType,
      description,
      dateReceived,
      expectedCompletionDate,
      assignedMechanic,
      priority,
      status,
      notes,
    } = req.body;

    if (!customerId || !vehicleId) {
      return res.status(400).json({ message: "Customer and Vehicle are required to create a Work Order" });
    }

    const customer = await WorkshopCustomer.findOne({ _id: customerId, owner });
    if (!customer) return res.status(400).json({ message: "Invalid customer selected" });

    const vehicle = await WorkshopVehicle.findOne({ _id: vehicleId, owner });
    if (!vehicle) return res.status(400).json({ message: "Invalid vehicle selected" });

    const jobNumber = await generateJobNumber(owner);

    const initialStatus = status || "OPEN";

    const workOrder = await WorkshopWorkOrder.create({
      owner,
      customer: customer._id,
      vehicle: vehicle._id,
      jobNumber,
      jobType: jobType || "Basic Service",
      description: description ? description.trim() : "",
      dateReceived: dateReceived ? new Date(dateReceived) : new Date(),
      expectedCompletionDate: expectedCompletionDate ? new Date(expectedCompletionDate) : undefined,
      assignedMechanic: assignedMechanic ? assignedMechanic.trim() : "",
      priority: priority || "Normal",
      status: initialStatus,
      notes: notes ? notes.trim() : "",
    });

    // Automatically update vehicle status if in workshop
    if (initialStatus === "OPEN" || initialStatus === "IN_PROGRESS" || initialStatus === "INSPECTION_PENDING") {
      vehicle.status = "IN_WORKSHOP";
      await vehicle.save();
    }

    const populated = await WorkshopWorkOrder.findById(workOrder._id)
      .populate("customer", "fullName companyName phone")
      .populate("vehicle", "make model registration vehicleType status");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating work order:", error);
    res.status(500).json({ message: "Server error creating work order" });
  }
};

// @desc    Update work order
// @route   PATCH /api/workshop/work-orders/:id
export const updateWorkshopWorkOrder = async (req, res) => {
  try {
    const owner = req.user._id;
    const workOrder = await WorkshopWorkOrder.findOne({ _id: req.params.id, owner });
    if (!workOrder) {
      return res.status(404).json({ message: "Work order not found" });
    }

    const {
      jobType,
      description,
      dateReceived,
      expectedCompletionDate,
      assignedMechanic,
      priority,
      status,
      notes,
    } = req.body;

    if (jobType) workOrder.jobType = jobType;
    if (description !== undefined) workOrder.description = description.trim();
    if (dateReceived) workOrder.dateReceived = new Date(dateReceived);
    if (expectedCompletionDate !== undefined) {
      workOrder.expectedCompletionDate = expectedCompletionDate ? new Date(expectedCompletionDate) : undefined;
    }
    if (assignedMechanic !== undefined) workOrder.assignedMechanic = assignedMechanic.trim();
    if (priority) workOrder.priority = priority;
    if (notes !== undefined) workOrder.notes = notes.trim();

    // Handle status lifecycle transitions
    if (status && status !== workOrder.status) {
      workOrder.status = status;

      const vehicle = await WorkshopVehicle.findOne({ _id: workOrder.vehicle, owner });
      if (vehicle) {
        if (status === "READY_FOR_COLLECTION") {
          vehicle.status = "READY_FOR_COLLECTION";
          await vehicle.save();
        } else if (status === "COMPLETED") {
          workOrder.actualCompletionDate = new Date();
          // If no other open jobs for this vehicle, set to OUTSIDE_WORKSHOP
          const otherOpenJobs = await WorkshopWorkOrder.countDocuments({
            owner,
            vehicle: vehicle._id,
            _id: { $ne: workOrder._id },
            status: { $in: ["OPEN", "INSPECTION_PENDING", "IN_PROGRESS", "WAITING_FOR_PARTS", "READY_FOR_COLLECTION"] },
          });
          if (otherOpenJobs === 0) {
            vehicle.status = "OUTSIDE_WORKSHOP";
            await vehicle.save();
          }
        } else if (status === "IN_PROGRESS" || status === "INSPECTION_PENDING" || status === "WAITING_FOR_PARTS") {
          vehicle.status = "IN_WORKSHOP";
          await vehicle.save();
        }
      }
    }

    await workOrder.save();

    const updated = await WorkshopWorkOrder.findById(workOrder._id)
      .populate("customer", "fullName companyName phone")
      .populate("vehicle", "make model registration vehicleType status");

    res.json(updated);
  } catch (error) {
    console.error("Error updating work order:", error);
    res.status(500).json({ message: "Server error updating work order" });
  }
};

// @desc    Delete work order
// @route   DELETE /api/workshop/work-orders/:id
export const deleteWorkshopWorkOrder = async (req, res) => {
  try {
    const owner = req.user._id;
    const workOrder = await WorkshopWorkOrder.findOne({ _id: req.params.id, owner });
    if (!workOrder) {
      return res.status(404).json({ message: "Work order not found" });
    }

    await WorkshopWorkOrder.deleteOne({ _id: workOrder._id });
    res.json({ message: "Work order deleted successfully" });
  } catch (error) {
    console.error("Error deleting work order:", error);
    res.status(500).json({ message: "Server error deleting work order" });
  }
};
