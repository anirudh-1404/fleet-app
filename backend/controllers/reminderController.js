import Reminder from "../models/Reminder.js";

export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find().sort({ createdAt: -1 });
    return res.json(reminders);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching reminders" });
  }
};

export const getReminderById = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    return res.json(reminder);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching reminder" });
  }
};

export const createReminder = async (req, res) => {
  try {
    const reminder = await Reminder.create({
      ...req.body,
      createdBy: req.user ? req.user._id : null,
    });
    return res.status(201).json(reminder);
  } catch (error) {
    return res.status(500).json({ message: "Server error creating reminder" });
  }
};

export const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    return res.json(reminder);
  } catch (error) {
    return res.status(500).json({ message: "Server error updating reminder" });
  }
};

export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.id);
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    return res.json({ message: "Reminder deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error deleting reminder" });
  }
};
