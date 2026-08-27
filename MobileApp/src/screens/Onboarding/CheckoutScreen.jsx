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
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { login } = useAuth();
  const selectedPlan = route?.params?.plan || "fleet";
  const isRental = selectedPlan === "rental";
  const isWorkshop = selectedPlan === "workshop";

  const getPlanTitle = () => {
    if (isWorkshop) return "Workshop Manager Setup";
    if (isRental) return "Rental Owner Setup";
    return "Fleet Manager Setup";
  };

  const getPlanLabel = () => {
    if (isWorkshop) return "Workshop Management ($199/mo)";
    if (isRental) return "Vehicle Rentals ($129/mo)";
    return "Fleet Management ($149/mo)";
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 16);
    const matches = cleaned.match(/.{1,4}/g);
    return matches ? matches.join(" ") : cleaned;
  };

  const handleCheckout = async () => {
    if (!name.trim() || !email.trim() || !password || !phone.trim()) {
      Alert.alert("Missing Fields", "Please fill in your name, email, phone, and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      let assignedRole = "manager";
      if (isWorkshop) assignedRole = "workshop_manager";
      else if (isRental) assignedRole = "rental_owner";

      await authService.register(name.trim(), email.trim(), password, phone.trim(), assignedRole);

      // Automatically log the user in
      try {
        const loginData = await login(email.trim(), password);
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

      Alert.alert(
        "Account Created 🎉",
        `Your ${isWorkshop ? "Workshop Manager" : isRental ? "Rental Owner" : "Fleet Manager"} account is ready. Please sign in to continue.`,
        [
          {
            text: "Sign In",
            onPress: () => {
              navigation.navigate(ROUTES.LOGIN, { prefillEmail: email.trim() });
            },
          },
        ]
      );
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to create account. Please try again.";
      Alert.alert("Registration Error", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{  flex: 1, backgroundColor: "#F8FAFC"  }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderColor: "#E2E8F0",
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>
          {getPlanTitle()}
        </Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
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

          {/* Test Card */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              padding: 16,
              marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>Payment Details</Text>
              <Text style={{ fontSize: 11, color: "#64748B" }}>Demo Mode</Text>
            </View>

            <View style={{ marginBottom: 10 }}>
              <TextInput
                value={cardNumber}
                onChangeText={(v) => setCardNumber(formatCardNumber(v))}
                placeholder="4242 4242 4242 4242"
                keyboardType="numeric"
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

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  value={expiry}
                  onChangeText={setExpiry}
                  placeholder="MM/YY"
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
              <View style={{ flex: 1 }}>
                <TextInput
                  value={cvc}
                  onChangeText={setCvc}
                  placeholder="CVC"
                  keyboardType="numeric"
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
          </View>

          {/* Submit */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCheckout}
            disabled={isSubmitting}
            style={{
              height: 50,
              backgroundColor: "#2563EB",
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
