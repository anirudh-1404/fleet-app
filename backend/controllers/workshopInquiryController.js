import WorkshopInquiry from "../models/WorkshopInquiry.js";
import User from "../models/User.js";
import WorkshopVehicle from "../models/WorkshopVehicle.js";
import WorkshopCustomer from "../models/WorkshopCustomer.js";
import WorkshopWorkOrder from "../models/WorkshopWorkOrder.js";

// Helper to get effective manager ID
const getManagerId = (user) => {
  if (user.role === "workshop_employee" && user.workshopManager) {
    return user.workshopManager;
  }
  return user._id;
};

// @desc    Get public info for booking form (Workshop Name, Manager Name)
// @route   GET /api/public/bookings/:adminId
// @access  Public
export const getPublicBookingFormInfo = async (req, res) => {
  try {
    const { adminId } = req.params;
    const admin = await User.findById(adminId).select("name email role");

    if (!admin) {
      return res.status(404).json({ message: "Workshop / Manager not found" });
    }

    res.json({
      success: true,
      workshop: {
        adminId: admin._id,
        name: admin.name || "Commercial Workshop",
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Error in getPublicBookingFormInfo:", error);
    res.status(500).json({ message: "Failed to load booking form information" });
  }
};

// @desc    Submit customer booking form
// @route   POST /api/public/bookings/:adminId
// @access  Public
export const submitPublicBooking = async (req, res) => {
  try {
    const { adminId } = req.params;
    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: "Workshop / Manager account does not exist" });
    }

    const {
      customerName,
      companyName,
      mobileNumber,
      email,
      preferredContactMethod,
      customerNotes,
      registration,
      vin,
      make,
      model,
      year,
      odometer,
      vehicleType,
      fuelType,
      bookingTypes,
      mainJobRequest,
      signature,
    } = req.body;

    // Validate required fields
    if (!customerName || !mobileNumber || !email) {
      return res.status(400).json({
        message: "Customer name, mobile number, and email are required.",
      });
    }

    if (!registration || !make || !model || !year || odometer === undefined || odometer === null) {
      return res.status(400).json({
        message: "Vehicle registration, make, model, year, and odometer are required.",
      });
    }

    const newInquiry = await WorkshopInquiry.create({
      workshopManager: admin._id,
      customer: {
        name: customerName.trim(),
        companyName: (companyName || "").trim(),
        mobileNumber: mobileNumber.trim(),
        email: email.trim().toLowerCase(),
        preferredContactMethod: preferredContactMethod || "Phone",
        customerNotes: (customerNotes || "").trim(),
      },
      vehicle: {
        registration: registration.trim().toUpperCase(),
        vin: (vin || "").trim().toUpperCase(),
        make: make.trim(),
        model: model.trim(),
        year: Number(year),
        odometer: Number(odometer),
        vehicleType: vehicleType || "Truck",
        fuelType: fuelType || "Diesel",
      },
      bookingTypes: Array.isArray(bookingTypes) ? bookingTypes : [],
      mainJobRequest: (mainJobRequest || "").trim(),
      signature: signature || "",
      signatureDate: new Date(),
      status: "NEW",
    });

    // Notify connected admin via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.emit(`inquiry_created:${admin._id}`, newInquiry);
    }

    res.status(201).json({
      success: true,
      inquiryId: newInquiry._id,
      message: "Workshop booking inquiry submitted successfully!",
    });
  } catch (error) {
    console.error("Error in submitPublicBooking:", error);
    res.status(500).json({ message: error.message || "Failed to submit booking inquiry" });
  }
};

// @desc    Get all inquiries for the authenticated admin
// @route   GET /api/workshop/inquiries
// @access  Private (Manager / Employee)
export const getAdminInquiries = async (req, res) => {
  try {
    const managerId = getManagerId(req.user);
    const { status, search } = req.query;

    const query = { workshopManager: managerId };

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { "customer.name": searchRegex },
        { "customer.companyName": searchRegex },
        { "customer.mobileNumber": searchRegex },
        { "customer.email": searchRegex },
        { "vehicle.registration": searchRegex },
        { "vehicle.make": searchRegex },
        { "vehicle.model": searchRegex },
      ];
    }

    const inquiries = await WorkshopInquiry.find(query)
      .sort({ createdAt: -1 })
      .populate("convertedWorkOrder", "jobNumber status");

    // Compute stats
    const allInquiries = await WorkshopInquiry.find({ workshopManager: managerId });
    const stats = {
      total: allInquiries.length,
      newCount: allInquiries.filter((i) => i.status === "NEW").length,
      contactedCount: allInquiries.filter((i) => i.status === "CONTACTED").length,
      convertedCount: allInquiries.filter((i) => i.status === "CONVERTED").length,
    };

    res.json({
      success: true,
      inquiries,
      stats,
    });
  } catch (error) {
    console.error("Error in getAdminInquiries:", error);
    res.status(500).json({ message: "Failed to fetch workshop inquiries" });
  }
};

// @desc    Get single inquiry by ID
// @route   GET /api/workshop/inquiries/:id
// @access  Private
export const getAdminInquiryById = async (req, res) => {
  try {
    const managerId = getManagerId(req.user);
    const inquiry = await WorkshopInquiry.findOne({
      _id: req.params.id,
      workshopManager: managerId,
    }).populate("convertedWorkOrder", "jobNumber status priority createdAt");

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    res.json(inquiry);
  } catch (error) {
    console.error("Error in getAdminInquiryById:", error);
    res.status(500).json({ message: "Failed to fetch inquiry details" });
  }
};

