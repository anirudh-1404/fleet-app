import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    time: { type: String, default: "Just now" },
    category: { type: String, default: "System" },
    isRead: { type: Boolean, default: false },
    isUrgent: { type: Boolean, default: false },
    targetRoute: { type: String, default: "" },
    targetParams: { type: Object, default: {} },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
