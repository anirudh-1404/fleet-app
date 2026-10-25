import express from "express";
import {
  loginUser,
  getMe,
  registerUser,
  sendOtp,
  verifyOtp,
  verifyLoginOtp,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/verify-login-otp", verifyLoginOtp);
router.post("/register", registerUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/me", protect, getMe);

export default router;
