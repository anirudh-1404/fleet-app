import WorkshopJobMessage from "../models/WorkshopJobMessage.js";
import WorkshopWorkOrder from "../models/WorkshopWorkOrder.js";

// @desc    Get all chat messages for a specific work order
// @route   GET /api/workshop/work-orders/:id/messages
// @access  Private (workshop_manager, workshop_employee)
export const getJobMessages = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify work order access
    const workOrder = await WorkshopWorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ message: "Work order not found" });
    }

    const messages = await WorkshopJobMessage.find({ workOrder: id })
      .populate("sender", "name email role designation")
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching job messages:", error);
    return res.status(500).json({ message: "Server error fetching messages" });
  }
};

// @desc    Send a message on a work order
// @route   POST /api/workshop/work-orders/:id/messages
// @access  Private (workshop_manager, workshop_employee)
export const sendJobMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, attachments } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const workOrder = await WorkshopWorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ message: "Work order not found" });
    }

    const message = await WorkshopJobMessage.create({
      workOrder: id,
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      text: text.trim(),
      attachments: Array.isArray(attachments) ? attachments : [],
      readBy: [req.user._id],
    });

    const populated = await WorkshopJobMessage.findById(message._id)
      .populate("sender", "name email role designation");

    // Emit real-time socket event if io is available
    const io = req.app.get("io");
    if (io) {
      io.emit(`workorder_message:${id}`, populated);
      io.emit(`notification:${workOrder.owner}`, {
        type: "JOB_MESSAGE",
        workOrderId: id,
        text: `${req.user.name}: ${text.slice(0, 50)}`,
      });
      if (workOrder.assignedTo && workOrder.assignedTo.toString() !== req.user._id.toString()) {
        io.emit(`notification:${workOrder.assignedTo}`, {
          type: "JOB_MESSAGE",
          workOrderId: id,
          text: `${req.user.name}: ${text.slice(0, 50)}`,
        });
      }
    }

    return res.status(201).json(populated);
  } catch (error) {
    console.error("Error sending job message:", error);
    return res.status(500).json({ message: "Server error sending message" });
  }
};
