import express from "express";
import { getOperationsData } from "../controllers/operationsController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, requireRole("manager"), getOperationsData);

export default router;
