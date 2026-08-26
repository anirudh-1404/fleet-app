import WorkshopWorkOrder from "../models/WorkshopWorkOrder.js";
import WorkshopVehicle from "../models/WorkshopVehicle.js";
import WorkshopInspection from "../models/WorkshopInspection.js";
import WorkshopService from "../models/WorkshopService.js";
import WorkshopSchedule from "../models/WorkshopSchedule.js";
import WorkshopInvoice from "../models/WorkshopInvoice.js";

// @desc    Get real-time workshop dashboard operational overview
// @route   GET /api/workshop/dashboard
export const getWorkshopDashboard = async (req, res) => {
  try {
    const owner = req.user._id;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const now = new Date();

    // 1. Operational KPI Queries
    const [
      todaysJobs,
      openWorkOrders,
      vehiclesInWorkshop,
      inspectionsPending,
      servicesInProgress,
      readyForCollection,
      overdueJobs,
      upcomingScheduledServices,
      todayInvoices,
      recentActivity,
      todaysWorkOrdersList,
      upcomingSchedulesList,
    ] = await Promise.all([
      // Today's Jobs received
      WorkshopWorkOrder.countDocuments({
        owner,
        dateReceived: { $gte: startOfToday, $lte: endOfToday },
      }),

      // Open Work Orders (not completed/cancelled)
      WorkshopWorkOrder.countDocuments({
        owner,
        status: { $in: ["OPEN", "INSPECTION_PENDING", "IN_PROGRESS", "WAITING_FOR_PARTS", "READY_FOR_COLLECTION"] },
      }),

      // Vehicles currently in workshop
      WorkshopVehicle.countDocuments({
        owner,
        status: "IN_WORKSHOP",
      }),

      // Inspections pending
      WorkshopInspection.countDocuments({
        owner,
        status: { $in: ["PENDING", "IN_PROGRESS"] },
      }),

      // Services in progress
      WorkshopWorkOrder.countDocuments({
        owner,
        status: "IN_PROGRESS",
      }),

      // Ready for collection
      WorkshopWorkOrder.countDocuments({
        owner,
        status: "READY_FOR_COLLECTION",
      }),

      // Overdue jobs (expectedCompletionDate < now and not completed/cancelled)
      WorkshopWorkOrder.countDocuments({
        owner,
        expectedCompletionDate: { $lt: now },
        status: { $in: ["OPEN", "INSPECTION_PENDING", "IN_PROGRESS", "WAITING_FOR_PARTS"] },
      }),

      // Upcoming scheduled services & inspections
      WorkshopSchedule.countDocuments({
        owner,
        status: "SCHEDULED",
        scheduledDate: { $gte: startOfToday },
      }),

      // Today's Invoices/Revenue sum
      WorkshopInvoice.aggregate([
        {
          $match: {
            owner,
            date: { $gte: startOfToday, $lte: endOfToday },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),

      // Recent Workshop Activity (Latest 10 work orders)
      WorkshopWorkOrder.find({ owner })
        .populate("customer", "fullName companyName phone")
        .populate("vehicle", "make model registration vehicleType status")
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean(),

      // Today's Active Work Orders
      WorkshopWorkOrder.find({
        owner,
        dateReceived: { $gte: startOfToday, $lte: endOfToday },
      })
        .populate("customer", "fullName companyName phone")
        .populate("vehicle", "make model registration vehicleType status")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Upcoming Schedules for next 7 days
      WorkshopSchedule.find({
        owner,
        status: "SCHEDULED",
        scheduledDate: { $gte: startOfToday },
      })
        .populate("customer", "fullName companyName phone")
        .populate("vehicle", "make model registration vehicleType")
        .sort({ scheduledDate: 1 })
        .limit(5)
        .lean(),
    ]);

    const todayRevenue = todayInvoices[0]?.total || 0;

    res.json({
      summary: {
        todaysJobs,
        openWorkOrders,
        vehiclesInWorkshop,
        inspectionsPending,
        servicesInProgress,
        readyForCollection,
        overdueJobs,
        upcomingScheduledServices,
        todayRevenue,
      },
      recentActivity,
      todaysWorkOrders: todaysWorkOrdersList,
      upcomingSchedules: upcomingSchedulesList,
    });
  } catch (error) {
    console.error("Error fetching workshop dashboard:", error);
    res.status(500).json({ message: "Server error fetching workshop dashboard" });
  }
};
