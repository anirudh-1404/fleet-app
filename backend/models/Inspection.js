import mongoose from "mongoose";

const inspectionItemSchema = new mongoose.Schema({
  itemKey: { type: String, required: true },
  label: { type: String, required: true },
  status: { type: String, enum: ["PASS", "FAIL", "N/A", "NOTE", "PENDING"], default: "PENDING" },
  note: { type: String, default: "" },
});

const inspectionSectionSchema = new mongoose.Schema({
  sectionName: { type: String, required: true },
  items: [inspectionItemSchema],
});

const inspectionSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    date: { type: String, required: true }, // Format YYYY-MM-DD
    vehicleRegistration: { type: String, default: "" },
    fleetNumber: { type: String, default: "" },
    trailerNumber: { type: String, default: "" },
    odometer: { type: String, default: "" },
    sections: [inspectionSectionSchema],
    passCount: { type: Number, default: 0 },
    failCount: { type: Number, default: 0 },
    naCount: { type: Number, default: 0 },
    notesCount: { type: Number, default: 0 },
    overallStatus: { type: String, enum: ["Completed", "Failed", "Pending"], default: "Completed" },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

inspectionSchema.index({ driver: 1, vehicle: 1, date: 1 }, { unique: true });
inspectionSchema.index({ date: 1 });
inspectionSchema.index({ overallStatus: 1 });

export default mongoose.model("Inspection", inspectionSchema);
