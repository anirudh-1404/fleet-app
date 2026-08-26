import mongoose from "mongoose";

const workshopReminderSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    repeat: {
      type: String,
      enum: ["None", "Daily", "Weekly", "Monthly", "Yearly"],
      default: "None",
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkshopCustomer",
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkshopVehicle",
    },
    workOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkshopWorkOrder",
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      default: "PENDING",
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

workshopReminderSchema.index({ owner: 1, dueDate: 1 });
workshopReminderSchema.index({ owner: 1, status: 1 });

export default mongoose.model("WorkshopReminder", workshopReminderSchema);
