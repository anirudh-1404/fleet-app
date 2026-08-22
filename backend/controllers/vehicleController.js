import Vehicle from "../models/Vehicle.js";
import User from "../models/User.js";

export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate("assignedDriver", "name email phone photo");
    return res.json(vehicles);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching vehicles" });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate("assignedDriver", "name email phone photo");
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    return res.json(vehicle);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching vehicle" });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const { registration } = req.body;
    const existing = await Vehicle.findOne({ registration: registration.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "Vehicle registration already exists" });
    }

    const vehicle = await Vehicle.create(req.body);
    return res.status(201).json(vehicle);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error creating vehicle" });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignedDriver", "name email phone photo");

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    return res.json(vehicle);
  } catch (error) {
    return res.status(500).json({ message: "Server error updating vehicle" });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    return res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error deleting vehicle" });
  }
};

export const assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (driverId) {
      const driver = await User.findById(driverId);
      if (!driver || driver.role !== "driver") {
        return res.status(400).json({ message: "Invalid driver ID" });
      }

      // Unassign driver from any previous vehicle to keep 1-to-1 relationship
      await Vehicle.updateMany({ assignedDriver: driverId }, { assignedDriver: null });

      vehicle.assignedDriver = driverId;
    } else {
      vehicle.assignedDriver = null;
    }

    await vehicle.save();
    const updated = await Vehicle.findById(vehicle._id).populate("assignedDriver", "name email phone photo");

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Server error assigning driver" });
  }
};

export const getMyVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ assignedDriver: req.user._id }).populate(
      "assignedDriver",
      "name email phone photo"
    );

    if (!vehicle) {
      // Fallback: return default first active vehicle if unassigned for demo smooth fallback
      const fallback = await Vehicle.findOne({ status: "Active" });
      return res.json(fallback || null);
    }
    return res.json(vehicle);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching assigned vehicle" });
  }
};
