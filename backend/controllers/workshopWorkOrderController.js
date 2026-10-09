import WorkshopWorkOrder from "../models/WorkshopWorkOrder.js";
import WorkshopVehicle from "../models/WorkshopVehicle.js";
import WorkshopCustomer from "../models/WorkshopCustomer.js";
import WorkshopInspection from "../models/WorkshopInspection.js";
import WorkshopService from "../models/WorkshopService.js";
import WorkshopInvoice from "../models/WorkshopInvoice.js";
import WorkshopNote from "../models/WorkshopNote.js";
import User from "../models/User.js";

// Helper to generate next unique Job Number
const generateJobNumber = async (owner) => {
  const count = await WorkshopWorkOrder.countDocuments({ owner });
  const year = new Date().getFullYear();
  return `WO-${year}-${String(count + 1).padStart(4, "0")}`;
};

// @desc    Get all workshop work orders (manager)
// @route   GET /api/workshop/work-orders
export const getWorkshopWorkOrders = async (req, res) => {
  try {
    const owner = req.user.role === "workshop_employee" ? req.user.workshopManager : req.user._id;
    const { status, priority, jobType, vehicleId, customerId, assignedTo, search } = req.query;

    let query = { owner };
    if (status && status !== "ALL") query.status = status;
    if (priority && priority !== "ALL") query.priority = priority;
    if (jobType && jobType !== "ALL") query.jobType = jobType;
    if (vehicleId) query.vehicle = vehicleId;
    if (customerId) query.customer = customerId;
    if (assignedTo) query.assignedTo = assignedTo;

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
      .populate("assignedTo", "name email designation phone")
      .sort({ createdAt: -1 })
      .lean();

    res.json(workOrders);
  } catch (error) {
    console.error("Error fetching work orders:", error);
    res.status(500).json({ message: "Server error fetching work orders" });
  }
};

// @desc    Get assigned jobs for logged-in workshop employee
// @route   GET /api/workshop/my-jobs
// @access  Private (workshop_employee)
export const getMyAssignedJobs = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const { status, priority } = req.query;

    let query = { assignedTo: employeeId };
    if (status && status !== "ALL") {
      query.status = status;
    }
    if (priority && priority !== "ALL") {
      query.priority = priority;
    }

    const jobs = await WorkshopWorkOrder.find(query)
      .populate("customer", "fullName companyName phone email")
      .populate("vehicle", "make model registration vehicleType status odometer vin photo")
      .sort({ updatedAt: -1 })
      .lean();

    // Summary counts for employee tabs
    const assignedCount = await WorkshopWorkOrder.countDocuments({
      assignedTo: employeeId,
      status: { $in: ["OPEN", "INSPECTION_PENDING"] },
    });
    const inProgressCount = await WorkshopWorkOrder.countDocuments({
      assignedTo: employeeId,
      status: "IN_PROGRESS",
    });
    const waitingPartsCount = await WorkshopWorkOrder.countDocuments({
      assignedTo: employeeId,
      status: "WAITING_FOR_PARTS",
    });
    const completedCount = await WorkshopWorkOrder.countDocuments({
      assignedTo: employeeId,
      status: "COMPLETED",
    });

    return res.status(200).json({
      jobs,
      counts: {
        all: jobs.length,
        assigned: assignedCount,
        inProgress: inProgressCount,
        waitingParts: waitingPartsCount,
        completed: completedCount,
      },
    });
  } catch (error) {
    console.error("Error fetching employee assigned jobs:", error);
    return res.status(500).json({ message: "Server error fetching assigned jobs" });
  }
};

