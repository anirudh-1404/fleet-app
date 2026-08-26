import mongoose from "mongoose";

const workshopContactSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      enum: ["Mechanic", "Vendor", "Supplier", "Other"],
      default: "Other",
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
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

workshopContactSchema.index({ owner: 1, type: 1 });
workshopContactSchema.index({ owner: 1, name: 1 });

export default mongoose.model("WorkshopContact", workshopContactSchema);
