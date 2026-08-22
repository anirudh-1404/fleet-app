import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";

export const getDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: "driver" }).select("-password");
    // Attach assigned vehicle info to each driver
    const driversWithVehicles = await Promise.all(
      drivers.map(async (driver) => {
        const vehicle = await Vehicle.findOne({ assignedDriver: driver._id }).select(
          "registration fleetNumber vehicleType make model"
        );
        return {
          ...driver.toObject(),
          assignedVehicle: vehicle || null,
        };
      })
    );

    return res.json(driversWithVehicles);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching drivers" });
  }
};

export const getDriverById = async (req, res) => {
  try {
    const driver = await User.findOne({ _id: req.params.id, role: "driver" }).select("-password");
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    const vehicle = await Vehicle.findOne({ assignedDriver: driver._id });
    return res.json({
      ...driver.toObject(),
      assignedVehicle: vehicle || null,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching driver" });
  }
};

export const createDriver = async (req, res) => {
  try {
    const { name, email, password, phone, status } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const driver = await User.create({
      name,
      email,
      password,
      role: "driver",
      phone: phone || "",
      status: status || "Active",
    });

    const safeDriver = await User.findById(driver._id).select("-password");
    return res.status(201).json(safeDriver);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error creating driver" });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const { password, ...updateFields } = req.body;
    const driver = await User.findOne({ _id: req.params.id, role: "driver" });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    Object.assign(driver, updateFields);
    if (password) {
      driver.password = password; // Will be hashed by pre-save hook
    }

    await driver.save();
    const safeDriver = await User.findById(driver._id).select("-password");
    return res.json(safeDriver);
  } catch (error) {
    return res.status(500).json({ message: "Server error updating driver" });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    const driver = await User.findOneAndDelete({ _id: req.params.id, role: "driver" });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Unassign driver from any assigned vehicle
    await Vehicle.updateMany({ assignedDriver: req.params.id }, { assignedDriver: null });

    return res.json({ message: "Driver deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error deleting driver" });
  }
};
