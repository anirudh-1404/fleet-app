import express from "express";
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  assignDriver,
  getMyVehicle,
} from "../controllers/vehicleController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getVehicles);
router.get("/driver/me", protect, getMyVehicle);
router.get("/:id", protect, getVehicleById);

router.post("/", protect, requireRole("manager"), createVehicle);
router.patch("/:id", protect, requireRole("manager"), updateVehicle);
router.delete("/:id", protect, requireRole("manager"), deleteVehicle);
router.patch("/:id/assign-driver", protect, requireRole("manager"), assignDriver);

export default router;
