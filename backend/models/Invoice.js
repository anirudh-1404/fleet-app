import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ["Services", "Parts", "Insurances", "Other Expenses"],
      default: "Services",
    },
    vendor: { type: String, required: true },
    amount: { type: String, required: true },
    date: { type: String, required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    status: { type: String, enum: ["Paid", "Pending"], default: "Paid" },
    file: { type: String, default: "" },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
