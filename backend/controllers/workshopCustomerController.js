import WorkshopCustomer from "../models/WorkshopCustomer.js";
import WorkshopVehicle from "../models/WorkshopVehicle.js";
import WorkshopWorkOrder from "../models/WorkshopWorkOrder.js";

// @desc    Get all workshop customers
// @route   GET /api/workshop/customers
export const getWorkshopCustomers = async (req, res) => {
  try {
    const isEmployee = req.user.role === "workshop_employee";
    const owner = isEmployee ? req.user.workshopManager : req.user._id;
    const { search } = req.query;

    let query = { owner };
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { fullName: { $regex: s, $options: "i" } },
        { phone: { $regex: s, $options: "i" } },
        { companyName: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
      ];
    }

    const customers = await WorkshopCustomer.find(query).sort({ createdAt: -1 }).lean();

    // Attach counts for vehicles and work orders
    const customerIds = customers.map((c) => c._id);
    const vehicleCounts = await WorkshopVehicle.aggregate([
      { $match: { owner, customer: { $in: customerIds } } },
      { $group: { _id: "$customer", count: { $sum: 1 } } },
    ]);
    const vehicleCountMap = {};
    vehicleCounts.forEach((v) => {
      vehicleCountMap[v._id.toString()] = v.count;
    });

    const workOrderCounts = await WorkshopWorkOrder.aggregate([
      { $match: { owner, customer: { $in: customerIds } } },
      { $group: { _id: "$customer", count: { $sum: 1 } } },
    ]);
    const workOrderCountMap = {};
    workOrderCounts.forEach((w) => {
      workOrderCountMap[w._id.toString()] = w.count;
    });

    const enhanced = customers.map((c) => ({
      ...c,
      vehiclesCount: vehicleCountMap[c._id.toString()] || 0,
      workOrdersCount: workOrderCountMap[c._id.toString()] || 0,
    }));

    res.json(enhanced);
  } catch (error) {
    console.error("Error fetching workshop customers:", error);
    res.status(500).json({ message: "Server error fetching customers" });
  }
};

// @desc    Get single workshop customer by ID with vehicles & work orders
// @route   GET /api/workshop/customers/:id
export const getWorkshopCustomerById = async (req, res) => {
  try {
    const owner = req.user._id;
    const customer = await WorkshopCustomer.findOne({ _id: req.params.id, owner });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const vehicles = await WorkshopVehicle.find({ owner, customer: customer._id }).sort({ createdAt: -1 });
    const workOrders = await WorkshopWorkOrder.find({ owner, customer: customer._id })
      .populate("vehicle", "make model registration vehicleType status")
      .sort({ createdAt: -1 });

    res.json({
      customer,
      vehicles,
      workOrders,
    });
  } catch (error) {
    console.error("Error fetching customer details:", error);
    res.status(500).json({ message: "Server error fetching customer details" });
  }
};

// @desc    Create workshop customer
// @route   POST /api/workshop/customers
export const createWorkshopCustomer = async (req, res) => {
  try {
    const owner = req.user._id;
    const { fullName, companyName, phone, email, address, notes } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({ message: "Full Name and Phone Number are required" });
    }

    const customer = await WorkshopCustomer.create({
      owner,
      fullName: fullName.trim(),
      companyName: companyName ? companyName.trim() : "",
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : "",
      address: address ? address.trim() : "",
      notes: notes ? notes.trim() : "",
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error("Error creating workshop customer:", error);
    res.status(500).json({ message: "Server error creating customer" });
  }
};

// @desc    Update workshop customer
// @route   PATCH /api/workshop/customers/:id
export const updateWorkshopCustomer = async (req, res) => {
  try {
    const owner = req.user._id;
    const customer = await WorkshopCustomer.findOne({ _id: req.params.id, owner });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const { fullName, companyName, phone, email, address, notes } = req.body;
    if (fullName !== undefined) customer.fullName = fullName.trim();
    if (companyName !== undefined) customer.companyName = companyName.trim();
    if (phone !== undefined) customer.phone = phone.trim();
    if (email !== undefined) customer.email = email.trim().toLowerCase();
    if (address !== undefined) customer.address = address.trim();
    if (notes !== undefined) customer.notes = notes.trim();

    await customer.save();
    res.json(customer);
  } catch (error) {
    console.error("Error updating workshop customer:", error);
    res.status(500).json({ message: "Server error updating customer" });
  }
};

// @desc    Delete workshop customer
// @route   DELETE /api/workshop/customers/:id
export const deleteWorkshopCustomer = async (req, res) => {
  try {
    const owner = req.user._id;
    const customer = await WorkshopCustomer.findOne({ _id: req.params.id, owner });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Check if open work orders exist
    const openOrders = await WorkshopWorkOrder.countDocuments({
      owner,
      customer: customer._id,
      status: { $in: ["OPEN", "INSPECTION_PENDING", "IN_PROGRESS", "WAITING_FOR_PARTS", "READY_FOR_COLLECTION"] },
    });

    if (openOrders > 0) {
      return res.status(400).json({
        message: "Cannot delete customer with active or open work orders. Please complete or cancel them first.",
      });
    }

    await WorkshopCustomer.deleteOne({ _id: customer._id });
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting workshop customer:", error);
    res.status(500).json({ message: "Server error deleting customer" });
  }
};