// @desc    Get single work order by ID with linked inspections, services, invoices, notes
// @route   GET /api/workshop/work-orders/:id
export const getWorkshopWorkOrderById = async (req, res) => {
  try {
    const isEmployee = req.user.role === "workshop_employee";
    const ownerId = isEmployee ? req.user.workshopManager : req.user._id;

    let query = { _id: req.params.id };
    if (isEmployee) {
      // Employee must be assigned to this job or work for the workshop manager
      query.$or = [{ assignedTo: req.user._id }, { owner: ownerId }];
    } else {
      query.owner = ownerId;
    }

    const workOrder = await WorkshopWorkOrder.findOne(query)
      .populate("customer", "fullName companyName phone email address")
      .populate("vehicle", "make model registration vehicleType status odometer vin photo")
      .populate("assignedTo", "name email designation phone specialization");

    if (!workOrder) {
      return res.status(404).json({ message: "Work order not found" });
    }

    const owner = workOrder.owner;
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
    const isEmployee = req.user.role === "workshop_employee";
    const owner = isEmployee ? req.user.workshopManager : req.user._id;
    const {
      customerId,
      vehicleId,
      jobType,
      description,
      dateReceived,
      expectedCompletionDate,
      assignedMechanic,
      assignedTo,
      priority,
      status,
      notes,
      odometer,
      intakeDetails,
    } = req.body;

    if (!vehicleId) {
      return res.status(400).json({ message: "Vehicle is required to create a Work Order" });
    }

    const vehicle = await WorkshopVehicle.findOne({ _id: vehicleId, owner });
    if (!vehicle) return res.status(400).json({ message: "Invalid vehicle selected" });

    let resolvedCustomerId = customerId || vehicle.customer;
    const customer = await WorkshopCustomer.findOne({ _id: resolvedCustomerId, owner });
    if (!customer) return res.status(400).json({ message: "Invalid customer selected" });

    const jobNumber = await generateJobNumber(owner);
    const initialStatus = status || (isEmployee ? "IN_PROGRESS" : "OPEN");

    let mechanicName = assignedMechanic ? assignedMechanic.trim() : "";
    let assignedUserId = assignedTo || (isEmployee ? req.user._id : null);

    if (assignedUserId) {
      const emp = await User.findById(assignedUserId);
      if (emp) {
        mechanicName = emp.name;
      }
    } else if (isEmployee) {
      mechanicName = req.user.name;
    }

    const workOrder = await WorkshopWorkOrder.create({
      owner,
      customer: customer._id,
      vehicle: vehicle._id,
      jobNumber,
      jobType: jobType || "Basic Service",
      description: description ? description.trim() : "",
      dateReceived: dateReceived ? new Date(dateReceived) : new Date(),
      expectedCompletionDate: expectedCompletionDate ? new Date(expectedCompletionDate) : undefined,
      assignedMechanic: mechanicName,
      assignedTo: assignedUserId,
      priority: priority || (intakeDetails?.vehicleOffRoad ? "Critical" : "Normal"),
      status: initialStatus,
      notes: notes ? notes.trim() : "",
      intakeDetails: intakeDetails
        ? {
            workTypes: Array.isArray(intakeDetails.workTypes) ? intakeDetails.workTypes : [],
            customerComplaint: intakeDetails.customerComplaint || "",
            workRequired: intakeDetails.workRequired || "",
            faultCodes: intakeDetails.faultCodes || "",
            additionalNotes: intakeDetails.additionalNotes || "",
            vehicleOffRoad: !!intakeDetails.vehicleOffRoad,
            intakePhotos: Array.isArray(intakeDetails.intakePhotos) ? intakeDetails.intakePhotos : [],
            createdByName: req.user.name,
            intakeDate: new Date(),
          }
        : undefined,
    });

    // Automatically update vehicle status if in workshop and odometer if provided
    vehicle.status = "IN_WORKSHOP";
    if (odometer && !isNaN(Number(odometer)) && Number(odometer) > 0) {
      vehicle.odometer = Number(odometer);
    }
    await vehicle.save();

    const populated = await WorkshopWorkOrder.findById(workOrder._id)
      .populate("customer", "fullName companyName phone")
      .populate("vehicle", "make model registration vehicleType status odometer")
      .populate("assignedTo", "name email designation phone");

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
    const isEmployee = req.user.role === "workshop_employee";
    const ownerId = isEmployee ? req.user.workshopManager : req.user._id;

    let query = { _id: req.params.id };
    if (isEmployee) {
      query.assignedTo = req.user._id;
    } else {
      query.owner = ownerId;
    }

    const workOrder = await WorkshopWorkOrder.findOne(query);
    if (!workOrder) {
      return res.status(404).json({ message: "Work order not found or unauthorized" });
    }

    const {
      jobType,
      description,
      dateReceived,
      expectedCompletionDate,
      assignedMechanic,
      assignedTo,
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

    if (assignedTo !== undefined) {
      workOrder.assignedTo = assignedTo || null;
      if (assignedTo) {
        const emp = await User.findById(assignedTo);
        if (emp) workOrder.assignedMechanic = emp.name;
      } else {
        workOrder.assignedMechanic = "";
      }
    } else if (assignedMechanic !== undefined) {
      workOrder.assignedMechanic = assignedMechanic.trim();
    }

    if (priority) workOrder.priority = priority;
    if (notes !== undefined) workOrder.notes = notes.trim();

    // Handle status lifecycle transitions
    if (status && status !== workOrder.status) {
      workOrder.status = status;

      const vehicle = await WorkshopVehicle.findOne({ _id: workOrder.vehicle });
      if (vehicle) {
        if (status === "READY_FOR_COLLECTION") {
          vehicle.status = "READY_FOR_COLLECTION";
          await vehicle.save();
        } else if (status === "COMPLETED") {
          workOrder.actualCompletionDate = new Date();
          const otherOpenJobs = await WorkshopWorkOrder.countDocuments({
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
      .populate("vehicle", "make model registration vehicleType status")
      .populate("assignedTo", "name email designation phone");

    res.json(updated);
  } catch (error) {
    console.error("Error updating work order:", error);
    res.status(500).json({ message: "Server error updating work order" });
  }
};

// @desc    Submit / Save digital checklist for a work order
// @route   POST /api/workshop/work-orders/:id/checklist
// @access  Private (workshop_employee, workshop_manager)
export const submitJobChecklist = async (req, res) => {
  try {
    const isEmployee = req.user.role === "workshop_employee";
    const query = isEmployee
      ? {
          _id: req.params.id,
          $or: [
            { assignedTo: req.user._id },
            { owner: req.user.workshopManager },
          ],
        }
      : { _id: req.params.id, owner: req.user._id };

    const workOrder = await WorkshopWorkOrder.findOne(query);
    if (!workOrder) {
      return res.status(404).json({ message: "Work order not found" });
    }

    const {
      checklistType,
      items,
      axleMeasurements,
      tyreTreadMeasurements,
      serviceRecord,
      overallOutcome,
      safetyCriticalDefects,
      repairsRecommended,
      immediateActionRequired,
      inspectorComments,
      inspectorName,
      inspectorSignature,
      customerAcknowledgement,
      isCompleted,
    } = req.body;

    workOrder.checklist = {
      checklistType: checklistType || workOrder.checklist?.checklistType || "BASIC_INSPECTION",
      items: Array.isArray(items)
        ? items.map((it, idx) => ({
            id: it.id || it._id || `item_${idx}_${Date.now()}`,
            title: it.title || it.label || `Check Item #${idx + 1}`,
            label: it.label || it.title || `Check Item #${idx + 1}`,
            category: it.category || "General",
            status: it.status || "PASS",
            severity: it.severity || "Minor",
            measurement: it.measurement || "",
            measurementUnit: it.measurementUnit || "",
            defectDescription: it.defectDescription || "",
            recommendedRepair: it.recommendedRepair || "",
            repairPriority: it.repairPriority || "Normal",
            notes: it.notes || it.observation || "",
            observation: it.observation || it.notes || "",
            photos: Array.isArray(it.photos) ? it.photos : [],
          }))
        : workOrder.checklist?.items || [],
      axleMeasurements: Array.isArray(axleMeasurements)
        ? axleMeasurements
        : workOrder.checklist?.axleMeasurements || [],
      tyreTreadMeasurements: (tyreTreadMeasurements && typeof tyreTreadMeasurements === "object")
        ? tyreTreadMeasurements
        : (workOrder.checklist?.tyreTreadMeasurements || {}),
      serviceRecord: (serviceRecord && typeof serviceRecord === "object")
        ? serviceRecord
        : (workOrder.checklist?.serviceRecord || {}),
      overallOutcome: overallOutcome || workOrder.checklist?.overallOutcome || "Pass",
      safetyCriticalDefects: safetyCriticalDefects || workOrder.checklist?.safetyCriticalDefects || "",
      repairsRecommended: repairsRecommended || workOrder.checklist?.repairsRecommended || "",
      immediateActionRequired: immediateActionRequired || workOrder.checklist?.immediateActionRequired || "",
      inspectorComments: inspectorComments || workOrder.checklist?.inspectorComments || "",
      inspectorName: inspectorName || workOrder.checklist?.inspectorName || (isEmployee ? req.user.name : ""),
      inspectorSignature: inspectorSignature || workOrder.checklist?.inspectorSignature || "",
      customerAcknowledgement: (customerAcknowledgement && typeof customerAcknowledgement === "object")
        ? customerAcknowledgement
        : (workOrder.checklist?.customerAcknowledgement || {}),
      completedAt: isCompleted ? new Date() : workOrder.checklist?.completedAt,
      completedBy: isCompleted ? req.user._id : workOrder.checklist?.completedBy,
    };

    // If next service km is provided in service record, update vehicle
    if (serviceRecord?.nextServiceDueKm && !isNaN(Number(serviceRecord.nextServiceDueKm))) {
      const vehicle = await WorkshopVehicle.findById(workOrder.vehicle);
      if (vehicle) {
        vehicle.nextServiceDueKm = Number(serviceRecord.nextServiceDueKm);
        if (serviceRecord.nextServiceDueDate) {
          vehicle.nextServiceDueDate = new Date(serviceRecord.nextServiceDueDate);
        }
        await vehicle.save();
      }
    }

    await workOrder.save();
    return res.status(200).json({ message: "Checklist saved successfully", checklist: workOrder.checklist });
  } catch (error) {
    console.error("Error saving checklist:", error);
    return res.status(500).json({ message: "Server error saving checklist" });
  }
};

// @desc    Upload / Add photo evidence to a work order (before/during/after)
// @route   POST /api/workshop/work-orders/:id/photos
// @access  Private (workshop_employee, workshop_manager)
export const uploadJobPhotos = async (req, res) => {
  try {
    const isEmployee = req.user.role === "workshop_employee";
    const query = isEmployee
      ? { _id: req.params.id, assignedTo: req.user._id }
      : { _id: req.params.id, owner: req.user._id };

    const workOrder = await WorkshopWorkOrder.findOne(query);
    if (!workOrder) {
      return res.status(404).json({ message: "Work order not found" });
    }

    const { type, url, caption } = req.body; // type: "before" | "during" | "after"
    if (!type || !["before", "during", "after"].includes(type) || !url) {
      return res.status(400).json({ message: "Valid type (before/during/after) and url are required" });
    }

    if (!workOrder.photos) {
      workOrder.photos = { before: [], during: [], after: [] };
    }

    workOrder.photos[type].push({
      url,
      caption: caption || "",
      uploadedAt: new Date(),
    });

    await workOrder.save();
    return res.status(200).json({ message: "Photo added successfully", photos: workOrder.photos });
  } catch (error) {
    console.error("Error saving photo evidence:", error);
    return res.status(500).json({ message: "Server error saving photo evidence" });
  }
};

// @desc    Add work note to a work order
// @route   POST /api/workshop/work-orders/:id/notes
// @access  Private (workshop_employee, workshop_manager)
export const addJobWorkNote = async (req, res) => {
  try {
    const isEmployee = req.user.role === "workshop_employee";
    const query = isEmployee
      ? { _id: req.params.id, assignedTo: req.user._id }
      : { _id: req.params.id, owner: req.user._id };

    const workOrder = await WorkshopWorkOrder.findOne(query);
    if (!workOrder) {
      return res.status(404).json({ message: "Work order not found" });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Note text is required" });
    }

    workOrder.workNotes.push({
      author: req.user._id,
      authorName: req.user.name,
      text: text.trim(),
      createdAt: new Date(),
    });

    await workOrder.save();
    return res.status(200).json({ message: "Note added successfully", workNotes: workOrder.workNotes });
  } catch (error) {
    console.error("Error adding work note:", error);
    return res.status(500).json({ message: "Server error adding work note" });
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
