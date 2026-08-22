import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ROUTES from "../../constants/routes";

import CustomInput from "../../components/inputs/CustomInput";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import { authService } from "../../services/authService";

export default function CheckoutScreen() {
  const navigation = useNavigation();

  // Manager Account Setup Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Sample Card Details Fields
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

  const formatExpiry = (text) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  };

  const handleCheckout = async () => {
    if (!name.trim() || !email.trim() || !password || !phone.trim()) {
      Alert.alert("Missing Profile Details", "Please fill in all account profile fields.");
      return;
    }

    if (!cardNumber.trim() || !expiry.trim() || !cvc.trim()) {
      Alert.alert("Missing Payment Details", "Please enter valid sample card payment details.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Call backend API to register Manager user
      await authService.register(name, email, password, phone, "manager");

      Alert.alert(
        "Purchase & Setup Successful 🎉",
        "Your Manager Fleet Account has been created successfully! Please sign in with your email and password.",
        [
          {
            text: "Go to Login",
            onPress: () => {
              navigation.navigate(ROUTES.LOGIN, { prefillEmail: email.trim() });
            },
          },
        ]
      );
    } catch (error) {
      const errorMsg =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || "Failed to create account. Please try again.";
      Alert.alert("Registration Error", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: Platform.OS === "ios" ? 12 : 20,
            paddingBottom: 40,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] items-center justify-center"
              style={{
                shadowColor: "#0F172A",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.03,
                shadowRadius: 6,
                elevation: 1,
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>

            <View className="px-3.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
              <Text className="text-xs font-bold text-[#047857] uppercase tracking-wider">
                Step 2 of 2 • Checkout
              </Text>
            </View>
          </View>

          <Text className="text-2xl font-extrabold text-[#0F172A] tracking-tight mb-1">
            Account & Payment Setup
          </Text>
          <Text className="text-xs text-[#64748B] mb-6">
            Set up your manager profile and complete sample subscription checkout.
          </Text>

          {/* Section 1: Profile Details */}
          <View className="bg-white border border-[#E2E8F0] rounded-[24px] p-5 mb-5 shadow-sm">
            <View className="flex-row items-center mb-4 pb-3 border-b border-[#F1F5F9]">
              <View className="w-8 h-8 rounded-lg bg-[#EFF6FF] items-center justify-center mr-2.5">
                <Ionicons name="person-outline" size={18} color="#2563EB" />
              </View>
              <Text className="text-base font-bold text-[#0F172A]">Manager Profile Details</Text>
            </View>

            {/* Name */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-[#334155] mb-1.5 uppercase tracking-wider">
                Full Name
              </Text>
              <CustomInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Michael Johnson"
                leftIcon="person-outline"
              />
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-[#334155] mb-1.5 uppercase tracking-wider">
                Manager Email Address
              </Text>
              <CustomInput
                value={email}
                onChangeText={setEmail}
                placeholder="e.g. manager@fleet.com"
                keyboardType="email-address"
                leftIcon="mail-outline"
              />
            </View>

            {/* Phone */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-[#334155] mb-1.5 uppercase tracking-wider">
                Phone Number
              </Text>
              <CustomInput
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. +61 412 345 678"
                keyboardType="phone-pad"
                leftIcon="call-outline"
              />
            </View>

            {/* Password */}
            <View className="mb-1">
              <Text className="text-xs font-bold text-[#334155] mb-1.5 uppercase tracking-wider">
                Set Account Password
              </Text>
              <CustomInput
                value={password}
                onChangeText={setPassword}
                placeholder="Choose password"
                secureTextEntry
                leftIcon="lock-closed-outline"
              />
            </View>
          </View>

          {/* Section 2: Sample Payment Card Details */}
          <View className="bg-white border border-[#E2E8F0] rounded-[24px] p-5 mb-6 shadow-sm">
            <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-[#F1F5F9]">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-[#F5F3FF] items-center justify-center mr-2.5">
                  <Ionicons name="card-outline" size={18} color="#7C3AED" />
                </View>
                <Text className="text-base font-bold text-[#0F172A]">Payment Card (Sample)</Text>
              </View>
              <View className="px-2 py-0.5 rounded bg-[#F1F5F9]">
                <Text className="text-[10px] font-bold text-[#64748B]">DEMO MODE</Text>
              </View>
            </View>

            {/* Cardholder Name */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-[#334155] mb-1.5 uppercase tracking-wider">
                Cardholder Name
              </Text>
              <CustomInput
                value={cardName}
                onChangeText={setCardName}
                placeholder="Name on card"
                leftIcon="person-circle-outline"
              />
            </View>

            {/* Card Number */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-[#334155] mb-1.5 uppercase tracking-wider">
                Card Number
              </Text>
              <CustomInput
                value={cardNumber}
                onChangeText={(val) => setCardNumber(formatCardNumber(val))}
                placeholder="4242 4242 4242 4242"
                keyboardType="numeric"
                leftIcon="card-outline"
              />
            </View>

            {/* Expiry & CVC */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#334155] mb-1.5 uppercase tracking-wider">
                  Expiry (MM/YY)
                </Text>
                <CustomInput
                  value={expiry}
                  onChangeText={(val) => setExpiry(formatExpiry(val))}
                  placeholder="12/28"
                  keyboardType="numeric"
                  leftIcon="calendar-outline"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#334155] mb-1.5 uppercase tracking-wider">
                  CVC / CVV
                </Text>
                <CustomInput
                  value={cvc}
                  onChangeText={(val) => setCvc(val.replace(/\D/g, "").slice(0, 4))}
                  placeholder="123"
                  keyboardType="numeric"
                  secureTextEntry
                  leftIcon="shield-checkmark-outline"
                />
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCheckout}
            disabled={isSubmitting}
            className="h-14 rounded-[24px] bg-[#2563EB] items-center justify-center flex-row shadow-lg shadow-blue-500/25"
            style={{
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 14,
              elevation: 4,
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="lock-closed" size={18} color="white" style={{ marginRight: 8 }} />
                <Text className="text-white text-base font-bold">
                  Complete Account Setup
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
