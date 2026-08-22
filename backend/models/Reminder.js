import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    dueDate: { type: String, required: true },
    repeat: { type: String, default: "Never" },
    status: { type: String, enum: ["Normal", "Urgent", "Overdue"], default: "Normal" },
    linkedItem: { type: String, default: "General" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Reminder", reminderSchema);
