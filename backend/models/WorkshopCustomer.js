import mongoose from "mongoose";

const workshopCustomerSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "N/A",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

workshopCustomerSchema.index({ owner: 1, phone: 1 });
workshopCustomerSchema.index({ owner: 1, fullName: 1 });

export default mongoose.model("WorkshopCustomer", workshopCustomerSchema);
