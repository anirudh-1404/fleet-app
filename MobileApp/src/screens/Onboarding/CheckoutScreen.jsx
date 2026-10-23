import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ROUTES from "../../constants/routes";

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const selectedPlan = route?.params?.plan || "fleet";
  const isRental = selectedPlan === "rental";
  const isWorkshop = selectedPlan === "workshop";

  const getPlanTitle = () => {
    if (isWorkshop) return "Workshop Manager Setup";
    if (isRental) return "Rental Owner Setup";
    return "Fleet Manager Setup";
  };

  const getPlanLabel = () => {
    if (isWorkshop) return "Workshop Management (Free)";
    if (isRental) return "Vehicle Rentals (Free)";
    return "Fleet Management (Free)";
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 16);
    const matches = cleaned.match(/.{1,4}/g);
    return matches ? matches.join(" ") : cleaned;
  };

  const handleCheckout = () => {
    setValidationError("");

    if (!name.trim()) {
      const err = "Please enter your full name.";
      setValidationError(err);
      if (Platform.OS === "web") window.alert(err);
      else Alert.alert("Missing Name", err);
      return;
    }

    if (!email.trim()) {
      const err = "Please enter your email address.";
      setValidationError(err);
      if (Platform.OS === "web") window.alert(err);
      else Alert.alert("Missing Email", err);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      const err = "Please enter a valid email address (e.g. name@example.com).";
      setValidationError(err);
      if (Platform.OS === "web") window.alert(err);
      else Alert.alert("Invalid Email", err);
      return;
    }

    if (!phone.trim()) {
      const err = "Please enter your phone number.";
      setValidationError(err);
      if (Platform.OS === "web") window.alert(err);
      else Alert.alert("Missing Phone", err);
      return;
    }

    if (!password || password.length < 6) {
      const err = "Password must be at least 6 characters long.";
      setValidationError(err);
      if (Platform.OS === "web") window.alert(err);
      else Alert.alert("Weak Password", err);
      return;
    }

    let assignedRole = "manager";
    if (isWorkshop) assignedRole = "workshop_manager";
    else if (isRental) assignedRole = "rental_owner";

    // Navigate to OTP verification screen with registration payload
    navigation.navigate(ROUTES.VERIFY_OTP, {
      registrationData: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        role: assignedRole,
        planTitle: getPlanTitle(),
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View
        style={{
          width: "100%",
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderColor: "#E2E8F0",
        }}
      >
        <View
          style={{
            maxWidth: 640,
            width: "100%",
            alignSelf: "center",
            paddingHorizontal: 20,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>
            {getPlanTitle()}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 40,
            width: "100%",
            maxWidth: 640,
            alignSelf: "center",
          }}
          keyboardShouldPersistTaps="always"
        >
          {/* Plan chip */}
          <View
            style={{
              backgroundColor: "#EFF6FF",
              borderRadius: 10,
              padding: 12,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E40AF" }}>
              Selected: {getPlanLabel()}
            </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#2563EB" }}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A", marginBottom: 14 }}>
              Account Information
            </Text>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. John Doe"
                placeholderTextColor="#94A3B8"
                style={{
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1,
                  borderColor: "#CBD5E1",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  height: 44,
                  fontSize: 14,
                  color: "#0F172A",
                }}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="john@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#94A3B8"
                style={{
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1,
                  borderColor: "#CBD5E1",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  height: 44,
                  fontSize: 14,
                  color: "#0F172A",
                }}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Phone Number</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 555-0199"
                keyboardType="phone-pad"
                placeholderTextColor="#94A3B8"
                style={{
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1,
                  borderColor: "#CBD5E1",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  height: 44,
                  fontSize: 14,
                  color: "#0F172A",
                }}
              />
            </View>

            <View>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter a secure password"
                secureTextEntry
                placeholderTextColor="#94A3B8"
                style={{
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1,
                  borderColor: "#CBD5E1",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  height: 44,
                  fontSize: 14,
                  color: "#0F172A",
                }}
              />
            </View>
          </View>

          {/* Free Plan Badge / No Credit Card Needed */}
          <View
            style={{
              backgroundColor: "#F0FDF4",
              borderWidth: 1,
              borderColor: "#BBF7D0",
              borderRadius: 14,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#15803D" }}>
                100% Free Plan Active
              </Text>
              <Text style={{ fontSize: 12, color: "#166534", marginTop: 2 }}>
                No credit card or payment details required. Instant access.
              </Text>
            </View>
          </View>

          {/* Validation Error Banner */}
          {validationError ? (
            <View
              style={{
                backgroundColor: "#FEF2F2",
                borderWidth: 1,
                borderColor: "#FCA5A5",
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text style={{ flex: 1, fontSize: 13, color: "#DC2626", fontWeight: "600" }}>
                {validationError}
              </Text>
            </View>
          ) : null}

          {/* Submit */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCheckout}
            style={{
              height: 52,
              backgroundColor: "#2563EB",
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
              Next: Verify Email
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
