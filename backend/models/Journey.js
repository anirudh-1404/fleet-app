import mongoose from "mongoose";

const journeySchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    inspection: { type: mongoose.Schema.Types.ObjectId, ref: "Inspection", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    status: {
      type: String,
      enum: ["not_started", "started", "completed"],
      default: "started",
    },
    startOdometer: { type: Number, default: 0 },
    endOdometer: { type: Number, default: null },
    distanceTraveled: { type: Number, default: null },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

journeySchema.index({ driver: 1, vehicle: 1, date: 1 });
journeySchema.index({ date: 1 });

export default mongoose.model("Journey", journeySchema);
