import WorkshopNote from "../models/WorkshopNote.js";

// @desc    Get all notes
// @route   GET /api/workshop/notes
export const getWorkshopNotes = async (req, res) => {
  try {
    const owner = req.user._id;
    const { customerId, vehicleId, workOrderId, search } = req.query;

    let query = { owner };
    if (customerId) query.customer = customerId;
    if (vehicleId) query.vehicle = vehicleId;
    if (workOrderId) query.workOrder = workOrderId;

    if (search && search.trim()) {
      query.noteText = { $regex: search.trim(), $options: "i" };
    }

    const notes = await WorkshopNote.find(query)
      .populate("customer", "fullName companyName")
      .populate("vehicle", "make model registration")
      .populate("workOrder", "jobNumber jobType")
      .sort({ date: -1 })
      .lean();

    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Server error fetching notes" });
  }
};

// @desc    Get single note by ID
// @route   GET /api/workshop/notes/:id
export const getWorkshopNoteById = async (req, res) => {
  try {
    const owner = req.user._id;
    const note = await WorkshopNote.findOne({ _id: req.params.id, owner })
      .populate("customer", "fullName companyName")
      .populate("vehicle", "make model registration")
      .populate("workOrder", "jobNumber jobType");

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).json({ message: "Server error fetching note" });
  }
};

// @desc    Create note
// @route   POST /api/workshop/notes
export const createWorkshopNote = async (req, res) => {
  try {
    const owner = req.user._id;
    const { noteText, date, customerId, vehicleId, workOrderId } = req.body;

    if (!noteText) {
      return res.status(400).json({ message: "Note text is required" });
    }

    const note = await WorkshopNote.create({
      owner,
      noteText: noteText.trim(),
      date: date ? new Date(date) : new Date(),
      customer: customerId || undefined,
      vehicle: vehicleId || undefined,
      workOrder: workOrderId || undefined,
      createdBy: req.user.name || "Manager",
    });

    const populated = await WorkshopNote.findById(note._id)
      .populate("customer", "fullName companyName")
      .populate("vehicle", "make model registration")
      .populate("workOrder", "jobNumber jobType");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ message: "Server error creating note" });
  }
};

// @desc    Update note
// @route   PATCH /api/workshop/notes/:id
export const updateWorkshopNote = async (req, res) => {
  try {
    const owner = req.user._id;
    const note = await WorkshopNote.findOne({ _id: req.params.id, owner });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const { noteText, date } = req.body;
    if (noteText !== undefined) note.noteText = noteText.trim();
    if (date) note.date = new Date(date);

    await note.save();

    const updated = await WorkshopNote.findById(note._id)
      .populate("customer", "fullName companyName")
      .populate("vehicle", "make model registration")
      .populate("workOrder", "jobNumber jobType");

    res.json(updated);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ message: "Server error updating note" });
  }
};

// @desc    Delete note
// @route   DELETE /api/workshop/notes/:id
export const deleteWorkshopNote = async (req, res) => {
  try {
    const owner = req.user._id;
    const note = await WorkshopNote.findOne({ _id: req.params.id, owner });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    await WorkshopNote.deleteOne({ _id: note._id });
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: "Server error deleting note" });
  }
};
