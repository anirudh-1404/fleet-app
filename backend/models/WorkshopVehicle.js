import mongoose from "mongoose";

const workshopVehicleSchema = new mongoose.Schema(
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
    vehicleType: {
      type: String,
      enum: ["Truck", "Trailer", "Van", "Ute", "Car", "Other"],
      default: "Truck",
      required: true,
    },
    registration: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    make: {
      type: String,
      trim: true,
      default: "",
    },
    model: {
      type: String,
      trim: true,
      default: "",
    },
    year: {
      type: Number,
      default: new Date().getFullYear(),
    },
    vin: {
      type: String,
      trim: true,
      default: "",
    },
    odometer: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "IN_WORKSHOP", "READY_FOR_COLLECTION", "OUTSIDE_WORKSHOP", "INACTIVE"],
      default: "OUTSIDE_WORKSHOP",
      required: true,
    },
    photo: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

workshopVehicleSchema.index({ owner: 1, registration: 1 });
workshopVehicleSchema.index({ owner: 1, customer: 1 });
workshopVehicleSchema.index({ owner: 1, status: 1 });

export default mongoose.model("WorkshopVehicle", workshopVehicleSchema);
