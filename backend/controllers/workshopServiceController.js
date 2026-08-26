import WorkshopService from "../models/WorkshopService.js";
import WorkshopVehicle from "../models/WorkshopVehicle.js";
import WorkshopCustomer from "../models/WorkshopCustomer.js";
import WorkshopWorkOrder from "../models/WorkshopWorkOrder.js";

// @desc    Get all services (supports Truck vs Trailer and Lube/Basic/Annual tabs)
// @route   GET /api/workshop/services
export const getWorkshopServices = async (req, res) => {
  try {
    const owner = req.user._id;
    const { vehicleCategory, serviceType, vehicleId, workOrderId, search } = req.query;

    let query = { owner };
    if (vehicleCategory && vehicleCategory !== "ALL") query.vehicleCategory = vehicleCategory;
    if (serviceType && serviceType !== "ALL") query.serviceType = serviceType;
    if (vehicleId) query.vehicle = vehicleId;
    if (workOrderId) query.workOrder = workOrderId;

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { workshopVendor: { $regex: s, $options: "i" } },
        { notes: { $regex: s, $options: "i" } },
      ];
    }

    const services = await WorkshopService.find(query)
      .populate("customer", "fullName companyName phone")
      .populate("vehicle", "make model registration vehicleType status odometer")
      .populate("workOrder", "jobNumber jobType status")
      .sort({ date: -1 })
      .lean();

    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Server error fetching services" });
  }
};

// @desc    Get single service by ID
// @route   GET /api/workshop/services/:id
export const getWorkshopServiceById = async (req, res) => {
  try {
    const owner = req.user._id;
    const service = await WorkshopService.findOne({ _id: req.params.id, owner })
      .populate("customer", "fullName companyName phone email")
      .populate("vehicle", "make model registration vehicleType status odometer vin")
      .populate("workOrder", "jobNumber jobType status description");

    if (!service) {
      return res.status(404).json({ message: "Service record not found" });
    }

    res.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({ message: "Server error fetching service" });
  }
};

// @desc    Create new service record
// @route   POST /api/workshop/services
export const createWorkshopService = async (req, res) => {
  try {
    const owner = req.user._id;
    const {
      customerId,
      vehicleId,
      workOrderId,
      vehicleCategory,
      serviceType,
      date,
      odometer,
      cost,
      workshopVendor,
      nextDueDate,
      nextDueOdometer,
      notes,
    } = req.body;

    if (!vehicleId || !serviceType) {
      return res.status(400).json({ message: "Vehicle and Service Type are required" });
    }

    const vehicle = await WorkshopVehicle.findOne({ _id: vehicleId, owner });
    if (!vehicle) return res.status(400).json({ message: "Invalid vehicle selected" });

    let finalCustomerId = customerId;
    if (!finalCustomerId) {
      finalCustomerId = vehicle.customer;
    }

    const customer = await WorkshopCustomer.findOne({ _id: finalCustomerId, owner });
    if (!customer) return res.status(400).json({ message: "Invalid customer" });

    const resolvedCategory = vehicleCategory || (vehicle.vehicleType === "Trailer" ? "Trailer" : "Truck");

    // Auto calculate next due date if not provided (e.g. 6 months for basic, 1 year for annual, 3 months for lube)
    let computedNextDueDate = nextDueDate ? new Date(nextDueDate) : undefined;
    if (!computedNextDueDate) {
      const baseDate = date ? new Date(date) : new Date();
      if (serviceType === "Annual Service") {
        computedNextDueDate = new Date(baseDate.setFullYear(baseDate.getFullYear() + 1));
      } else if (serviceType === "Basic Service") {
        computedNextDueDate = new Date(baseDate.setMonth(baseDate.getMonth() + 6));
      } else if (serviceType === "Lube Service") {
        computedNextDueDate = new Date(baseDate.setMonth(baseDate.getMonth() + 3));
      }
    }

    const service = await WorkshopService.create({
      owner,
      customer: customer._id,
      vehicle: vehicle._id,
      workOrder: workOrderId || undefined,
      vehicleCategory: resolvedCategory,
      serviceType: serviceType || "Basic Service",
      date: date ? new Date(date) : new Date(),
      odometer: odometer ? Number(odometer) : vehicle.odometer || 0,
      cost: cost ? Number(cost) : 0,
      workshopVendor: workshopVendor ? workshopVendor.trim() : "",
      nextDueDate: computedNextDueDate,
      nextDueOdometer: nextDueOdometer ? Number(nextDueOdometer) : undefined,
      notes: notes ? notes.trim() : "",
    });

    // Update vehicle odometer if higher
    if (odometer && Number(odometer) > (vehicle.odometer || 0)) {
      vehicle.odometer = Number(odometer);
      await vehicle.save();
    }

    // If linked to work order, ensure status is in progress
    if (workOrderId) {
      const wo = await WorkshopWorkOrder.findOne({ _id: workOrderId, owner });
      if (wo && (wo.status === "OPEN" || wo.status === "INSPECTION_PENDING")) {
        wo.status = "IN_PROGRESS";
        await wo.save();
      }
    }

    const populated = await WorkshopService.findById(service._id)
      .populate("customer", "fullName companyName phone")
      .populate("vehicle", "make model registration vehicleType status")
      .populate("workOrder", "jobNumber jobType status");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating service record:", error);
    res.status(500).json({ message: "Server error creating service record" });
  }
};

// @desc    Update service record
// @route   PATCH /api/workshop/services/:id
export const updateWorkshopService = async (req, res) => {
  try {
    const owner = req.user._id;
    const service = await WorkshopService.findOne({ _id: req.params.id, owner });
    if (!service) {
      return res.status(404).json({ message: "Service record not found" });
    }

    const {
      serviceType,
      date,
      odometer,
      cost,
      workshopVendor,
      nextDueDate,
      nextDueOdometer,
      notes,
    } = req.body;

    if (serviceType) service.serviceType = serviceType;
    if (date) service.date = new Date(date);
    if (odometer !== undefined) service.odometer = Number(odometer);
    if (cost !== undefined) service.cost = Number(cost);
    if (workshopVendor !== undefined) service.workshopVendor = workshopVendor.trim();
    if (nextDueDate !== undefined) service.nextDueDate = nextDueDate ? new Date(nextDueDate) : undefined;
    if (nextDueOdometer !== undefined) service.nextDueOdometer = nextDueOdometer ? Number(nextDueOdometer) : undefined;
    if (notes !== undefined) service.notes = notes.trim();

    await service.save();

    const updated = await WorkshopService.findById(service._id)
      .populate("customer", "fullName companyName phone")
      .populate("vehicle", "make model registration vehicleType status")
      .populate("workOrder", "jobNumber jobType status");

    res.json(updated);
  } catch (error) {
    console.error("Error updating service record:", error);
    res.status(500).json({ message: "Server error updating service record" });
  }
};

// @desc    Delete service record
// @route   DELETE /api/workshop/services/:id
export const deleteWorkshopService = async (req, res) => {
  try {
    const owner = req.user._id;
    const service = await WorkshopService.findOne({ _id: req.params.id, owner });
    if (!service) {
      return res.status(404).json({ message: "Service record not found" });
    }

    await WorkshopService.deleteOne({ _id: service._id });
    res.json({ message: "Service record deleted successfully" });
  } catch (error) {
    console.error("Error deleting service record:", error);
    res.status(500).json({ message: "Server error deleting service record" });
  }
};
