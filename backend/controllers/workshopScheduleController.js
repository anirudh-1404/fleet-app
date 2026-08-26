import WorkshopSchedule from "../models/WorkshopSchedule.js";
import WorkshopVehicle from "../models/WorkshopVehicle.js";
import WorkshopCustomer from "../models/WorkshopCustomer.js";
import WorkshopWorkOrder from "../models/WorkshopWorkOrder.js";

// @desc    Get all schedules
// @route   GET /api/workshop/schedule
export const getWorkshopSchedules = async (req, res) => {
  try {
    const owner = req.user._id;
    const { type, status, startDate, endDate, vehicleId } = req.query;

    let query = { owner };
    if (type && type !== "ALL") query.type = type;
    if (status && status !== "ALL") query.status = status;
    if (vehicleId) query.vehicle = vehicleId;

    if (startDate && endDate) {
      query.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const schedules = await WorkshopSchedule.find(query)
      .populate("customer", "fullName companyName phone")
      .populate("vehicle", "make model registration vehicleType status")
      .populate("workOrder", "jobNumber jobType status")
      .sort({ scheduledDate: 1 })
      .lean();

    res.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({ message: "Server error fetching schedules" });
  }
};

// @desc    Get single schedule by ID
// @route   GET /api/workshop/schedule/:id
export const getWorkshopScheduleById = async (req, res) => {
  try {
    const owner = req.user._id;
    const schedule = await WorkshopSchedule.findOne({ _id: req.params.id, owner })
      .populate("customer", "fullName companyName phone email")
      .populate("vehicle", "make model registration vehicleType status vin")
      .populate("workOrder", "jobNumber jobType status");

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.json(schedule);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({ message: "Server error fetching schedule" });
  }
};

// @desc    Create new schedule
// @route   POST /api/workshop/schedule
export const createWorkshopSchedule = async (req, res) => {
  try {
    const owner = req.user._id;
    const {
      type,
      vehicleId,
      customerId,
      workOrderId,
      serviceOrInspectionType,
      scheduledDate,
      assignedWorkshop,
      assignedPerson,
      reminderToggle,
      notes,
    } = req.body;

    if (!vehicleId || !scheduledDate) {
      return res.status(400).json({ message: "Vehicle and Scheduled Date are required" });
    }

    const vehicle = await WorkshopVehicle.findOne({ _id: vehicleId, owner });
    if (!vehicle) return res.status(400).json({ message: "Invalid vehicle selected" });

    let finalCustomerId = customerId;
    if (!finalCustomerId) {
      finalCustomerId = vehicle.customer;
    }

    const customer = await WorkshopCustomer.findOne({ _id: finalCustomerId, owner });
    if (!customer) return res.status(400).json({ message: "Invalid customer" });

    const schedule = await WorkshopSchedule.create({
      owner,
      type: type || "Service",
      vehicle: vehicle._id,
      customer: customer._id,
      workOrder: workOrderId || undefined,
      serviceOrInspectionType: serviceOrInspectionType || "Basic Service",
      scheduledDate: new Date(scheduledDate),
      assignedWorkshop: assignedWorkshop ? assignedWorkshop.trim() : "",
      assignedPerson: assignedPerson ? assignedPerson.trim() : "",
      reminderToggle: reminderToggle !== undefined ? reminderToggle : true,
      status: "SCHEDULED",
      notes: notes ? notes.trim() : "",
    });

    const populated = await WorkshopSchedule.findById(schedule._id)
      .populate("customer", "fullName companyName phone")
      .populate("vehicle", "make model registration vehicleType status");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating schedule:", error);
    res.status(500).json({ message: "Server error creating schedule" });
  }
};

// @desc    Update schedule
// @route   PATCH /api/workshop/schedule/:id
export const updateWorkshopSchedule = async (req, res) => {
  try {
    const owner = req.user._id;
    const schedule = await WorkshopSchedule.findOne({ _id: req.params.id, owner });
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const {
      type,
      serviceOrInspectionType,
      scheduledDate,
      assignedWorkshop,
      assignedPerson,
      reminderToggle,
      status,
      notes,
    } = req.body;

    if (type) schedule.type = type;
    if (serviceOrInspectionType) schedule.serviceOrInspectionType = serviceOrInspectionType;
    if (scheduledDate) schedule.scheduledDate = new Date(scheduledDate);
    if (assignedWorkshop !== undefined) schedule.assignedWorkshop = assignedWorkshop.trim();
    if (assignedPerson !== undefined) schedule.assignedPerson = assignedPerson.trim();
    if (reminderToggle !== undefined) schedule.reminderToggle = reminderToggle;
    if (status) schedule.status = status;
    if (notes !== undefined) schedule.notes = notes.trim();

    await schedule.save();

    const updated = await WorkshopSchedule.findById(schedule._id)
      .populate("customer", "fullName companyName phone")
      .populate("vehicle", "make model registration vehicleType status");

    res.json(updated);
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({ message: "Server error updating schedule" });
  }
};

// @desc    Delete schedule
// @route   DELETE /api/workshop/schedule/:id
export const deleteWorkshopSchedule = async (req, res) => {
  try {
    const owner = req.user._id;
    const schedule = await WorkshopSchedule.findOne({ _id: req.params.id, owner });
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    await WorkshopSchedule.deleteOne({ _id: schedule._id });
    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({ message: "Server error deleting schedule" });
  }
};
