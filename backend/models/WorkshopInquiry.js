import mongoose from "mongoose";

const workshopInquirySchema = new mongoose.Schema(
  {
    workshopManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customer: {
      name: { type: String, required: true, trim: true },
      companyName: { type: String, trim: true, default: "" },
      mobileNumber: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      preferredContactMethod: {
        type: String,
        enum: ["Phone", "Email", "WhatsApp", "SMS", "Any"],
        default: "Phone",
      },
      customerNotes: { type: String, trim: true, default: "" },
    },
    vehicle: {
      registration: { type: String, required: true, trim: true, uppercase: true },
      vin: { type: String, trim: true, uppercase: true, default: "" },
      make: { type: String, required: true, trim: true },
      model: { type: String, required: true, trim: true },
      year: { type: Number, required: true },
      odometer: { type: Number, required: true },
      vehicleType: {
        type: String,
        enum: ["Car", "Van", "Truck", "Trailer", "Other"],
        default: "Truck",
      },
      fuelType: {
        type: String,
        enum: ["Petrol", "Diesel", "Hybrid", "EV", "Other"],
        default: "Diesel",
      },
    },
    bookingTypes: {
      type: [String],
      default: [],
    },
    mainJobRequest: {
      type: String,
      trim: true,
      default: "",
    },
    signature: {
      type: String,
      default: "",
    },
    signatureDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "CONVERTED", "ARCHIVED"],
      default: "NEW",
      index: true,
    },
    convertedWorkOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkshopWorkOrder",
      default: null,
    },
    internalNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

workshopInquirySchema.index({ workshopManager: 1, createdAt: -1 });

export default mongoose.model("WorkshopInquiry", workshopInquirySchema);
