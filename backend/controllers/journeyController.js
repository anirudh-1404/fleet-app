import Journey from "../models/Journey.js";
import Inspection from "../models/Inspection.js";
import Vehicle from "../models/Vehicle.js";
import { getTodayDateString } from "./inspectionController.js";

export const startJourney = async (req, res) => {
  try {
    const driverId = req.user._id;
    const today = getTodayDateString();

    // Check if driver has completed today's inspection
    const todayInspection = await Inspection.findOne({
      driver: driverId,
      date: today,
    });

    if (!todayInspection) {
      return res.status(400).json({
        message: "Complete today's vehicle inspection before starting your journey.",
      });
    }

    // Check if journey already started
    const existingJourney = await Journey.findOne({
      driver: driverId,
      date: today,
    });

    if (existingJourney) {
      return res.json(existingJourney);
    }

    const initialOdometer = todayInspection.odometer ? Number(String(todayInspection.odometer).replace(/[^0-9.]/g, "")) || 0 : 0;

    const journey = await Journey.create({
      driver: driverId,
      vehicle: todayInspection.vehicle,
      inspection: todayInspection._id,
      date: today,
      status: "started",
      startOdometer: initialOdometer,
      startedAt: new Date(),
    });

    const populated = await Journey.findById(journey._id)
      .populate("driver", "name email phone photo")
      .populate("vehicle", "registration fleetNumber vehicleType make model");

    // Emit Socket.IO event for real-time manager updates
    const io = req.app.get("io");
    if (io) {
      io.emit("journeyStarted", populated);
    }

    return res.status(201).json(populated);
  } catch (error) {
    console.error("Start Journey Error:", error);
    return res.status(500).json({ message: "Server error starting journey" });
  }
};

export const getTodayJourney = async (req, res) => {
  try {
    const today = getTodayDateString();
    const journey = await Journey.findOne({
      driver: req.user._id,
      date: today,
    })
      .populate("driver", "name email phone photo")
      .populate("vehicle", "registration fleetNumber vehicleType make model");

    return res.json(journey || null);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching today's journey" });
  }
};

export const endJourney = async (req, res) => {
  try {
    const { endOdometer } = req.body;
    const today = getTodayDateString();
    const journey = await Journey.findOne({
      driver: req.user._id,
      date: today,
      status: "started",
    });

    if (!journey) {
      return res.status(404).json({ message: "No active journey found to end" });
    }

    const endOdoNum = endOdometer ? Number(String(endOdometer).replace(/[^0-9.]/g, "")) : 0;

    journey.status = "completed";
    journey.endedAt = new Date();
    if (endOdoNum > 0) {
      journey.endOdometer = endOdoNum;
      if (journey.startOdometer) {
        journey.distanceTraveled = Math.max(0, endOdoNum - journey.startOdometer);
      }
    }
    await journey.save();

    // Update vehicle odometer and UNASSIGN vehicle from driver so driver can take another trip
    if (journey.vehicle) {
      const updateFields = { assignedDriver: null };
      if (endOdoNum > 0) {
        updateFields.odometer = endOdoNum;
      }
      await Vehicle.findByIdAndUpdate(journey.vehicle, updateFields);
    }

    const populated = await Journey.findById(journey._id)
      .populate("driver", "name email phone photo")
      .populate("vehicle", "registration fleetNumber vehicleType make model");

    const io = req.app.get("io");
    if (io) {
      io.emit("journeyEnded", populated);
    }

    return res.json(populated);
  } catch (error) {
    console.error("End Journey Error:", error);
    return res.status(500).json({ message: "Server error ending journey" });
  }
};
