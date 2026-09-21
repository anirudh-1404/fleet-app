import mongoose from "mongoose";

const workshopJobMessageSchema = new mongoose.Schema(
  {
    workOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkshopWorkOrder",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    senderRole: {
      type: String,
      enum: ["workshop_manager", "workshop_employee"],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [
      {
        url: { type: String, required: true },
        name: { type: String, default: "" },
      },
    ],
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

workshopJobMessageSchema.index({ workOrder: 1, createdAt: 1 });

export default mongoose.model("WorkshopJobMessage", workshopJobMessageSchema);
