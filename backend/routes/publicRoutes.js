import express from "express";
import path from "path";
import {
  getPublicBookingFormInfo,
  submitPublicBooking,
} from "../controllers/workshopInquiryController.js";

const router = express.Router();

// Public API endpoints for booking
router.get("/bookings/:adminId", getPublicBookingFormInfo);
router.post("/bookings/:adminId", submitPublicBooking);

export default router;
