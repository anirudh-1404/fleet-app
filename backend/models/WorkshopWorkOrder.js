import mongoose from "mongoose";

const workshopWorkOrderSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkshopCustomer",
      required: true,
      index: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkshopVehicle",
      required: true,
      index: true,
    },
    jobNumber: {
      type: String,
      required: true,
      trim: true,
    },
    jobType: {
      type: String,
      enum: ["Inspection", "Lube Service", "Basic Service", "Annual Service", "Repair", "Other"],
      default: "Basic Service",
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    dateReceived: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expectedCompletionDate: {
      type: Date,
    },
    actualCompletionDate: {
      type: Date,
    },
    assignedMechanic: {
      type: String,
      default: "",
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Normal", "Urgent", "Critical"],
      default: "Normal",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "OPEN",
        "INSPECTION_PENDING",
        "IN_PROGRESS",
        "WAITING_FOR_PARTS",
        "READY_FOR_COLLECTION",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "OPEN",
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    checklist: {
      checklistType: {
        type: String,
        default: "BASIC_INSPECTION",
      },
      items: [
        {
          id: { type: String },
          title: { type: String },
          label: { type: String },
          category: { type: String, default: "General" },
          status: {
            type: String,
            default: "PASS",
          },
          measurement: { type: String, default: "" },
          measurementUnit: { type: String, default: "" },
          observation: { type: String, default: "" },
          notes: { type: String, default: "" },
        },
      ],
      completedAt: { type: Date },
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    photos: {
      before: [
        {
          url: { type: String, required: true },
          caption: { type: String, default: "" },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      during: [
        {
          url: { type: String, required: true },
          caption: { type: String, default: "" },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      after: [
        {
          url: { type: String, required: true },
          caption: { type: String, default: "" },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
    },
    partsUsed: [
      {
        partName: { type: String, required: true },
        partNumber: { type: String, default: "" },
        quantity: { type: Number, default: 1 },
        notes: { type: String, default: "" },
      },
    ],
    workNotes: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        authorName: { type: String, default: "" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

workshopWorkOrderSchema.index({ owner: 1, jobNumber: 1 });
workshopWorkOrderSchema.index({ owner: 1, status: 1 });
workshopWorkOrderSchema.index({ owner: 1, vehicle: 1 });
workshopWorkOrderSchema.index({ owner: 1, customer: 1 });
workshopWorkOrderSchema.index({ assignedTo: 1, status: 1 });

export default mongoose.model("WorkshopWorkOrder", workshopWorkOrderSchema);
