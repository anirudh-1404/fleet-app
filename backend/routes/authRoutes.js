import express from "express";
import {
  loginUser,
  getMe,
  registerUser,
  sendOtp,
  verifyOtp,
  verifyLoginOtp,
  forgotPasswordSendOtp,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

import { sendOtpEmail } from "../utils/emailService.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/verify-login-otp", verifyLoginOtp);
router.post("/register", registerUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password/send-otp", forgotPasswordSendOtp);
router.post("/forgot-password/reset", resetPassword);
router.get("/me", protect, getMe);

router.get("/test-smtp", async (req, res) => {
  try {
    const targetEmail = req.query.email || "info@workfle.com";
    const info = await sendOtpEmail(targetEmail, "9999");
    return res.json({ success: true, messageId: info.messageId, accepted: info.accepted });
  } catch (err) {
    console.error("[Test SMTP Error]:", err);
    return res.status(500).json({ success: false, error: err.message, code: err.code });
  }
});

export default router;
