import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    serviceType: { type: String, required: true },
    serviceDate: { type: String, required: true },
    odometer: { type: String, default: "" },
    cost: { type: String, default: "$0" },
    vendor: { type: String, default: "Volvo Fleet Service" },
    nextDueDate: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Completed", "Scheduled", "Overdue"],
      default: "Scheduled",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
