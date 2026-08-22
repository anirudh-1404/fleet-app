import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import CustomInput from "../../components/inputs/CustomInput";
import PrimaryButton from "../../components/buttons/PrimaryButton";

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!email) {
      Alert.alert("Input Required", "Please enter your email address.");
      return;
    }
    Alert.alert(
      "Reset Link Sent",
      `A password reset link has been sent to: ${email}`,
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 flex-row items-center mb-10">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-white border border-[#E8EDF3] items-center justify-center mr-3"
          style={{
            shadowColor: "#111827",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.015,
            shadowRadius: 10,
            elevation: 1,
          }}
        >
          <Ionicons name="arrow-back-outline" size={20} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-[#111827]">Reset Password</Text>
      </View>

      <View className="px-6 flex-1 justify-between pb-8">
        <View>
          <Text className="text-2xl font-bold text-[#111827]">Forgot Password?</Text>
          <Text className="text-sm text-[#6B7280] mt-2 mb-8 leading-5">
            Enter your email address and we'll send you instructions to reset your password.
          </Text>

          <View className="mb-8">
            <Text className="text-sm font-medium text-gray-700 mb-2">Email Address</Text>
            <CustomInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              leftIcon="mail-outline"
            />
          </View>

          <PrimaryButton title="Send Reset Link" onPress={handleSubmit} />
        </View>
      </View>
    </SafeAreaView>
  );
}
