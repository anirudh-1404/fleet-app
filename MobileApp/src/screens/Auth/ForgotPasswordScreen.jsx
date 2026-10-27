import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ROUTES from "../../constants/routes";
import { authService } from "../../services/authService";

const logoImg = require("../../../assets/logo.png");

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();

  // Step 1: "request_otp", Step 2: "verify_and_reset"
  const [step, setStep] = useState("request_otp");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpInputRef = useRef(null);

  // Timer for Step 2 resend
  useEffect(() => {
    let interval;
    if (step === "verify_and_reset" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Step 1: Send OTP to email
  const handleSendOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await authService.forgotPasswordSendOtp(cleanEmail);
      setStep("verify_and_reset");
      setTimer(30);
      setCanResend(false);
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 300);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Could not send reset code. Please verify your email.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP in Step 2
  const handleResend = async () => {
    if (!canResend) return;
    setOtp("");
    setErrorMessage("");
    setTimer(30);
    setCanResend(false);

    try {
      await authService.forgotPasswordSendOtp(email.trim().toLowerCase());
      setSuccessMessage("A fresh verification code has been sent to your email.");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      const msg = err.response?.data?.message || "Could not resend verification code.";
      setErrorMessage(msg);
    }
  };

  // Step 2: Submit OTP & New Password
  const handleResetPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (cleanOtp.length < 4) {
      setErrorMessage("Please enter the complete 4-digit verification code.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-type your password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await authService.resetPassword(cleanEmail, cleanOtp, newPassword);

      const alertMsg = "Your password has been reset successfully! Please sign in with your new password.";
      if (Platform.OS === "web") {
        window.alert(alertMsg);
        navigation.navigate(ROUTES.LOGIN, { prefillEmail: cleanEmail });
      } else {
        Alert.alert("Password Updated 🎉", alertMsg, [
          {
            text: "Sign In",
            onPress: () => navigation.navigate(ROUTES.LOGIN, { prefillEmail: cleanEmail }),
          },
        ]);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to reset password. Please verify the code and try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderColor: "#F1F5F9",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            if (step === "verify_and_reset") {
              setStep("request_otp");
              setErrorMessage("");
            } else {
              navigation.goBack();
            }
          }}
          style={{ width: 40, height: 40, justifyContent: "center" }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A", marginLeft: 4 }}>
          {step === "request_otp" ? "Reset Password" : "Set New Password"}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 40,
            maxWidth: 520,
            width: "100%",
            alignSelf: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Icon */}
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Image
              source={logoImg}
              style={{ width: 64, height: 64, borderRadius: 16 }}
              resizeMode="contain"
            />
          </View>

          {/* Heading */}
          <View style={{ marginBottom: 24, alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "800", color: "#01311B", textAlign: "center" }}>
              {step === "request_otp" ? "Forgot Your Password?" : "Verify & Reset"}
            </Text>
            <Text style={{ fontSize: 14, color: "#64748B", marginTop: 8, textAlign: "center", lineHeight: 22 }}>
              {step === "request_otp"
                ? "Enter your registered email address and we'll send you a 4-digit verification code to reset your password."
                : `Enter the 4-digit code sent to ${email} and choose a strong new password.`}
            </Text>
          </View>

          {/* Inline Error Banner */}
          {errorMessage ? (
            <View
              style={{
                backgroundColor: "#FEF2F2",
                borderColor: "#FCA5A5",
                borderWidth: 1,
                borderRadius: 12,
                padding: 14,
                marginBottom: 20,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text style={{ color: "#DC2626", fontSize: 13, fontWeight: "600", flex: 1, lineHeight: 18 }}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* Inline Success Banner */}
          {successMessage ? (
            <View
              style={{
                backgroundColor: "#ECFDF5",
                borderColor: "#A7F3D0",
                borderWidth: 1,
                borderRadius: 12,
                padding: 14,
                marginBottom: 20,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
              <Text style={{ color: "#059669", fontSize: 13, fontWeight: "600", flex: 1 }}>
                {successMessage}
              </Text>
            </View>
          ) : null}

          {step === "request_otp" ? (
            /* STEP 1: ENTER EMAIL */
            <View style={{ gap: 18 }}>
              <View>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 6 }}>
                  Registered Email Address
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    height: 52,
                  }}
                >
                  <Ionicons name="mail-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
                  <TextInput
                    value={email}
                    onChangeText={(txt) => {
                      setEmail(txt);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="e.g. manager@fleet.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{ flex: 1, fontSize: 15, color: "#0F172A" }}
                  />
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                disabled={isSubmitting}
                onPress={handleSendOtp}
                style={{
                  height: 52,
                  backgroundColor: "#01311B",
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 6,
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
                    Send Reset Code
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* STEP 2: ENTER OTP & NEW PASSWORD */
            <View style={{ gap: 16 }}>
              {/* 4-Digit OTP Input */}
              <View>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 6 }}>
                  4-Digit Verification Code
                </Text>
                <View
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderWidth: 2,
                    borderColor: "#A7F3D0",
                    borderRadius: 12,
                    height: 56,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TextInput
                    ref={otpInputRef}
                    value={otp}
                    onChangeText={(txt) => {
                      const clean = txt.replace(/[^0-9]/g, "").slice(0, 4);
                      setOtp(clean);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="• • • •"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={4}
                    style={{
                      fontSize: 28,
                      fontWeight: "800",
                      letterSpacing: 16,
                      textAlign: "center",
                      color: "#01311B",
                      width: "100%",
                    }}
                  />
                </View>

                {/* Resend Countdown */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                  <Text style={{ fontSize: 12, color: "#64748B" }}>
                    Didn't receive the code?
                  </Text>
                  {canResend ? (
                    <TouchableOpacity onPress={handleResend}>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#059669" }}>
                        Resend Code
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={{ fontSize: 12, fontWeight: "600", color: "#94A3B8" }}>
                      Resend in {timer}s
                    </Text>
                  )}
                </View>
              </View>

              {/* New Password */}
              <View>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 6 }}>
                  New Password
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    height: 52,
                  }}
                >
                  <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
                  <TextInput
                    value={newPassword}
                    onChangeText={(txt) => {
                      setNewPassword(txt);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="At least 6 characters"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    style={{ flex: 1, fontSize: 15, color: "#0F172A" }}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 6 }}>
                  Confirm New Password
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    height: 52,
                  }}
                >
                  <Ionicons name="shield-checkmark-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={(txt) => {
                      setConfirmPassword(txt);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="Re-type new password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    style={{ flex: 1, fontSize: 15, color: "#0F172A" }}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Reset Password Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={isSubmitting}
                onPress={handleResetPassword}
                style={{
                  height: 52,
                  backgroundColor: "#01311B",
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 10,
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
                    Update Password & Sign In
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Back to Login link */}
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.LOGIN)}
            style={{ marginTop: 24, alignItems: "center" }}
          >
            <Text style={{ fontSize: 14, color: "#64748B" }}>
              Remember your password?{" "}
              <Text style={{ color: "#059669", fontWeight: "700" }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
