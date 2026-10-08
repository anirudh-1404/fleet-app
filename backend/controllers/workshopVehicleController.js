import WorkshopVehicle from "../models/WorkshopVehicle.js";
import WorkshopCustomer from "../models/WorkshopCustomer.js";
import WorkshopWorkOrder from "../models/WorkshopWorkOrder.js";
import WorkshopInspection from "../models/WorkshopInspection.js";
import WorkshopService from "../models/WorkshopService.js";
import WorkshopInvoice from "../models/WorkshopInvoice.js";

// @desc    Get all workshop vehicles
// @route   GET /api/workshop/vehicles
export const getWorkshopVehicles = async (req, res) => {
  try {
    const isEmployee = req.user.role === "workshop_employee";
    const owner = isEmployee ? req.user.workshopManager : req.user._id;
    const { search, status, vehicleType, customerId } = req.query;

    let query = { owner };
    if (status && status !== "ALL") {
      query.status = status;
    }
    if (vehicleType && vehicleType !== "ALL") {
      query.vehicleType = vehicleType;
    }
    if (customerId) {
      query.customer = customerId;
    }
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { registration: { $regex: s, $options: "i" } },
        { make: { $regex: s, $options: "i" } },
        { model: { $regex: s, $options: "i" } },
        { vin: { $regex: s, $options: "i" } },
      ];
    }

    const vehicles = await WorkshopVehicle.find(query)
      .populate("customer", "fullName companyName phone email")
      .sort({ updatedAt: -1 })
      .lean();

    res.json(vehicles);
  } catch (error) {
    console.error("Error fetching workshop vehicles:", error);
    res.status(500).json({ message: "Server error fetching vehicles" });
  }
};

// @desc    Search workshop vehicles
// @route   GET /api/workshop/vehicles/search
export const searchWorkshopVehicles = async (req, res) => {
  try {
    const isEmployee = req.user.role === "workshop_employee";
    const owner = isEmployee ? req.user.workshopManager : req.user._id;
    const q = req.query.q || req.query.search || "";

    let query = { owner };
    if (q && q.trim()) {
      const s = q.trim();
      query.$or = [
        { registration: { $regex: s, $options: "i" } },
        { make: { $regex: s, $options: "i" } },
        { model: { $regex: s, $options: "i" } },
        { vin: { $regex: s, $options: "i" } },
      ];
    }

    const vehicles = await WorkshopVehicle.find(query)
      .populate("customer", "fullName companyName phone email")
      .sort({ updatedAt: -1 })
      .lean();

    res.json(vehicles);
  } catch (error) {
    console.error("Error searching workshop vehicles:", error);
    res.status(500).json({ message: "Server error searching vehicles" });
  }
};

// @desc    Get single workshop vehicle by ID with full job & service history
// @route   GET /api/workshop/vehicles/:id
export const getWorkshopVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id.length !== 24) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const isEmployee = req.user.role === "workshop_employee";
    const owner = isEmployee ? req.user.workshopManager : req.user._id;
    const vehicle = await WorkshopVehicle.findOne({ _id: id, owner })
      .populate("customer", "fullName companyName phone email address");

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const workOrders = await WorkshopWorkOrder.find({ owner, vehicle: vehicle._id })
      .populate("assignedTo", "name designation")
      .sort({ createdAt: -1 });
    const inspections = await WorkshopInspection.find({ owner, vehicle: vehicle._id }).sort({ date: -1 });
    const services = await WorkshopService.find({ owner, vehicle: vehicle._id }).sort({ date: -1 });
    const invoices = await WorkshopInvoice.find({ owner, vehicle: vehicle._id }).sort({ date: -1 });

    res.json({
      vehicle,
      workOrders,
      inspections,
      services,
      invoices,
    });
  } catch (error) {
    console.error("Error fetching vehicle details:", error);
    res.status(500).json({ message: "Server error fetching vehicle details" });
  }
};

