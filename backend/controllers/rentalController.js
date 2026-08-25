import Rental from "../models/Rental.js";
import RentalVehicle from "../models/RentalVehicle.js";
import Customer from "../models/Customer.js";

// Helper function to get current YYYY-MM-DD date in local/server time
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to update overdue status dynamically
const checkAndMarkOverdue = async (rentals) => {
  const today = getTodayDateString();
  const updatedRentals = [];

  for (const rental of rentals) {
    if (rental.status === "ACTIVE" && rental.returnDate < today) {
      rental.status = "OVERDUE";
      await Rental.updateOne({ _id: rental._id }, { status: "OVERDUE" });
    }
    updatedRentals.push(rental);
  }
  return updatedRentals;
};

// @desc    Get all rentals for owner with optional filtering & search
// @route   GET /api/rental/rentals
export const getRentals = async (req, res) => {
  try {
    const { status, search } = req.query;
    const today = getTodayDateString();
    const query = { owner: req.user._id };

    if (status && status !== "ALL") {
      if (status === "RETURNING_TODAY") {
        query.status = { $in: ["ACTIVE", "OVERDUE"] };
        query.returnDate = today;
      } else {
        query.status = status;
      }
    }

    let rentals = await Rental.find(query)
      .populate("vehicle", "make model year registration vehicleType dailyRate photo status")
      .populate("customer", "fullName phone email licenceNumber")
      .sort({ createdAt: -1 });

    // Mark any active rentals past return date as OVERDUE
    rentals = await checkAndMarkOverdue(rentals);

    // Apply search filter if provided
    if (search) {
      const searchLower = search.trim().toLowerCase();
      rentals = rentals.filter((r) => {
        const custName = r.customer?.fullName?.toLowerCase() || "";
        const custPhone = r.customer?.phone?.toLowerCase() || "";
        const vehReg = r.vehicle?.registration?.toLowerCase() || "";
        const vehMake = r.vehicle?.make?.toLowerCase() || "";
        const vehModel = r.vehicle?.model?.toLowerCase() || "";

        return (
          custName.includes(searchLower) ||
          custPhone.includes(searchLower) ||
          vehReg.includes(searchLower) ||
          vehMake.includes(searchLower) ||
          vehModel.includes(searchLower)
        );
      });
    }

    return res.status(200).json(rentals);
  } catch (error) {
    console.error("Error fetching rentals:", error);
    return res.status(500).json({ message: "Failed to fetch rentals", error: error.message });
  }
};

// @desc    Get single rental details by ID
// @route   GET /api/rental/rentals/:id
export const getRentalById = async (req, res) => {
  try {
    let rental = await Rental.findOne({
      _id: req.params.id,
      owner: req.user._id,
    })
      .populate("vehicle")
      .populate("customer");

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    const today = getTodayDateString();
    if (rental.status === "ACTIVE" && rental.returnDate < today) {
      rental.status = "OVERDUE";
      await Rental.updateOne({ _id: rental._id }, { status: "OVERDUE" });
    }

    return res.status(200).json(rental);
  } catch (error) {
    console.error("Error fetching rental details:", error);
    return res.status(500).json({ message: "Failed to fetch rental details", error: error.message });
  }
};

