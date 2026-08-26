import WorkshopReminder from "../models/WorkshopReminder.js";

// @desc    Get all reminders
// @route   GET /api/workshop/reminders
export const getWorkshopReminders = async (req, res) => {
  try {
    const owner = req.user._id;
    const { status, search } = req.query;

    let query = { owner };
    if (status && status !== "ALL") query.status = status;

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { title: { $regex: s, $options: "i" } },
        { notes: { $regex: s, $options: "i" } },
      ];
    }

    const reminders = await WorkshopReminder.find(query)
      .populate("customer", "fullName companyName phone")
      .populate("vehicle", "make model registration vehicleType")
      .populate("workOrder", "jobNumber jobType status")
      .sort({ dueDate: 1 })
      .lean();

    res.json(reminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    res.status(500).json({ message: "Server error fetching reminders" });
  }
};

// @desc    Get single reminder by ID
// @route   GET /api/workshop/reminders/:id
export const getWorkshopReminderById = async (req, res) => {
  try {
    const owner = req.user._id;
    const reminder = await WorkshopReminder.findOne({ _id: req.params.id, owner })
      .populate("customer", "fullName companyName phone")
      .populate("vehicle", "make model registration vehicleType")
      .populate("workOrder", "jobNumber jobType status");

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    res.json(reminder);
  } catch (error) {
    console.error("Error fetching reminder:", error);
    res.status(500).json({ message: "Server error fetching reminder" });
  }
};

// @desc    Create reminder
// @route   POST /api/workshop/reminders
export const createWorkshopReminder = async (req, res) => {
  try {
    const owner = req.user._id;
    const {
      title,
      dueDate,
      repeat,
      customerId,
      vehicleId,
      workOrderId,
      notes,
    } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ message: "Title and Due Date are required" });
    }

    const reminder = await WorkshopReminder.create({
      owner,
      title: title.trim(),
      dueDate: new Date(dueDate),
      repeat: repeat || "None",
      customer: customerId || undefined,
      vehicle: vehicleId || undefined,
      workOrder: workOrderId || undefined,
      status: "PENDING",
      notes: notes ? notes.trim() : "",
    });

    const populated = await WorkshopReminder.findById(reminder._id)
      .populate("customer", "fullName companyName phone")
      .populate("vehicle", "make model registration vehicleType")
      .populate("workOrder", "jobNumber jobType status");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating reminder:", error);
    res.status(500).json({ message: "Server error creating reminder" });
  }
};

// @desc    Update reminder
// @route   PATCH /api/workshop/reminders/:id
export const updateWorkshopReminder = async (req, res) => {
  try {
    const owner = req.user._id;
    const reminder = await WorkshopReminder.findOne({ _id: req.params.id, owner });
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    const { title, dueDate, repeat, status, notes } = req.body;

    if (title !== undefined) reminder.title = title.trim();
    if (dueDate) reminder.dueDate = new Date(dueDate);
    if (repeat) reminder.repeat = repeat;
    if (status) reminder.status = status;
    if (notes !== undefined) reminder.notes = notes.trim();

    await reminder.save();

    const updated = await WorkshopReminder.findById(reminder._id)
      .populate("customer", "fullName companyName phone")
      .populate("vehicle", "make model registration vehicleType")
      .populate("workOrder", "jobNumber jobType status");

    res.json(updated);
  } catch (error) {
    console.error("Error updating reminder:", error);
    res.status(500).json({ message: "Server error updating reminder" });
  }
};

// @desc    Delete reminder
// @route   DELETE /api/workshop/reminders/:id
export const deleteWorkshopReminder = async (req, res) => {
  try {
    const owner = req.user._id;
    const reminder = await WorkshopReminder.findOne({ _id: req.params.id, owner });
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    await WorkshopReminder.deleteOne({ _id: reminder._id });
    res.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    res.status(500).json({ message: "Server error deleting reminder" });
  }
};
