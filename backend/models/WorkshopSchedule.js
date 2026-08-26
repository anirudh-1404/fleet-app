import mongoose from "mongoose";

const workshopScheduleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["Service", "Inspection"],
      default: "Service",
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkshopVehicle",
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkshopCustomer",
      required: true,
      index: true,
    },
    workOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkshopWorkOrder",
    },
    serviceOrInspectionType: {
      type: String,
      required: true,
      default: "Basic Service",
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    assignedWorkshop: {
      type: String,
      default: "",
    },
    assignedPerson: {
      type: String,
      default: "",
      trim: true,
    },
    reminderToggle: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "SCHEDULED",
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

workshopScheduleSchema.index({ owner: 1, scheduledDate: 1 });
workshopScheduleSchema.index({ owner: 1, type: 1 });
workshopScheduleSchema.index({ owner: 1, status: 1 });

export default mongoose.model("WorkshopSchedule", workshopScheduleSchema);
