import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ROUTES from "../../constants/routes";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

export default function OtpVerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { login, verifyLoginOtp } = useAuth();

  const isLoginMode = route?.params?.mode === "login";
  const registrationData = route?.params?.registrationData || {};
  const email = (route?.params?.email || registrationData.email || "").trim();

  const {
    name = "",
    password = "",
    phone = "",
    role = "manager",
    planTitle = isLoginMode ? "Security Verification" : "Account Setup",
  } = registrationData;

  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputRef = useRef(null);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  // Auto-focus input & trigger initial OTP dispatch for registration mode
  useEffect(() => {
    if (!isLoginMode && email) {
      authService.sendOtp(email.toLowerCase()).catch((err) => {
        const msg = err.response?.data?.message || "Failed to dispatch verification email.";
        setErrorMessage(msg);
      });
    }
    const focusTimeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(focusTimeout);
  }, []);

  const handleOtpChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, 4);
    setOtp(cleaned);
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setOtp("");
    setErrorMessage("");
    setTimer(30);
    setCanResend(false);

    try {
      await authService.sendOtp(email.toLowerCase());
      const successMsg = `A new 4-digit verification code has been sent to ${email}`;
      if (Platform.OS === "web") {
        window.alert(successMsg);
      } else {
        Alert.alert("Code Resent", successMsg);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Could not resend code. Please try again.";
      setErrorMessage(msg);
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Resend Failed", msg);
      }
    }
  };

  const handleVerify = async () => {
    if (otp.length < 4) {
      setErrorMessage("Please enter all 4 digits of your verification code.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (isLoginMode) {
        // --- 2FA LOGIN VERIFICATION ---
        const loginData = await verifyLoginOtp(email.toLowerCase(), otp);
        if (loginData.role === "workshop_manager") {
          navigation.reset({ index: 0, routes: [{ name: "WorkshopStack" }] });
          return;
        } else if (loginData.role === "workshop_employee") {
          navigation.reset({ index: 0, routes: [{ name: "WorkshopEmployeeStack" }] });
          return;
        } else if (loginData.role === "rental_owner") {
          navigation.reset({ index: 0, routes: [{ name: "RentalStack" }] });
          return;
        } else if (loginData.role === "manager") {
          navigation.reset({ index: 0, routes: [{ name: "ManagerStack" }] });
          return;
        } else if (loginData.role === "driver") {
          navigation.reset({ index: 0, routes: [{ name: "DriverStack" }] });
          return;
        }
      } else {
        // --- REGISTRATION FLOW ---
        // 1. Verify OTP with backend
        await authService.verifyOtp(email.toLowerCase(), otp);

        // 2. Complete user registration
        await authService.register(
          name.trim(),
          email.toLowerCase(),
          password,
          phone.trim(),
          role
        );

        // 3. Automatically log the user in
        try {
          const loginData = await login(email.toLowerCase(), password);
          if (loginData.role === "workshop_manager") {
            navigation.reset({ index: 0, routes: [{ name: "WorkshopStack" }] });
            return;
          } else if (loginData.role === "rental_owner") {
            navigation.reset({ index: 0, routes: [{ name: "RentalStack" }] });
            return;
          } else if (loginData.role === "manager") {
            navigation.reset({ index: 0, routes: [{ name: "ManagerStack" }] });
            return;
          }
        } catch (loginErr) {
          console.warn("Auto-login failed after registration, navigating to Login screen:", loginErr);
        }

        // Fallback if auto-login role redirect did not trigger
        Alert.alert(
          "Verification Successful 🎉",
          "Your account has been verified and created successfully. Please sign in to continue.",
          [
            {
              text: "Sign In",
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: ROUTES.LOGIN, params: { prefillEmail: email } }],
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Verification error after OTP:", error);
      const serverMsg =
        error.response?.data?.message ||
        error.message ||
        "Invalid or expired verification code. Please try again.";
      setErrorMessage(serverMsg);
      if (Platform.OS === "web") {
        window.alert(serverMsg);
      } else {
        Alert.alert("Verification Failed", serverMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Render 4 OTP digit boxes
  const renderOtpBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 4; i++) {
      const digit = otp[i] || "";
      const isFocused = otp.length === i;
      const isError = Boolean(errorMessage);

      boxes.push(
        <View
          key={i}
          style={{
            width: 64,
            height: 64,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: isError
              ? "#EF4444"
              : isFocused
              ? "#2563EB"
              : digit
              ? "#93C5FD"
              : "#E2E8F0",
            backgroundColor: isError
              ? "#FEF2F2"
              : isFocused
              ? "#EFF6FF"
              : digit
              ? "#F8FAFC"
              : "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: isFocused ? "#2563EB" : "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isFocused ? 0.15 : 0.03,
            shadowRadius: 6,
            elevation: isFocused ? 3 : 1,
          }}
        >
          <Text
            style={{
              fontSize: 26,
              fontWeight: "700",
              color: isError ? "#DC2626" : "#0F172A",
            }}
          >
            {digit}
          </Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Navigation Bar */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderColor: "#F1F5F9",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#F8FAFC",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text
          style={{
            marginLeft: 14,
            fontSize: 16,
            fontWeight: "700",
            color: "#0F172A",
          }}
        >
          {planTitle}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 32,
            paddingBottom: 40,
            flexGrow: 1,
            justifyContent: "space-between",
          }}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <View>
            {/* Header Badge & Icon */}
            <View style={{ alignItems: "center", marginBottom: 28 }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 24,
                  backgroundColor: "#EFF6FF",
                  borderWidth: 1,
                  borderColor: "#DBEAFE",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons name="mail-unread-outline" size={36} color="#2563EB" />
              </View>

              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "800",
                  color: "#0F172A",
                  textAlign: "center",
                  letterSpacing: -0.5,
                }}
              >
                {isLoginMode ? "Security Verification" : "Verify Your Email"}
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: "#64748B",
                  textAlign: "center",
                  marginTop: 8,
                  lineHeight: 22,
                  paddingHorizontal: 12,
                }}
              >
                {isLoginMode
                  ? "Enter the 4-digit code sent to your email to complete sign in"
                  : "We have sent a 4-digit verification code to"}
              </Text>

              {/* Email display pill */}
              <View
                style={{
                  marginTop: 8,
                  backgroundColor: "#F1F5F9",
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Ionicons name="mail-outline" size={14} color="#475569" />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#1E293B",
                  }}
                >
                  {email || "your email address"}
                </Text>
              </View>
            </View>

            {/* OTP Input Container */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#475569",
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                Enter the 4-digit code below
              </Text>

              {/* Clickable Area that focuses the invisible TextInput */}
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => inputRef.current?.focus()}
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 12,
                  marginVertical: 4,
                }}
              >
                {renderOtpBoxes()}
              </TouchableOpacity>

              {/* Hidden TextInput overlaid to capture keystrokes */}
              <TextInput
                ref={inputRef}
                value={otp}
                onChangeText={handleOtpChange}
                maxLength={4}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                caretHidden={true}
                style={{
                  position: "absolute",
                  opacity: 0,
                  height: 1,
                  width: 1,
                }}
              />

              {/* Error Message */}
              {errorMessage ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 14,
                    gap: 6,
                  }}
                >
                  <Ionicons name="alert-circle" size={16} color="#DC2626" />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: "#DC2626",
                      textAlign: "center",
                    }}
                  >
                    {errorMessage}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Resend Code Section */}
            <View
              style={{
                alignItems: "center",
                marginTop: 16,
              }}
            >
              {canResend ? (
                <TouchableOpacity
                  onPress={handleResendOtp}
                  activeOpacity={0.7}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Ionicons name="refresh-outline" size={16} color="#2563EB" />
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#2563EB" }}>
                    Resend Code
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={{ fontSize: 13, color: "#64748B" }}>
                  Resend code in{" "}
                  <Text style={{ fontWeight: "700", color: "#0F172A" }}>
                    {formatTimer(timer)}
                  </Text>
                </Text>
              )}
            </View>
          </View>

          {/* Bottom Action Section */}
          <View style={{ marginTop: 32 }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleVerify}
              disabled={isSubmitting || otp.length < 4}
              style={{
                height: 52,
                backgroundColor: otp.length === 4 && !isSubmitting ? "#2563EB" : "#94A3B8",
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
                shadowColor: "#2563EB",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: otp.length === 4 && !isSubmitting ? 0.2 : 0,
                shadowRadius: 8,
                elevation: otp.length === 4 && !isSubmitting ? 4 : 0,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
                    {isLoginMode ? "Verify & Sign In" : "Verify & Continue"}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginTop: 16, alignItems: "center", paddingVertical: 8 }}
            >
              <Text style={{ fontSize: 13, color: "#64748B" }}>
                {isLoginMode ? "Need to change account? " : "Need to edit your details? "}
                <Text style={{ fontWeight: "700", color: "#2563EB" }}>
                  {isLoginMode ? "Back to Sign In" : "Go Back"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
