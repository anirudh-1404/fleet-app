import Fuel from "../models/Fuel.js";
import Vehicle from "../models/Vehicle.js";

export const getFuelLogs = async (req, res) => {
  try {
    const logs = await Fuel.find()
      .sort({ createdAt: -1 })
      .populate("driver", "name email phone photo")
      .populate("vehicle", "registration fleetNumber vehicleType make model photo");
    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching fuel logs" });
  }
};

export const getMyFuelLogs = async (req, res) => {
  try {
    const logs = await Fuel.find({
      $or: [{ driver: req.user._id }, { createdBy: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate("driver", "name email phone photo")
      .populate("vehicle", "registration fleetNumber vehicleType make model photo");
    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching driver fuel logs" });
  }
};

export const getFuelById = async (req, res) => {
  try {
    const log = await Fuel.findById(req.params.id)
      .populate("driver", "name email phone photo")
      .populate("vehicle", "registration fleetNumber vehicleType make model photo");
    if (!log) return res.status(404).json({ message: "Fuel log not found" });
    return res.json(log);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching fuel log" });
  }
};

export const createFuelLog = async (req, res) => {
  try {
    const { vehicleId, date, time, litres, cost, odometer, vendor, notes } = req.body;

    let vehicle = null;
    if (vehicleId) {
      vehicle = await Vehicle.findById(vehicleId);
    }
    if (!vehicle) {
      vehicle = await Vehicle.findOne({ assignedDriver: req.user._id });
    }
    if (!vehicle) {
      vehicle = await Vehicle.findOne({ status: "Active" });
    }

    if (!vehicle) return res.status(400).json({ message: "No active or assigned vehicle found for fuel entry" });

    const numLitres = Number(litres) || 0;
    const numCost = Number(cost) || 0;
    const numOdometer = Number(odometer) || 0;

    const formattedDate = date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    const formattedTime = time || new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const fuelEfficiency = numLitres > 0 ? `${(numLitres / 10).toFixed(1)} L/100km` : "3.2 L/100km";

    const fuelLog = await Fuel.create({
      driver: req.user._id,
      vehicle: vehicle._id,
      date: formattedDate,
      time: formattedTime,
      litres: numLitres,
      cost: numCost,
      odometer: numOdometer,
      fuelEfficiency,
      vendor: vendor || "Shell Fleet",
      notes: notes || "",
      createdBy: req.user._id,
    });

    const populated = await Fuel.findById(fuelLog._id)
      .populate("driver", "name email phone photo")
      .populate("vehicle", "registration fleetNumber vehicleType make model photo");

    // Emit Socket.IO event for real-time manager updates
    const io = req.app.get("io");
    if (io) {
      io.emit("fuelLogUpdated", populated);
    }

    return res.status(201).json(populated);
  } catch (error) {
    console.error("Create Fuel Log Error:", error);
    return res.status(500).json({ message: error.message || "Server error creating fuel log" });
  }
};

export const updateFuelLog = async (req, res) => {
  try {
    const log = await Fuel.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("driver", "name email phone photo")
      .populate("vehicle", "registration fleetNumber vehicleType make model photo");
    if (!log) return res.status(404).json({ message: "Fuel log not found" });
    return res.json(log);
  } catch (error) {
    return res.status(500).json({ message: "Server error updating fuel log" });
  }
};

export const deleteFuelLog = async (req, res) => {
  try {
    const log = await Fuel.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: "Fuel log not found" });
    return res.json({ message: "Fuel log deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error deleting fuel log" });
  }
};
