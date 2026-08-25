import RentalVehicle from "../models/RentalVehicle.js";
import Rental from "../models/Rental.js";

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// @desc    Get dashboard statistics, today's rentals, and upcoming returns
// @route   GET /api/rental/dashboard
export const getRentalDashboard = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const today = getTodayDateString();

    // 1. Vehicle counts
    const totalVehicles = await RentalVehicle.countDocuments({ owner: ownerId });
    const availableVehicles = await RentalVehicle.countDocuments({ owner: ownerId, status: "AVAILABLE" });
    const maintenanceVehicles = await RentalVehicle.countDocuments({ owner: ownerId, status: "MAINTENANCE" });

    // 2. Fetch all active/overdue rentals to compute live KPIs
    let allActiveRentals = await Rental.find({
      owner: ownerId,
      status: { $in: ["ACTIVE", "OVERDUE", "UPCOMING"] },
    })
      .populate("vehicle", "make model year registration vehicleType dailyRate photo status")
      .populate("customer", "fullName phone email licenceNumber")
      .sort({ returnDate: 1 });

    // Update any overdue items
    for (const r of allActiveRentals) {
      if (r.status === "ACTIVE" && r.returnDate < today) {
        r.status = "OVERDUE";
        await Rental.updateOne({ _id: r._id }, { status: "OVERDUE" });
      }
    }

    const currentlyRented = allActiveRentals.filter((r) => r.status === "ACTIVE" || r.status === "OVERDUE").length;
    const returningTodayList = allActiveRentals.filter(
      (r) => (r.status === "ACTIVE" || r.status === "OVERDUE") && r.returnDate === today
    );
    const overdueReturnsList = allActiveRentals.filter(
      (r) => r.status === "OVERDUE" || (r.status === "ACTIVE" && r.returnDate < today)
    );

    // 3. Today's Rentals (Active rentals, returning today, or starting today)
    const todaysRentals = allActiveRentals.filter((r) => {
      return (
        r.status === "ACTIVE" ||
        r.status === "OVERDUE" ||
        r.startDate === today ||
        r.returnDate === today
      );
    });

    // 4. Upcoming returns (Rentals with return date >= today, sorted by returnDate)
    const upcomingReturns = allActiveRentals
      .filter((r) => r.status === "ACTIVE" && r.returnDate >= today)
      .slice(0, 5);

    return res.status(200).json({
      summary: {
        totalVehicles,
        available: availableVehicles,
        currentlyRented,
        returningToday: returningTodayList.length,
        overdueReturns: overdueReturnsList.length,
        maintenance: maintenanceVehicles,
      },
      todaysRentals,
      upcomingReturns,
      todayDate: today,
    });
  } catch (error) {
    console.error("Error fetching rental dashboard data:", error);
    return res.status(500).json({ message: "Failed to load dashboard data", error: error.message });
  }
};
