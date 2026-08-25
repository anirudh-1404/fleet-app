import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    licenceNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    licenceClass: {
      type: String,
      default: "",
      trim: true,
    },
    licenceExpiry: {
      type: String,
      default: "",
    },
    idNumber: {
      type: String,
      default: "",
      trim: true,
    },
    emergencyContact: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

customerSchema.index({ owner: 1 });
customerSchema.index({ owner: 1, phone: 1 });
customerSchema.index({ owner: 1, licenceNumber: 1 });

export default mongoose.model("Customer", customerSchema);