// @desc    Create a new Rental booking
// @route   POST /api/rental/rentals
export const createRental = async (req, res) => {
  try {
    const {
      vehicleId,
      customerId,
      customerDetails,
      startDate,
      startTime,
      durationDays,
      returnDate,
      returnTime,
      dailyRate,
      securityDeposit,
      paymentStatus,
      notes,
    } = req.body;

    if (!vehicleId || !startDate || !returnDate || !durationDays) {
      return res.status(400).json({
        message: "Missing required fields: vehicleId, startDate, returnDate, durationDays",
      });
    }

    // 1. Fetch Vehicle and verify ownership
    const vehicle = await RentalVehicle.findOne({
      _id: vehicleId,
      owner: req.user._id,
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (vehicle.status === "MAINTENANCE" || vehicle.status === "INACTIVE") {
      return res.status(400).json({
        message: `This vehicle is currently ${vehicle.status.toLowerCase()} and cannot be rented.`,
      });
    }

    // 2. Strict Overlap Check: Check for existing overlapping UPCOMING, ACTIVE, or OVERDUE rentals
    const overlapping = await Rental.findOne({
      vehicle: vehicle._id,
      status: { $in: ["UPCOMING", "ACTIVE", "OVERDUE"] },
      startDate: { $lte: returnDate },
      returnDate: { $gte: startDate },
    });

    if (overlapping) {
      return res.status(400).json({
        message: "This vehicle is already booked for the selected dates.",
      });
    }

    // 3. Resolve Customer (Reusable customer architecture)
    let finalCustomer = null;

    if (customerId) {
      finalCustomer = await Customer.findOne({ _id: customerId, owner: req.user._id });
    }

    if (!finalCustomer && customerDetails) {
      const {
        fullName,
        phone,
        email,
        address,
        licenceNumber,
        licenceClass,
        licenceExpiry,
        idNumber,
        emergencyContact,
        customerNotes,
      } = customerDetails;

      if (!fullName || !phone || !licenceNumber) {
        return res.status(400).json({
          message: "Please provide customer full name, phone number, and licence number",
        });
      }

      // Check if customer already exists by phone or licence
      finalCustomer = await Customer.findOne({
        owner: req.user._id,
        $or: [
          { phone: phone.trim() },
          { licenceNumber: licenceNumber.toUpperCase().trim() },
        ],
      });

      if (finalCustomer) {
        // Update contact details with latest provided
        if (fullName) finalCustomer.fullName = fullName.trim();
        if (email) finalCustomer.email = email.toLowerCase().trim();
        if (address) finalCustomer.address = address.trim();
        if (licenceClass) finalCustomer.licenceClass = licenceClass.trim();
        if (licenceExpiry) finalCustomer.licenceExpiry = licenceExpiry;
        if (idNumber) finalCustomer.idNumber = idNumber.trim();
        if (emergencyContact) finalCustomer.emergencyContact = emergencyContact.trim();
        if (customerNotes) finalCustomer.notes = customerNotes.trim();
        await finalCustomer.save();
      } else {
        finalCustomer = await Customer.create({
          owner: req.user._id,
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email ? email.toLowerCase().trim() : "",
          address: address ? address.trim() : "",
          licenceNumber: licenceNumber.toUpperCase().trim(),
          licenceClass: licenceClass ? licenceClass.trim() : "",
          licenceExpiry: licenceExpiry || "",
          idNumber: idNumber ? idNumber.trim() : "",
          emergencyContact: emergencyContact ? emergencyContact.trim() : "",
          notes: customerNotes ? customerNotes.trim() : "",
        });
      }
    }

    if (!finalCustomer) {
      return res.status(400).json({ message: "Valid customer information is required" });
    }

    // 4. Calculate amounts
    const rate = dailyRate !== undefined ? Number(dailyRate) : vehicle.dailyRate;
    const days = Number(durationDays);
    const rentalAmount = rate * days;
    const deposit = securityDeposit !== undefined ? Number(securityDeposit) : vehicle.securityDeposit;
    const totalAmount = rentalAmount + deposit;

    const today = getTodayDateString();
    let initialStatus = "ACTIVE";
    if (startDate > today) {
      initialStatus = "UPCOMING";
    }

    // 5. Create Rental record
    const rental = await Rental.create({
      owner: req.user._id,
      vehicle: vehicle._id,
      customer: finalCustomer._id,
      startDate,
      startTime: startTime || "09:00",
      durationDays: days,
      returnDate,
      returnTime: returnTime || "17:00",
      dailyRate: rate,
      rentalAmount,
      securityDeposit: deposit,
      totalAmount,
      paymentStatus: paymentStatus || "Pending",
      status: initialStatus,
      notes: notes ? notes.trim() : "",
    });

    // 6. Update Vehicle Status if rental starts today or earlier
    if (initialStatus === "ACTIVE") {
      vehicle.status = "RENTED";
      await vehicle.save();
    }

    const populatedRental = await Rental.findById(rental._id)
      .populate("vehicle")
      .populate("customer");

    return res.status(201).json(populatedRental);
  } catch (error) {
    console.error("Error creating rental:", error);
    return res.status(500).json({ message: "Failed to create rental", error: error.message });
  }
};

// @desc    Return vehicle / Complete rental
// @route   POST /api/rental/rentals/:id/return
export const returnRental = async (req, res) => {
  try {
    const {
      actualReturnDate,
      actualReturnTime,
      returnOdometer,
      returnFuelLevel,
      damageNotes,
      additionalCharges,
      finalAmount,
      returnNotes,
      paymentStatus,
    } = req.body;

    const rental = await Rental.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    if (rental.status === "RETURNED") {
      return res.status(400).json({ message: "Rental has already been marked as returned" });
    }

    const today = getTodayDateString();
    const nowTime = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });

    rental.status = "RETURNED";
    rental.actualReturnDate = actualReturnDate || today;
    rental.actualReturnTime = actualReturnTime || nowTime;
    if (returnOdometer !== undefined && returnOdometer !== "") {
      rental.returnOdometer = Number(returnOdometer);
    }
    if (returnFuelLevel) rental.returnFuelLevel = returnFuelLevel;
    if (damageNotes) rental.damageNotes = damageNotes.trim();
    if (additionalCharges !== undefined && additionalCharges !== "") {
      rental.additionalCharges = Number(additionalCharges);
    }
    if (finalAmount !== undefined && finalAmount !== "") {
      rental.finalAmount = Number(finalAmount);
    } else {
      rental.finalAmount = rental.totalAmount + (rental.additionalCharges || 0);
    }
    if (returnNotes) rental.returnNotes = returnNotes.trim();
    if (paymentStatus) rental.paymentStatus = paymentStatus;

    await rental.save();

    // Check if there is another ACTIVE rental for this vehicle right now
    const vehicle = await RentalVehicle.findById(rental.vehicle);
    if (vehicle) {
      const otherActiveRental = await Rental.findOne({
        vehicle: vehicle._id,
        _id: { $ne: rental._id },
        status: { $in: ["ACTIVE", "OVERDUE"] },
      });

      if (!otherActiveRental) {
        vehicle.status = "AVAILABLE";
        await vehicle.save();
      }
    }

    const populatedRental = await Rental.findById(rental._id)
      .populate("vehicle")
      .populate("customer");

    return res.status(200).json(populatedRental);
  } catch (error) {
    console.error("Error completing vehicle return:", error);
    return res.status(500).json({ message: "Failed to complete return", error: error.message });
  }
};

