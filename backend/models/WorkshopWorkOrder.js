import mongoose from "mongoose";

const workshopWorkOrderSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkshopCustomer",
      required: true,
      index: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkshopVehicle",
      required: true,
      index: true,
    },
    jobNumber: {
      type: String,
      required: true,
      trim: true,
    },
    jobType: {
      type: String,
      enum: ["Inspection", "Lube Service", "Basic Service", "Annual Service", "Repair", "Other"],
      default: "Basic Service",
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    dateReceived: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expectedCompletionDate: {
      type: Date,
    },
    actualCompletionDate: {
      type: Date,
    },
    assignedMechanic: {
      type: String,
      default: "",
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Normal", "Urgent", "Critical"],
      default: "Normal",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "OPEN",
        "INSPECTION_PENDING",
        "IN_PROGRESS",
        "WAITING_FOR_PARTS",
        "READY_FOR_COLLECTION",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "OPEN",
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

workshopWorkOrderSchema.index({ owner: 1, jobNumber: 1 });
workshopWorkOrderSchema.index({ owner: 1, status: 1 });
workshopWorkOrderSchema.index({ owner: 1, vehicle: 1 });
workshopWorkOrderSchema.index({ owner: 1, customer: 1 });

export default mongoose.model("WorkshopWorkOrder", workshopWorkOrderSchema);
