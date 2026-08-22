import Inspection from "../models/Inspection.js";
import Vehicle from "../models/Vehicle.js";

// Helper to get formatted today string (YYYY-MM-DD)
export const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const createInspection = async (req, res) => {
  try {
    const { vehicleId, date, odometer, sections, vehicleRegistration, fleetNumber, trailerNumber } = req.body;
    const driverId = req.user._id;
    const inspectionDate = date || getTodayDateString();

    let vehicle = null;
    if (vehicleId) {
      vehicle = await Vehicle.findById(vehicleId);
    }
    if (!vehicle) {
      vehicle = await Vehicle.findOne({ assignedDriver: driverId }) || await Vehicle.findOne({ status: "Active" });
    }

    if (!vehicle) {
      return res.status(400).json({ message: "No vehicle found for inspection" });
    }

    // Check if driver has an active journey in progress
    const activeJourney = await Journey.findOne({
      driver: driverId,
      status: "started",
    });

    if (activeJourney) {
      return res.status(400).json({
        message: "You have an active journey in progress. Complete your active journey before starting a new inspection.",
      });
    }

    // Step 13: Calculate passCount, failCount, naCount, notesCount on backend
    let passCount = 0;
    let failCount = 0;
    let naCount = 0;
    let notesCount = 0;

    if (Array.isArray(sections)) {
      sections.forEach((sec) => {
        if (Array.isArray(sec.items)) {
          sec.items.forEach((item) => {
            if (item.status === "PASS") passCount++;
            else if (item.status === "FAIL") failCount++;
            else if (item.status === "N/A") naCount++;

            if (item.status === "NOTE" || (item.note && item.note.trim() !== "")) {
              notesCount++;
            }
          });
        }
      });
    }

    const overallStatus = failCount > 0 ? "Failed" : "Completed";

    const inspection = await Inspection.create({
      driver: driverId,
      vehicle: vehicle._id,
      date: inspectionDate,
      vehicleRegistration: vehicleRegistration || vehicle.registration,
      fleetNumber: fleetNumber || vehicle.fleetNumber,
      trailerNumber: trailerNumber || "TR-11",
      odometer: odometer || "245860",
      sections: sections || [],
      passCount,
      failCount,
      naCount,
      notesCount,
      overallStatus,
      submittedAt: new Date(),
    });

    // Auto-assign vehicle to this driver on inspection submission & update status
    vehicle.assignedDriver = driverId;
    if (overallStatus === "Failed") {
      vehicle.status = "In Inspection";
    } else {
      vehicle.status = "Active";
    }
    await vehicle.save();

    const populated = await Inspection.findById(inspection._id)
      .populate("driver", "name email phone photo")
      .populate("vehicle", "registration fleetNumber vehicleType make model");

    // Emit Socket.IO event for real-time manager updates
    const io = req.app.get("io");
    if (io) {
      io.emit("inspectionUpdated", populated);
    }

    return res.status(201).json(populated);
  } catch (error) {
    console.error("Create Inspection Error:", error);
    return res.status(500).json({ message: error.message || "Server error submitting inspection" });
  }
};

export const getInspectionById = async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate("driver", "name email phone photo")
      .populate("vehicle", "registration fleetNumber vehicleType make model");

    if (!inspection) {
      return res.status(404).json({ message: "Inspection not found" });
    }
    return res.json(inspection);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching inspection" });
  }
};

export const getTodayInspection = async (req, res) => {
  try {
    const today = getTodayDateString();
    const inspection = await Inspection.findOne({
      driver: req.user._id,
      date: today,
    })
      .populate("driver", "name email phone photo")
      .populate("vehicle", "registration fleetNumber vehicleType make model");

    return res.json(inspection || null);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching today's inspection" });
  }
};

export const getMyInspections = async (req, res) => {
  try {
    const inspections = await Inspection.find({ driver: req.user._id })
      .sort({ date: -1, createdAt: -1 })
      .populate("vehicle", "registration fleetNumber vehicleType");

    return res.json(inspections);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching driver inspections" });
  }
};

export const getManagerInspections = async (req, res) => {
  try {
    const { date, status } = req.query;
    const filter = {};

    if (date) filter.date = date;
    if (status && status !== "All") filter.overallStatus = status;

    const inspections = await Inspection.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .populate("driver", "name email phone photo")
      .populate("vehicle", "registration fleetNumber vehicleType make model");

    return res.json(inspections);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching inspections" });
  }
};
