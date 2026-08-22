import express from "express";
import {
  getFuelLogs,
  getMyFuelLogs,
  getFuelById,
  createFuelLog,
  updateFuelLog,
  deleteFuelLog,
} from "../controllers/fuelController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getFuelLogs);
router.get("/my-logs", protect, getMyFuelLogs);
router.get("/:id", protect, getFuelById);
router.post("/", protect, createFuelLog);
router.patch("/:id", protect, updateFuelLog);
router.delete("/:id", protect, deleteFuelLog);

export default router;
