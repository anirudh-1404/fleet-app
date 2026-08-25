import mongoose from "mongoose";

const rentalVehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicleType: {
      type: String,
      required: true,
      trim: true,
    },
    make: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    registration: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    vin: {
      type: String,
      default: "",
      trim: true,
    },
    dailyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "RENTED", "MAINTENANCE", "INACTIVE"],
      default: "AVAILABLE",
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

rentalVehicleSchema.index({ owner: 1 });
rentalVehicleSchema.index({ registration: 1, owner: 1 });
rentalVehicleSchema.index({ status: 1 });

export default mongoose.model("RentalVehicle", rentalVehicleSchema);
