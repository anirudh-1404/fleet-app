import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { sendOtpEmail } from "../utils/emailService.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fleet_app_super_secret_jwt_key_2026", {
    expiresIn: "30d",
  });
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);

      return res.json({
        token,
        role: user.role,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          status: user.status,
          photo: user.photo,
        },
      });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Controller Error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      status: user.status,
      photo: user.photo,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching user profile" });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || "",
      role: role || "manager",
      status: "Active",
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: "Account created successfully",
      token,
      role: user.role,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Register Controller Error:", error);
    return res.status(500).json({ message: error.message || "Server error during registration" });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if an account with this email already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    // Generate random 4-digit numeric OTP (e.g. 1000 - 9999)
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store in Otp collection (clearing any existing OTP for this email)
    await Otp.deleteMany({ email: cleanEmail });
    await Otp.create({ email: cleanEmail, otp: generatedOtp });

    // Send email using Hostinger SMTP
    try {
      await sendOtpEmail(cleanEmail, generatedOtp);
      console.log(`[OTP] Sent verification code to ${cleanEmail}`);
    } catch (mailError) {
      console.error("[OTP] Failed to send email via SMTP:", mailError);
      return res.status(500).json({
        message: "Failed to dispatch email. Please check your email address or try again.",
      });
    }

    return res.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}`,
    });
  } catch (error) {
    console.error("sendOtp Error:", error);
    return res.status(500).json({ message: "Failed to send verification code" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and verification code are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    // Match OTP in database (also allowing demo code 1234 for testing convenience)
    const record = await Otp.findOne({ email: cleanEmail, otp: cleanOtp });

    if (!record && cleanOtp !== "1234") {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    // Clear used OTP
    if (record) {
      await Otp.deleteMany({ email: cleanEmail });
    }

    return res.json({ success: true, message: "Code verified successfully" });
  } catch (error) {
    console.error("verifyOtp Error:", error);
    return res.status(500).json({ message: "Failed to verify code" });
  }
};
