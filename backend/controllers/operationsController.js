import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Inspection from "../models/Inspection.js";
import Journey from "../models/Journey.js";
import { getTodayDateString } from "./inspectionController.js";

export const getOperationsData = async (req, res) => {
  try {
    const { from, to, status, search } = req.query;
    const today = getTodayDateString();

    const fromDate = from || today;
    const toDate = to || fromDate;

    // Get drivers matching search query if present
    const driverFilter = { role: "driver" };
    if (search && search.trim() !== "") {
      const q = new RegExp(search.trim(), "i");
      driverFilter.$or = [{ name: q }, { email: q }, { phone: q }];
    }

    const drivers = await User.find(driverFilter).select("name email phone status photo");

    const operationsList = [];

    for (const driver of drivers) {
      const vehicle = await Vehicle.findOne({ assignedDriver: driver._id });
      const registration = vehicle ? vehicle.registration : "N/A";
      const vehicleName = vehicle ? `${vehicle.make || ""} ${vehicle.model || vehicle.vehicleType}`.trim() : "Unassigned";

      // Query inspections in date range
      const inspectionQuery = {
        driver: driver._id,
        date: { $gte: fromDate, $lte: toDate },
      };
      const inspection = await Inspection.findOne(inspectionQuery).sort({ date: -1, createdAt: -1 });

      // Query journey in date range
      const journeyQuery = {
        driver: driver._id,
        date: { $gte: fromDate, $lte: toDate },
      };
      const journey = await Journey.findOne(journeyQuery).sort({ date: -1, createdAt: -1 });

      const inspectionStatus = inspection ? inspection.overallStatus : "Pending";
      const inspectionTime = inspection
        ? new Date(inspection.submittedAt || inspection.createdAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "--";

      const journeyStatus = journey && journey.status === "started" ? "Started" : "Not Started";
      const journeyStartTime = journey && journey.startedAt
        ? new Date(journey.startedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        : "--";

      const record = {
        id: `op-${driver._id}-${fromDate}`,
        driverId: driver._id,
        driverName: driver.name,
        vehicleId: vehicle ? vehicle._id : null,
        vehicleName,
        registration,
        date: fromDate,
        inspectionStatus,
        inspectionTime,
        passCount: inspection ? inspection.passCount : 0,
        failCount: inspection ? inspection.failCount : 0,
        naCount: inspection ? inspection.naCount : 0,
        notesCount: inspection ? inspection.notesCount : 0,
        journeyStatus,
        journeyStartTime,
        inspectionId: inspection ? inspection._id : null,
      };

      // Filter by status if requested
      let keep = true;
      if (status && status !== "All") {
        if (status === "Inspection Pending" && inspectionStatus !== "Pending") keep = false;
        if (status === "Inspection Completed" && inspectionStatus !== "Completed") keep = false;
        if (status === "Failed" && inspectionStatus !== "Failed") keep = false;
        if (status === "Journey Started" && journeyStatus !== "Started") keep = false;
        if (status === "Journey Not Started" && journeyStatus !== "Not Started") keep = false;
      }

      if (keep) {
        operationsList.push(record);
      }
    }

    return res.json(operationsList);
  } catch (error) {
    console.error("Get Operations Error:", error);
    return res.status(500).json({ message: "Server error fetching operations data" });
  }
};
