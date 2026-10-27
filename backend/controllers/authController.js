import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { sendOtpEmail } from "../utils/emailService.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fleet_app_super_secret_jwt_key_2026", {
    expiresIn: "30d",
  });
};

const getModuleLabel = (role) => {
  if (role === "workshop_manager" || role === "workshop") return "Workshop Management";
  if (role === "rental_owner" || role === "rental") return "Vehicle Rental";
  if (role === "manager" || role === "fleet") return "Fleet Management";
  return role || "this";
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate random 4-digit OTP for 2FA login verification
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store in Otp collection
    await Otp.deleteMany({ email: cleanEmail });
    await Otp.create({ email: cleanEmail, otp: generatedOtp });

    // Send email using Hostinger SMTP with fallback
    try {
      await sendOtpEmail(cleanEmail, generatedOtp, "login");
      console.log(`[OTP] Sent login verification code to ${cleanEmail}`);
    } catch (mailError) {
      console.warn("[OTP] Notice: Could not send email via SMTP, OTP saved to DB:", mailError.message);
    }

    const userModules = user.modules && user.modules.length > 0 ? user.modules : [user.role];

    return res.json({
      requiresOtp: true,
      name: user.name,
      email: user.email,
      role: user.role,
      modules: userModules,
      message: "A verification code has been sent to your email",
    });
  } catch (error) {
    console.error("Login Controller Error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and verification code are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    // Match OTP in database (strictly real OTP from email)
    const record = await Otp.findOne({ email: cleanEmail, otp: cleanOtp });

    if (!record) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    await Otp.deleteMany({ email: cleanEmail });

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = generateToken(user._id);
    const userModules = user.modules && user.modules.length > 0 ? user.modules : [user.role];

    return res.json({
      token,
      role: user.role,
      modules: userModules,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        modules: userModules,
        phone: user.phone,
        status: user.status,
        photo: user.photo,
      },
    });
  } catch (error) {
    console.error("verifyLoginOtp Error:", error);
    return res.status(500).json({ message: "Server error verifying code" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userModules = user.modules && user.modules.length > 0 ? user.modules : [user.role];
    return res.json({
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      modules: userModules,
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

    const cleanEmail = email.toLowerCase().trim();
    const assignedRole = role || "manager";
    const moduleName = getModuleLabel(assignedRole);

    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      const existingModules = user.modules && user.modules.length > 0 ? user.modules : [user.role];
      if (existingModules.includes(assignedRole)) {
        return res.status(400).json({
          message: `An account with this email already exists for ${moduleName} module`,
          alreadyExistsForModule: true,
        });
      }

      // Add new module to existing user account under same email
      if (!user.modules.includes(assignedRole)) {
        user.modules.push(assignedRole);
      }
      if (user.role && !user.modules.includes(user.role)) {
        user.modules.push(user.role);
      }
      user.role = assignedRole; // active role for current registration
      if (phone && !user.phone) user.phone = phone.trim();
      await user.save();
    } else {
      user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password,
        phone: phone || "",
        role: assignedRole,
        modules: [assignedRole],
        status: "Active",
      });
    }

    const token = generateToken(user._id);
    const userModules = user.modules && user.modules.length > 0 ? user.modules : [user.role];

    return res.status(201).json({
      message: "Account created successfully",
      token,
      role: user.role,
      modules: userModules,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        modules: userModules,
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
    const { email, type = "register", module: requestedModule } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });

    if (type === "register" && existingUser) {
      const existingModules = existingUser.modules && existingUser.modules.length > 0
        ? existingUser.modules
        : [existingUser.role];
      const checkModule = requestedModule || "manager";
      if (existingModules.includes(checkModule)) {
        const moduleName = getModuleLabel(checkModule);
        return res.status(400).json({
          message: `An account with this email already exists for ${moduleName} module`,
          alreadyExistsForModule: true,
        });
      }
    }

    if (type === "login" && !existingUser) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    // Generate random 4-digit numeric OTP (e.g. 1000 - 9999)
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store in Otp collection (clearing any existing OTP for this email)
    await Otp.deleteMany({ email: cleanEmail });
    await Otp.create({ email: cleanEmail, otp: generatedOtp });

    // Send email using Hostinger SMTP with fallback
    try {
      await sendOtpEmail(cleanEmail, generatedOtp, type);
      console.log(`[OTP] Sent verification code to ${cleanEmail}`);
    } catch (mailError) {
      console.warn("[OTP] Notice: Could not send email via SMTP, OTP saved to DB:", mailError.message);
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

    // Match OTP in database (strictly real OTP from email)
    const record = await Otp.findOne({ email: cleanEmail, otp: cleanOtp });

    if (!record) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    // Clear used OTP
    await Otp.deleteMany({ email: cleanEmail });

    return res.json({ success: true, message: "Code verified successfully" });
  } catch (error) {
    console.error("verifyOtp Error:", error);
    return res.status(500).json({ message: "Failed to verify code" });
  }
};

export const forgotPasswordSendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found with this email address" });
    }

    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    await Otp.deleteMany({ email: cleanEmail });
    await Otp.create({ email: cleanEmail, otp: generatedOtp });

    try {
      await sendOtpEmail(cleanEmail, generatedOtp, "password_reset");
      console.log(`[OTP] Sent password reset code to ${cleanEmail}`);
    } catch (mailError) {
      console.warn("[OTP] Notice: Could not send password reset email:", mailError.message);
    }

    return res.json({
      success: true,
      message: "Password reset verification code sent to your email",
    });
  } catch (error) {
    console.error("forgotPasswordSendOtp Error:", error);
    return res.status(500).json({ message: error.message || "Failed to send reset code" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, verification code, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const record = await Otp.findOne({ email: cleanEmail, otp: cleanOtp });
    if (!record) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email address" });
    }

    user.password = newPassword; // Automatically hashed by User model pre-save hook
    await user.save();
    await Otp.deleteMany({ email: cleanEmail });

    return res.json({
      success: true,
      message: "Password has been reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    console.error("resetPassword Error:", error);
    return res.status(500).json({ message: error.message || "Failed to reset password" });
  }
};
