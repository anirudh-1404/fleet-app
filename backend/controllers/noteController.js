import Note from "../models/Note.js";
import Vehicle from "../models/Vehicle.js";

export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find()
      .sort({ createdAt: -1 })
      .populate("linkedVehicle", "registration fleetNumber vehicleType");
    return res.json(notes);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching notes" });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate(
      "linkedVehicle",
      "registration fleetNumber vehicleType"
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    return res.json(note);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching note" });
  }
};

export const createNote = async (req, res) => {
  try {
    const { title, content, date, vehicleId } = req.body;
    let vehicle = null;
    if (vehicleId) vehicle = await Vehicle.findById(vehicleId);

    const note = await Note.create({
      title: title || "Operational Note",
      content: content || req.body.text || "",
      text: content || req.body.text || "",
      date: date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      authorName: req.user ? req.user.name : "Michael Johnson",
      linkedVehicle: vehicle ? vehicle._id : null,
      vehicleRegistration: vehicle ? vehicle.registration : "General Fleet",
      createdBy: req.user ? req.user._id : null,
    });

    const populated = await Note.findById(note._id).populate("linkedVehicle", "registration fleetNumber");
    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: "Server error creating note" });
  }
};

export const updateNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
      "linkedVehicle",
      "registration fleetNumber"
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    return res.json(note);
  } catch (error) {
    return res.status(500).json({ message: "Server error updating note" });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    return res.json({ message: "Note deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error deleting note" });
  }
};
