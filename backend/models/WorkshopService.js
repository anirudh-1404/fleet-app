import mongoose from "mongoose";

const workshopServiceSchema = new mongoose.Schema(
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
    vehicleCategory: {
      type: String,
      enum: ["Truck", "Trailer"],
      default: "Truck",
      required: true,
    },
    serviceType: {
      type: String,
      enum: ["Lube Service", "Basic Service", "Annual Service", "Repair", "Other"],
      default: "Basic Service",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    odometer: {
      type: Number,
      default: 0,
    },
    cost: {
      type: Number,
      default: 0,
    },
    workshopVendor: {
      type: String,
      default: "",
    },
    nextDueDate: {
      type: Date,
    },
    nextDueOdometer: {
      type: Number,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

workshopServiceSchema.index({ owner: 1, vehicleCategory: 1, serviceType: 1 });
workshopServiceSchema.index({ owner: 1, vehicle: 1 });
workshopServiceSchema.index({ owner: 1, date: -1 });

export default mongoose.model("WorkshopService", workshopServiceSchema);
