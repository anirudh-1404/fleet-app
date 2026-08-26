import mongoose from "mongoose";

const workshopNoteSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    noteText: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkshopCustomer",
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkshopVehicle",
    },
    workOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkshopWorkOrder",
    },
    createdBy: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

workshopNoteSchema.index({ owner: 1, date: -1 });

export default mongoose.model("WorkshopNote", workshopNoteSchema);
