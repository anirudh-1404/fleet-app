import RentalVehicle from "../models/RentalVehicle.js";
import Rental from "../models/Rental.js";

// @desc    Get all rental vehicles for the logged in owner
// @route   GET /api/rental/vehicles
export const getRentalVehicles = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = { owner: req.user._id };

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { make: searchRegex },
        { model: searchRegex },
        { registration: searchRegex },
        { vehicleType: searchRegex },
      ];
    }

    const vehicles = await RentalVehicle.find(query).sort({ createdAt: -1 });
    return res.status(200).json(vehicles);
  } catch (error) {
    console.error("Error fetching rental vehicles:", error);
    return res.status(500).json({ message: "Failed to fetch rental vehicles", error: error.message });
  }
};

// @desc    Get single rental vehicle by ID + its Rental History
// @route   GET /api/rental/vehicles/:id
export const getRentalVehicleById = async (req, res) => {
  try {
    const vehicle = await RentalVehicle.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Rental vehicle not found" });
    }

    // Fetch rental history for this vehicle
    const rentalHistory = await Rental.find({
      vehicle: vehicle._id,
      owner: req.user._id,
    })
      .populate("customer", "fullName phone email licenceNumber")
      .sort({ startDate: -1 });

    // Identify current active rental if rented
    const currentRental = rentalHistory.find(
      (r) => r.status === "ACTIVE" || r.status === "OVERDUE"
    );

    return res.status(200).json({
      vehicle,
      currentRental: currentRental || null,
      rentalHistory,
    });
  } catch (error) {
    console.error("Error fetching vehicle details:", error);
    return res.status(500).json({ message: "Failed to fetch vehicle details", error: error.message });
  }
};

// @desc    Create a new rental vehicle
// @route   POST /api/rental/vehicles
export const createRentalVehicle = async (req, res) => {
  try {
    const {
      vehicleType,
      make,
      model,
      year,
      registration,
      vin,
      dailyRate,
      securityDeposit,
      status,
      photo,
      notes,
    } = req.body;

    if (!vehicleType || !make || !model || !year || !registration || dailyRate === undefined) {
      return res.status(400).json({
        message: "Please provide vehicle type, make, model, year, registration and daily rate",
      });
    }

    // Check for duplicate registration for this owner
    const existing = await RentalVehicle.findOne({
      owner: req.user._id,
      registration: registration.toUpperCase().trim(),
    });

    if (existing) {
      return res.status(400).json({
        message: "A vehicle with this registration already exists in your rental fleet",
      });
    }

    const vehicle = await RentalVehicle.create({
      owner: req.user._id,
      vehicleType: vehicleType.trim(),
      make: make.trim(),
      model: model.trim(),
      year: Number(year),
      registration: registration.toUpperCase().trim(),
      vin: vin ? vin.trim() : "",
      dailyRate: Number(dailyRate),
      securityDeposit: securityDeposit !== undefined ? Number(securityDeposit) : 0,
      status: status || "AVAILABLE",
      photo: photo || "",
      notes: notes ? notes.trim() : "",
    });

    return res.status(201).json(vehicle);
  } catch (error) {
    console.error("Error creating rental vehicle:", error);
    return res.status(500).json({ message: "Failed to create rental vehicle", error: error.message });
  }
};

// @desc    Update a rental vehicle
// @route   PATCH /api/rental/vehicles/:id
export const updateRentalVehicle = async (req, res) => {
  try {
    const vehicle = await RentalVehicle.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Rental vehicle not found" });
    }

    const updatableFields = [
      "vehicleType",
      "make",
      "model",
      "year",
      "registration",
      "vin",
      "dailyRate",
      "securityDeposit",
      "status",
      "photo",
      "notes",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "registration") {
          vehicle.registration = req.body.registration.toUpperCase().trim();
        } else if (field === "year" || field === "dailyRate" || field === "securityDeposit") {
          vehicle[field] = Number(req.body[field]);
        } else {
          vehicle[field] = req.body[field];
        }
      }
    });

    const updated = await vehicle.save();
    return res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating rental vehicle:", error);
    return res.status(500).json({ message: "Failed to update rental vehicle", error: error.message });
  }
};

// @desc    Delete a rental vehicle
// @route   DELETE /api/rental/vehicles/:id
export const deleteRentalVehicle = async (req, res) => {
  try {
    const vehicle = await RentalVehicle.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Rental vehicle not found" });
    }

    // Check if there are active rentals
    const activeRental = await Rental.findOne({
      vehicle: vehicle._id,
      status: { $in: ["ACTIVE", "UPCOMING", "OVERDUE"] },
    });

    if (activeRental) {
      return res.status(400).json({
        message: "Cannot delete vehicle with active or upcoming rentals. Please return or cancel them first.",
      });
    }

    await RentalVehicle.deleteOne({ _id: vehicle._id });
    return res.status(200).json({ message: "Rental vehicle deleted successfully" });
  } catch (error) {
    console.error("Error deleting rental vehicle:", error);
    return res.status(500).json({ message: "Failed to delete rental vehicle", error: error.message });
  }
};
