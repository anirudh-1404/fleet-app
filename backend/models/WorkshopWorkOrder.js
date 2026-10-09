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
      default: "Basic Service",
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    intakeDetails: {
      workTypes: [{ type: String }],
      customerComplaint: { type: String, default: "" },
      workRequired: { type: String, default: "" },
      faultCodes: { type: String, default: "" },
      additionalNotes: { type: String, default: "" },
      vehicleOffRoad: { type: Boolean, default: false },
      intakePhotos: [{ type: String }],
      createdByName: { type: String, default: "" },
      intakeDate: { type: Date, default: Date.now },
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
          severity: { type: String, default: "Minor" }, // Minor | Major | Critical
          measurement: { type: String, default: "" },
          measurementUnit: { type: String, default: "" },
          defectDescription: { type: String, default: "" },
          recommendedRepair: { type: String, default: "" },
          repairPriority: { type: String, default: "Normal" },
          observation: { type: String, default: "" },
          notes: { type: String, default: "" },
          photos: [{ type: String }],
        },
      ],
      axleMeasurements: [
        {
          axleNumber: { type: String }, // e.g. "1st Axle", "2nd Axle", "3rd Axle", "4th Axle"
          rhsMm: { type: String, default: "" },
          lhsMm: { type: String, default: "" },
        },
      ],
      tyreTreadMeasurements: {
        type: mongoose.Schema.Types.Mixed,
        default: () => ({}),
      },
      serviceRecord: {
        engineOilReplaced: { type: Boolean, default: false },
        oilFilterReplaced: { type: Boolean, default: false },
        fuelFilterReplaced: { type: Boolean, default: false },
        airFilterReplaced: { type: Boolean, default: false },
        coolantServiced: { type: Boolean, default: false },
        transmissionDiffOilsServiced: { type: Boolean, default: false },
        greasingCompleted: { type: Boolean, default: false },
        diagnosticScanCompleted: { type: Boolean, default: false },
        serviceReminderReset: { type: Boolean, default: false },
        roadTestCompleted: { type: Boolean, default: false },
        additionalWorkRequired: { type: Boolean, default: false },
        nextServiceDueKm: { type: Number },
        nextServiceDueDate: { type: Date },
      },
      overallOutcome: { type: String, default: "Pass" },
      safetyCriticalDefects: { type: String, default: "" },
      repairsRecommended: { type: String, default: "" },
      immediateActionRequired: { type: String, default: "" },
      inspectorComments: { type: String, default: "" },
      inspectorName: { type: String, default: "" },
      inspectorSignature: { type: String, default: "" },
      completedAt: { type: Date },
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      customerAcknowledgement: {
        type: mongoose.Schema.Types.Mixed,
        default: () => ({}),
      },
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
