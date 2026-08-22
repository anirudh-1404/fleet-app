import mongoose from "mongoose";

const fuelSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    date: { type: String, required: true },
    time: { type: String, default: "12:00 PM" },
    litres: { type: Number, default: 0 },
    cost: { type: Number, required: true },
    odometer: { type: Number, default: 0 },
    fuelEfficiency: { type: String, default: "3.2 L/100km" },
    vendor: { type: String, default: "Shell Fleet" },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

fuelSchema.index({ driver: 1, createdAt: -1 });
fuelSchema.index({ vehicle: 1, createdAt: -1 });

export default mongoose.model("Fuel", fuelSchema);