// @desc    Update inquiry status & internal notes
// @route   PATCH /api/workshop/inquiries/:id/status
// @access  Private
export const updateInquiryStatus = async (req, res) => {
  try {
    const managerId = getManagerId(req.user);
    const { status, internalNotes } = req.body;

    const inquiry = await WorkshopInquiry.findOne({
      _id: req.params.id,
      workshopManager: managerId,
    });

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    if (status) inquiry.status = status;
    if (internalNotes !== undefined) inquiry.internalNotes = internalNotes;

    await inquiry.save();

    res.json({
      success: true,
      inquiry,
      message: "Inquiry status updated successfully",
    });
  } catch (error) {
    console.error("Error in updateInquiryStatus:", error);
    res.status(500).json({ message: "Failed to update inquiry status" });
  }
};

// @desc    Convert inquiry to Workshop Work Order & register truck
// @route   POST /api/workshop/inquiries/:id/convert
// @access  Private
export const convertInquiryToWorkOrder = async (req, res) => {
  try {
    const managerId = getManagerId(req.user);
    const inquiry = await WorkshopInquiry.findOne({
      _id: req.params.id,
      workshopManager: managerId,
    });

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    // 1. Create or find WorkshopCustomer
    let customerDoc = await WorkshopCustomer.findOne({
      owner: managerId,
      $or: [
        { email: inquiry.customer.email },
        { phone: inquiry.customer.mobileNumber },
      ],
    });

    if (!customerDoc) {
      customerDoc = await WorkshopCustomer.create({
        owner: managerId,
        fullName: inquiry.customer.name,
        companyName: inquiry.customer.companyName || inquiry.customer.name,
        email: inquiry.customer.email,
        phone: inquiry.customer.mobileNumber,
        notes: inquiry.customer.customerNotes || "Created from public booking form",
      });
    }

    // 2. Create or find WorkshopVehicle
    let vehicleDoc = await WorkshopVehicle.findOne({
      owner: managerId,
      registration: inquiry.vehicle.registration,
    });

    if (!vehicleDoc) {
      vehicleDoc = await WorkshopVehicle.create({
        owner: managerId,
        customer: customerDoc._id,
        registration: inquiry.vehicle.registration,
        vin: inquiry.vehicle.vin || "",
        make: inquiry.vehicle.make,
        model: inquiry.vehicle.model,
        year: inquiry.vehicle.year,
        odometer: inquiry.vehicle.odometer,
        vehicleType: inquiry.vehicle.vehicleType || "Truck",
        fuelType: inquiry.vehicle.fuelType || "Diesel",
        status: "IN_WORKSHOP",
      });
    } else {
      // Update odometer
      if (inquiry.vehicle.odometer > vehicleDoc.odometer) {
        vehicleDoc.odometer = inquiry.vehicle.odometer;
      }
      vehicleDoc.status = "IN_WORKSHOP";
      await vehicleDoc.save();
    }

    // 3. Generate unique job number
    const count = await WorkshopWorkOrder.countDocuments({ owner: managerId });
    const year = new Date().getFullYear();
    const jobNumber = `WO-${year}-${String(count + 1).padStart(4, "0")}`;

    // 4. Create Work Order
    const primaryJobType =
      inquiry.bookingTypes && inquiry.bookingTypes.length > 0
        ? inquiry.bookingTypes[0]
        : "General Inspection";

    const description = inquiry.mainJobRequest
      ? `[Customer Request]: ${inquiry.mainJobRequest}`
      : `Booking for ${inquiry.bookingTypes.join(", ") || "Inspection"}`;

    const workOrder = await WorkshopWorkOrder.create({
      owner: managerId,
      jobNumber,
      vehicle: vehicleDoc._id,
      customer: customerDoc._id,
      jobType: primaryJobType,
      priority: "Normal",
      status: "OPEN",
      description,
      odometer: inquiry.vehicle.odometer,
      intakeDetails: {
        workTypes: inquiry.bookingTypes,
        customerComplaint: inquiry.mainJobRequest,
        workRequired: inquiry.bookingTypes.join(", "),
        intakeNotes: `Public booking submitted by ${inquiry.customer.name} (${inquiry.customer.mobileNumber})`,
        createdByName: inquiry.customer.name,
        intakeDate: new Date(),
      },
    });

    // 5. Update inquiry
    inquiry.status = "CONVERTED";
    inquiry.convertedWorkOrder = workOrder._id;
    await inquiry.save();

    res.status(201).json({
      success: true,
      workOrder,
      message: `Inquiry converted to Work Order ${jobNumber} successfully!`,
    });
  } catch (error) {
    console.error("Error in convertInquiryToWorkOrder:", error);
    res.status(500).json({ message: error.message || "Failed to convert inquiry to work order" });
  }
};

// @desc    Delete an inquiry
// @route   DELETE /api/workshop/inquiries/:id
// @access  Private
export const deleteInquiry = async (req, res) => {
  try {
    const managerId = getManagerId(req.user);
    const inquiry = await WorkshopInquiry.findOneAndDelete({
      _id: req.params.id,
      workshopManager: managerId,
    });

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    res.json({ success: true, message: "Inquiry deleted successfully" });
  } catch (error) {
    console.error("Error in deleteInquiry:", error);
    res.status(500).json({ message: "Failed to delete inquiry" });
  }
};
