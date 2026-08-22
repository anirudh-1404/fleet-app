import express from "express";
import {
  createInspection,
  getInspectionById,
  getTodayInspection,
  getMyInspections,
  getManagerInspections,
} from "../controllers/inspectionController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, requireRole("driver"), createInspection);
router.get("/driver/today", protect, requireRole("driver"), getTodayInspection);
router.get("/driver/my", protect, requireRole("driver"), getMyInspections);

router.get("/manager/all", protect, requireRole("manager"), getManagerInspections);
router.get("/:id", protect, getInspectionById);

export default router;