// @desc    Create workshop vehicle
// @route   POST /api/workshop/vehicles
export const createWorkshopVehicle = async (req, res) => {
  try {
    const isEmployee = req.user.role === "workshop_employee";
    const owner = isEmployee ? req.user.workshopManager : req.user._id;
    const {
      customerId,
      customerName,
      companyName,
      customerPhone,
      vehicleType,
      registration,
      make,
      model,
      year,
      vin,
      odometer,
      status,
      photo,
      notes,
    } = req.body;

    if (!registration || !registration.trim()) {
      return res.status(400).json({ message: "Vehicle registration / number is required" });
    }

    const regUpper = registration.trim().toUpperCase();

    // Check if vehicle with this registration already exists for this workshop owner
    const existingVehicle = await WorkshopVehicle.findOne({ owner, registration: regUpper });
    if (existingVehicle) {
      const populated = await WorkshopVehicle.findById(existingVehicle._id).populate("customer", "fullName companyName phone email");
      return res.status(200).json(populated);
    }

    let resolvedCustomerId = customerId;
    if (resolvedCustomerId) {
      const customer = await WorkshopCustomer.findOne({ _id: resolvedCustomerId, owner });
      if (!customer) resolvedCustomerId = null;
    }

    // Auto-create or resolve default customer if not explicitly passed
    if (!resolvedCustomerId) {
      const cName = customerName?.trim() || companyName?.trim() || "Fleet / Direct Customer";
      let cust = await WorkshopCustomer.findOne({ owner, companyName: cName });
      if (!cust) {
        cust = await WorkshopCustomer.findOne({ owner, fullName: cName });
      }
      if (!cust) {
        cust = await WorkshopCustomer.create({
          owner,
          fullName: cName,
          companyName: cName,
          phone: customerPhone?.trim() || "N/A",
        });
      }
      resolvedCustomerId = cust._id;
    }

    const vehicle = await WorkshopVehicle.create({
      owner,
      customer: resolvedCustomerId,
      vehicleType: vehicleType || "Truck",
      registration: regUpper,
      make: make ? make.trim() : "",
      model: model ? model.trim() : "",
      year: year ? Number(year) : new Date().getFullYear(),
      vin: vin ? vin.trim() : "",
      odometer: odometer ? Number(odometer) : 0,
      status: status || "IN_WORKSHOP",
      photo: photo ? photo.trim() : "",
      notes: notes ? notes.trim() : "",
    });

    const populated = await WorkshopVehicle.findById(vehicle._id).populate("customer", "fullName companyName phone email");
    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating workshop vehicle:", error);
    res.status(500).json({ message: "Server error creating vehicle" });
  }
};

// @desc    Update workshop vehicle
// @route   PATCH /api/workshop/vehicles/:id
export const updateWorkshopVehicle = async (req, res) => {
  try {
    const isEmployee = req.user.role === "workshop_employee";
    const owner = isEmployee ? req.user.workshopManager : req.user._id;
    const vehicle = await WorkshopVehicle.findOne({ _id: req.params.id, owner });
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const {
      customerId,
      vehicleType,
      registration,
      make,
      model,
      year,
      vin,
      odometer,
      status,
      photo,
      notes,
    } = req.body;

    if (customerId) {
      const customer = await WorkshopCustomer.findOne({ _id: customerId, owner });
      if (!customer) return res.status(400).json({ message: "Invalid customer" });
      vehicle.customer = customer._id;
    }

    if (vehicleType) vehicle.vehicleType = vehicleType;
    if (registration) vehicle.registration = registration.trim().toUpperCase();
    if (make !== undefined) vehicle.make = make.trim();
    if (model !== undefined) vehicle.model = model.trim();
    if (year !== undefined) vehicle.year = Number(year);
    if (vin !== undefined) vehicle.vin = vin.trim();
    if (odometer !== undefined) vehicle.odometer = Number(odometer);
    if (status) vehicle.status = status;
    if (photo !== undefined) vehicle.photo = photo.trim();
    if (notes !== undefined) vehicle.notes = notes.trim();

    await vehicle.save();
    const updated = await WorkshopVehicle.findById(vehicle._id).populate("customer", "fullName companyName phone email");
    res.json(updated);
  } catch (error) {
    console.error("Error updating workshop vehicle:", error);
    res.status(500).json({ message: "Server error updating vehicle" });
  }
};

// @desc    Delete workshop vehicle
// @route   DELETE /api/workshop/vehicles/:id
export const deleteWorkshopVehicle = async (req, res) => {
  try {
    const isEmployee = req.user.role === "workshop_employee";
    const owner = isEmployee ? req.user.workshopManager : req.user._id;
    const vehicle = await WorkshopVehicle.findOne({ _id: req.params.id, owner });
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Check if open work orders exist
    const openOrders = await WorkshopWorkOrder.countDocuments({
      owner,
      vehicle: vehicle._id,
      status: { $in: ["OPEN", "INSPECTION_PENDING", "IN_PROGRESS", "WAITING_FOR_PARTS", "READY_FOR_COLLECTION"] },
    });

    if (openOrders > 0) {
      return res.status(400).json({
        message: "Cannot delete vehicle with open work orders. Please resolve active jobs first.",
      });
    }

    await WorkshopVehicle.deleteOne({ _id: vehicle._id });
    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Error deleting workshop vehicle:", error);
    res.status(500).json({ message: "Server error deleting vehicle" });
  }
};
