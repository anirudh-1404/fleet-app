import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PASS", "FAIL", "N/A"],
      default: "PASS",
    },
    note: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const workshopInspectionSchema = new mongoose.Schema(
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
    workOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkshopWorkOrder",
      index: true,
    },
    inspectionType: {
      type: String,
      enum: ["Truck", "Trailer"],
      default: "Truck",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    inspectorName: {
      type: String,
      required: true,
      trim: true,
    },
    checklistItems: [checklistItemSchema],
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "PASSED", "FAILED", "COMPLETED"],
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

workshopInspectionSchema.index({ owner: 1, inspectionType: 1 });
workshopInspectionSchema.index({ owner: 1, status: 1 });
workshopInspectionSchema.index({ owner: 1, vehicle: 1 });

export default mongoose.model("WorkshopInspection", workshopInspectionSchema);
