import express from "express";
import { getDueServices, getServiceById, updateServiceStatus } from "../controllers/serviceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/due", protect, getDueServices);
router.get("/:id", protect, getServiceById);
router.patch("/:id/status", protect, updateServiceStatus);

export default router;
