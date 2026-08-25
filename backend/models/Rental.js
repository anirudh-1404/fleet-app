import mongoose from "mongoose";

const rentalSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RentalVehicle",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    startDate: {
      type: String,
      required: true, // Format: YYYY-MM-DD
    },
    startTime: {
      type: String,
      default: "09:00",
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
    },
    returnDate: {
      type: String,
      required: true, // Format: YYYY-MM-DD
    },
    returnTime: {
      type: String,
      default: "17:00",
    },
    dailyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    rentalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Partial"],
      default: "Pending",
    },
    status: {
      type: String,
      enum: ["UPCOMING", "ACTIVE", "RETURNED", "OVERDUE", "CANCELLED"],
      default: "ACTIVE",
    },
    notes: {
      type: String,
      default: "",
    },
    // Return tracking fields
    actualReturnDate: {
      type: String,
      default: null,
    },
    actualReturnTime: {
      type: String,
      default: null,
    },
    returnOdometer: {
      type: Number,
      default: null,
    },
    returnFuelLevel: {
      type: String,
      default: "",
    },
    damageNotes: {
      type: String,
      default: "",
    },
    additionalCharges: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      default: null,
    },
    returnNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

rentalSchema.index({ owner: 1 });
rentalSchema.index({ vehicle: 1 });
rentalSchema.index({ customer: 1 });
rentalSchema.index({ status: 1 });
rentalSchema.index({ startDate: 1, returnDate: 1 });

export default mongoose.model("Rental", rentalSchema);
