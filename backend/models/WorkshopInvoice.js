import mongoose from "mongoose";

const workshopInvoiceSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Parts", "Insurances", "Other Expenses"],
      default: "Parts",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkshopCustomer",
      index: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkshopVehicle",
      index: true,
    },
    workOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkshopWorkOrder",
      index: true,
    },
    vendor: {
      type: String,
      trim: true,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    file: {
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

workshopInvoiceSchema.index({ owner: 1, category: 1 });
workshopInvoiceSchema.index({ owner: 1, workOrder: 1 });
workshopInvoiceSchema.index({ owner: 1, date: -1 });

export default mongoose.model("WorkshopInvoice", workshopInvoiceSchema);
