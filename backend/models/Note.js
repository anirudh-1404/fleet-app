import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: String, required: true },
    authorName: { type: String, default: "Michael Johnson" },
    linkedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },
    vehicleRegistration: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
