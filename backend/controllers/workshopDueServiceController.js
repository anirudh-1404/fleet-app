import WorkshopVehicle from "../models/WorkshopVehicle.js";
import WorkshopService from "../models/WorkshopService.js";
import WorkshopSchedule from "../models/WorkshopSchedule.js";

// @desc    Get system-generated due services (computed from actual service history)
// @route   GET /api/workshop/due-services
export const getWorkshopDueServices = async (req, res) => {
  try {
    const owner = req.user._id;
    const { vehicleType, status } = req.query;

    const vehicles = await WorkshopVehicle.find({ owner })
      .populate("customer", "fullName companyName phone")
      .lean();

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const dueList = [];

    for (const vehicle of vehicles) {
      if (vehicleType && vehicleType !== "ALL" && vehicle.vehicleType !== vehicleType) {
        continue;
      }

      // Find latest service for this vehicle
      const latestService = await WorkshopService.findOne({ owner, vehicle: vehicle._id })
        .sort({ date: -1 })
        .lean();

      // Find upcoming schedule for this vehicle
      const upcomingSchedule = await WorkshopSchedule.findOne({
        owner,
        vehicle: vehicle._id,
        status: "SCHEDULED",
        scheduledDate: { $gte: now },
      }).sort({ scheduledDate: 1 }).lean();

      let serviceType = latestService?.serviceType || "Basic Service";
      let lastServiceDate = latestService?.date || vehicle.createdAt;
      let nextDueDate = latestService?.nextDueDate || upcomingSchedule?.scheduledDate;

      // If no nextDueDate calculated, calculate standard 6 months from last service / vehicle creation
      if (!nextDueDate) {
        const base = new Date(lastServiceDate);
        nextDueDate = new Date(base.setMonth(base.getMonth() + 6));
      }

      nextDueDate = new Date(nextDueDate);

      let computedStatus = "UPCOMING";
      const diffTime = nextDueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        computedStatus = "OVERDUE";
      } else if (diffDays <= 7) {
        computedStatus = "DUE";
      } else {
        computedStatus = "UPCOMING";
      }

      if (status && status !== "ALL" && computedStatus !== status) {
        continue;
      }

      dueList.push({
        _id: vehicle._id + "_" + serviceType,
        vehicle,
        customer: vehicle.customer,
        serviceType,
        lastServiceDate,
        nextDueDate,
        daysDifference: diffDays,
        status: computedStatus,
        lastOdometer: vehicle.odometer || 0,
      });
    }

    // Sort: OVERDUE first, then DUE, then UPCOMING (earliest due first)
    dueList.sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());

    res.json(dueList);
  } catch (error) {
    console.error("Error computing due services:", error);
    res.status(500).json({ message: "Server error computing due services" });
  }
};
