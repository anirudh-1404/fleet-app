import express from "express";
import { protect } from "../middleware/authMiddleware.js";

// Controllers
import {
  getRentalVehicles,
  getRentalVehicleById,
  createRentalVehicle,
  updateRentalVehicle,
  deleteRentalVehicle,
} from "../controllers/rentalVehicleController.js";

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
} from "../controllers/customerController.js";

import {
  getRentals,
  getRentalById,
  createRental,
  returnRental,
  cancelRental,
  updateRental,
} from "../controllers/rentalController.js";

import { getRentalDashboard } from "../controllers/rentalDashboardController.js";

const router = express.Router();

// Apply auth middleware to all rental routes
router.use(protect);

// Dashboard
router.get("/dashboard", getRentalDashboard);

// Vehicle Endpoints
router.get("/vehicles", getRentalVehicles);
router.post("/vehicles", createRentalVehicle);
router.get("/vehicles/:id", getRentalVehicleById);
router.patch("/vehicles/:id", updateRentalVehicle);
router.delete("/vehicles/:id", deleteRentalVehicle);

// Customer Endpoints
router.get("/customers", getCustomers);
router.post("/customers", createCustomer);
router.get("/customers/:id", getCustomerById);
router.patch("/customers/:id", updateCustomer);

// Rental Booking & Return Endpoints
router.get("/rentals", getRentals);
router.post("/rentals", createRental);
router.get("/rentals/:id", getRentalById);
router.patch("/rentals/:id", updateRental);
router.post("/rentals/:id/return", returnRental);
router.post("/rentals/:id/cancel", cancelRental);

export default router;
