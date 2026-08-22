import express from "express";
import {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
} from "../controllers/driverController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getDrivers);
router.get("/:id", protect, getDriverById);

router.post("/", protect, requireRole("manager"), createDriver);
router.patch("/:id", protect, requireRole("manager"), updateDriver);
router.delete("/:id", protect, requireRole("manager"), deleteDriver);

export default router;
