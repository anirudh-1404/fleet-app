import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching notifications" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    return res.json(notification);
  } catch (error) {
    return res.status(500).json({ message: "Server error marking notification read" });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({}, { isRead: true });
    const updated = await Notification.find().sort({ createdAt: -1 });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Server error marking all notifications read" });
  }
};
