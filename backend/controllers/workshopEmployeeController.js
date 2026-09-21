import User from "../models/User.js";
import WorkshopWorkOrder from "../models/WorkshopWorkOrder.js";

// @desc    Get all employees for the logged-in workshop manager
// @route   GET /api/workshop/employees
// @access  Private (workshop_manager)
export const getWorkshopEmployees = async (req, res) => {
  try {
    const managerId = req.user._id;

    const employees = await User.find({
      role: "workshop_employee",
      workshopManager: managerId,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    // Count active jobs for each employee
    const employeesWithStats = await Promise.all(
      employees.map(async (emp) => {
        const activeJobsCount = await WorkshopWorkOrder.countDocuments({
          assignedTo: emp._id,
          status: { $in: ["OPEN", "INSPECTION_PENDING", "IN_PROGRESS", "WAITING_FOR_PARTS"] },
        });

        const completedJobsCount = await WorkshopWorkOrder.countDocuments({
          assignedTo: emp._id,
          status: "COMPLETED",
        });

        return {
          ...emp.toObject(),
          activeJobsCount,
          completedJobsCount,
        };
      })
    );

    return res.status(200).json(employeesWithStats);
  } catch (error) {
    console.error("Error fetching workshop employees:", error);
    return res.status(500).json({ message: "Server error fetching employees" });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/workshop/employees/:id
// @access  Private (workshop_manager)
export const getWorkshopEmployeeById = async (req, res) => {
  try {
    const employee = await User.findOne({
      _id: req.params.id,
      role: "workshop_employee",
      workshopManager: req.user._id,
    }).select("-password");

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Get assigned jobs
    const jobs = await WorkshopWorkOrder.find({ assignedTo: employee._id })
      .populate("vehicle", "registration make model year fleetNumber")
      .populate("customer", "name phone email")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      ...employee.toObject(),
      assignedJobs: jobs,
    });
  } catch (error) {
    console.error("Error fetching employee details:", error);
    return res.status(500).json({ message: "Server error fetching employee details" });
  }
};

// @desc    Create a new workshop employee account
// @route   POST /api/workshop/employees
// @access  Private (workshop_manager)
export const createWorkshopEmployee = async (req, res) => {
  try {
    const { name, email, password, phone, designation, specialization, status } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: "A user with this email already exists" });
    }

    const employee = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "workshop_employee",
      workshopManager: req.user._id,
      phone: phone || "",
      designation: designation || "Technician",
      specialization: Array.isArray(specialization) ? specialization : [],
      status: status || "Active",
    });

    const safeEmployee = await User.findById(employee._id).select("-password");
    return res.status(201).json(safeEmployee);
  } catch (error) {
    console.error("Error creating workshop employee:", error);
    return res.status(500).json({ message: error.message || "Server error creating employee" });
  }
};

// @desc    Update workshop employee
// @route   PUT /api/workshop/employees/:id
// @access  Private (workshop_manager)
export const updateWorkshopEmployee = async (req, res) => {
  try {
    const { password, ...updateFields } = req.body;

    const employee = await User.findOne({
      _id: req.params.id,
      role: "workshop_employee",
      workshopManager: req.user._id,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    Object.assign(employee, updateFields);

    if (password && password.trim().length > 0) {
      employee.password = password; // Hashed by User model pre-save hook
    }

    await employee.save();

    const safeEmployee = await User.findById(employee._id).select("-password");
    return res.status(200).json(safeEmployee);
  } catch (error) {
    console.error("Error updating workshop employee:", error);
    return res.status(500).json({ message: error.message || "Server error updating employee" });
  }
};

// @desc    Delete or deactivate employee
// @route   DELETE /api/workshop/employees/:id
// @access  Private (workshop_manager)
export const deleteWorkshopEmployee = async (req, res) => {
  try {
    const employee = await User.findOne({
      _id: req.params.id,
      role: "workshop_employee",
      workshopManager: req.user._id,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Unassign active jobs
    await WorkshopWorkOrder.updateMany(
      { assignedTo: employee._id },
      { $unset: { assignedTo: 1 }, assignedMechanic: "" }
    );

    await User.findByIdAndDelete(employee._id);

    return res.status(200).json({ message: "Employee removed successfully" });
  } catch (error) {
    console.error("Error deleting workshop employee:", error);
    return res.status(500).json({ message: "Server error deleting employee" });
  }
};
