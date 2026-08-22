import express from "express";
import { startJourney, getTodayJourney, endJourney } from "../controllers/journeyController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start", protect, requireRole("driver"), startJourney);
router.get("/today", protect, requireRole("driver"), getTodayJourney);
router.post("/end", protect, requireRole("driver"), endJourney);

export default router;
