import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    vehicleType: { type: String, required: true },
    registration: { type: String, required: true, unique: true, uppercase: true, trim: true },
    fleetNumber: { type: String, required: true, trim: true },
    make: { type: String, default: "" },
    model: { type: String, default: "" },
    year: { type: Number },
    vin: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Active", "In Inspection", "Due Service", "Out of Service"],
      default: "Active",
    },
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    photo: { type: String, default: "" },
  },
  { timestamps: true }
);

vehicleSchema.index({ fleetNumber: 1 });
vehicleSchema.index({ assignedDriver: 1 });

export default mongoose.model("Vehicle", vehicleSchema);
