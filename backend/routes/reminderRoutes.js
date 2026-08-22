import express from "express";
import {
  getReminders,
  getReminderById,
  createReminder,
  updateReminder,
  deleteReminder,
} from "../controllers/reminderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getReminders);
router.get("/:id", protect, getReminderById);
router.post("/", protect, createReminder);
router.patch("/:id", protect, updateReminder);
router.delete("/:id", protect, deleteReminder);

export default router;