// @desc    Cancel an upcoming or active rental
// @route   POST /api/rental/rentals/:id/cancel
export const cancelRental = async (req, res) => {
  try {
    const rental = await Rental.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    if (rental.status === "RETURNED" || rental.status === "CANCELLED") {
      return res.status(400).json({ message: `Cannot cancel a ${rental.status.toLowerCase()} rental` });
    }

    rental.status = "CANCELLED";
    await rental.save();

    // Revert vehicle status to AVAILABLE if it was RENTED
    const vehicle = await RentalVehicle.findById(rental.vehicle);
    if (vehicle && vehicle.status === "RENTED") {
      const otherActive = await Rental.findOne({
        vehicle: vehicle._id,
        _id: { $ne: rental._id },
        status: { $in: ["ACTIVE", "OVERDUE"] },
      });

      if (!otherActive) {
        vehicle.status = "AVAILABLE";
        await vehicle.save();
      }
    }

    return res.status(200).json({ message: "Rental cancelled successfully", rental });
  } catch (error) {
    console.error("Error cancelling rental:", error);
    return res.status(500).json({ message: "Failed to cancel rental", error: error.message });
  }
};

// @desc    Update rental general fields
// @route   PATCH /api/rental/rentals/:id
export const updateRental = async (req, res) => {
  try {
    const rental = await Rental.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    const { paymentStatus, notes, dailyRate, durationDays, securityDeposit } = req.body;

    if (paymentStatus) rental.paymentStatus = paymentStatus;
    if (notes !== undefined) rental.notes = notes.trim();
    if (dailyRate !== undefined) rental.dailyRate = Number(dailyRate);
    if (durationDays !== undefined) rental.durationDays = Number(durationDays);
    if (securityDeposit !== undefined) rental.securityDeposit = Number(securityDeposit);

    if (dailyRate !== undefined || durationDays !== undefined || securityDeposit !== undefined) {
      rental.rentalAmount = rental.dailyRate * rental.durationDays;
      rental.totalAmount = rental.rentalAmount + rental.securityDeposit;
    }

    await rental.save();

    const populated = await Rental.findById(rental._id)
      .populate("vehicle")
      .populate("customer");

    return res.status(200).json(populated);
  } catch (error) {
    console.error("Error updating rental:", error);
    return res.status(500).json({ message: "Failed to update rental", error: error.message });
  }
};
