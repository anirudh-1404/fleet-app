import WorkshopInspection from "../models/WorkshopInspection.js";
import WorkshopVehicle from "../models/WorkshopVehicle.js";
import WorkshopCustomer from "../models/WorkshopCustomer.js";
import WorkshopWorkOrder from "../models/WorkshopWorkOrder.js";

// @desc    Get all inspections (supports Truck vs Trailer sub-tab filtering)
// @route   GET /api/workshop/inspections
export const getWorkshopInspections = async (req, res) => {
  try {
    const owner = req.user._id;
    const { inspectionType, status, vehicleId, workOrderId, search } = req.query;

    let query = { owner };
    if (inspectionType && inspectionType !== "ALL") query.inspectionType = inspectionType;
    if (status && status !== "ALL") query.status = status;
    if (vehicleId) query.vehicle = vehicleId;
    if (workOrderId) query.workOrder = workOrderId;

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { inspectorName: { $regex: s, $options: "i" } },
        { notes: { $regex: s, $options: "i" } },
      ];
    }

    const inspections = await WorkshopInspection.find(query)
      .populate("customer", "fullName companyName phone")
      .populate("vehicle", "make model registration vehicleType status")
      .populate("workOrder", "jobNumber jobType status")
      .sort({ date: -1 })
      .lean();

    res.json(inspections);
  } catch (error) {
    console.error("Error fetching inspections:", error);
    res.status(500).json({ message: "Server error fetching inspections" });
  }
};

// @desc    Get single inspection by ID
// @route   GET /api/workshop/inspections/:id
export const getWorkshopInspectionById = async (req, res) => {
  try {
    const owner = req.user._id;
    const inspection = await WorkshopInspection.findOne({ _id: req.params.id, owner })
      .populate("customer", "fullName companyName phone email")
      .populate("vehicle", "make model registration vehicleType status vin")
      .populate("workOrder", "jobNumber jobType status description");

    if (!inspection) {
      return res.status(404).json({ message: "Inspection not found" });
    }

    res.json(inspection);
  } catch (error) {
    console.error("Error fetching inspection:", error);
    res.status(500).json({ message: "Server error fetching inspection" });
  }
};

// @desc    Create new inspection
// @route   POST /api/workshop/inspections
export const createWorkshopInspection = async (req, res) => {
  try {
    const owner = req.user._id;
    const {
      customerId,
      vehicleId,
      workOrderId,
      inspectionType,
      date,
      inspectorName,
      checklistItems,
      status,
      notes,
    } = req.body;

    if (!vehicleId || !inspectorName) {
      return res.status(400).json({ message: "Vehicle and Inspector Name are required" });
    }

    const vehicle = await WorkshopVehicle.findOne({ _id: vehicleId, owner });
    if (!vehicle) return res.status(400).json({ message: "Invalid vehicle selected" });

    let finalCustomerId = customerId;
    if (!finalCustomerId) {
      finalCustomerId = vehicle.customer;
    }

    const customer = await WorkshopCustomer.findOne({ _id: finalCustomerId, owner });
    if (!customer) return res.status(400).json({ message: "Invalid customer" });

    // Derive type from vehicle if not explicitly supplied
    const resolvedType = inspectionType || (vehicle.vehicleType === "Trailer" ? "Trailer" : "Truck");

    const inspection = await WorkshopInspection.create({
      owner,
      customer: customer._id,
      vehicle: vehicle._id,
      workOrder: workOrderId || undefined,
      inspectionType: resolvedType,
      date: date ? new Date(date) : new Date(),
      inspectorName: inspectorName.trim(),
      checklistItems: Array.isArray(checklistItems) ? checklistItems : [],
      status: status || "PENDING",
      notes: notes ? notes.trim() : "",
    });

    // If linked to work order and inspection is in progress or completed, update work order status if appropriate
    if (workOrderId) {
      const wo = await WorkshopWorkOrder.findOne({ _id: workOrderId, owner });
      if (wo && wo.status === "OPEN") {
        wo.status = "IN_PROGRESS";
        await wo.save();
      }
    }

    const populated = await WorkshopInspection.findById(inspection._id)
      .populate("customer", "fullName companyName phone")
      .populate("vehicle", "make model registration vehicleType status")
      .populate("workOrder", "jobNumber jobType status");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating inspection:", error);
    res.status(500).json({ message: "Server error creating inspection" });
  }
};

// @desc    Update inspection
// @route   PATCH /api/workshop/inspections/:id
export const updateWorkshopInspection = async (req, res) => {
  try {
    const owner = req.user._id;
    const inspection = await WorkshopInspection.findOne({ _id: req.params.id, owner });
    if (!inspection) {
      return res.status(404).json({ message: "Inspection not found" });
    }

    const {
      inspectionType,
      date,
      inspectorName,
      checklistItems,
      status,
      notes,
    } = req.body;

    if (inspectionType) inspection.inspectionType = inspectionType;
    if (date) inspection.date = new Date(date);
    if (inspectorName !== undefined) inspection.inspectorName = inspectorName.trim();
    if (checklistItems !== undefined && Array.isArray(checklistItems)) {
      inspection.checklistItems = checklistItems;
    }
    if (status) inspection.status = status;
    if (notes !== undefined) inspection.notes = notes.trim();

    await inspection.save();

    const updated = await WorkshopInspection.findById(inspection._id)
      .populate("customer", "fullName companyName phone")
      .populate("vehicle", "make model registration vehicleType status")
      .populate("workOrder", "jobNumber jobType status");

    res.json(updated);
  } catch (error) {
    console.error("Error updating inspection:", error);
    res.status(500).json({ message: "Server error updating inspection" });
  }
};

// @desc    Delete inspection
// @route   DELETE /api/workshop/inspections/:id
export const deleteWorkshopInspection = async (req, res) => {
  try {
    const owner = req.user._id;
    const inspection = await WorkshopInspection.findOne({ _id: req.params.id, owner });
    if (!inspection) {
      return res.status(404).json({ message: "Inspection not found" });
    }

    await WorkshopInspection.deleteOne({ _id: inspection._id });
    res.json({ message: "Inspection deleted successfully" });
  } catch (error) {
    console.error("Error deleting inspection:", error);
    res.status(500).json({ message: "Server error deleting inspection" });
  }
};
