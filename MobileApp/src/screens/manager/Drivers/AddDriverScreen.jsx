import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import CustomInput from "../../../components/inputs/CustomInput";
import PrimaryButton from "../../../components/buttons/PrimaryButton";
import { driverService } from "../../../services/driverService";

const EMPLOYMENT_OPTIONS = ["Full Time", "Part Time", "Contract", "Casual"];

export default function AddDriverScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Required Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Optional Fields
  const [licence, setLicence] = useState("");
  const [licenceExpiry, setLicenceExpiry] = useState("");
  const [licenceClass, setLicenceClass] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("Full Time");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Missing Fields", "Please enter driver name, email, and initial password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await driverService.createDriver({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        status: "Active",
        licence: licence.trim(),
        licenceExpiry: licenceExpiry.trim(),
        licenceClass: licenceClass.trim(),
        emergencyContact: emergencyContact.trim(),
        employmentStatus: employmentStatus || "",
      });

      Alert.alert(
        "Driver Registered",
        "The driver has been successfully added to your fleet.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const msg =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Failed to register driver. Please try again.";
      Alert.alert("Error Creating Driver", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      {/* 1. Header App Bar */}
      <View className="px-6 pt-4 flex-row items-center mb-5">
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
        <View className="flex-1">
          <Text className="text-2xl font-bold text-[#111827]">Add Driver</Text>
          <Text className="text-sm text-[#6B7280] mt-0.5">
            Register a new driver to your fleet
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        >
          {/* Required Details Card */}
          <View className="bg-white border border-[#E8EDF3] rounded-[24px] p-6 mb-5">
            <Text className="text-base font-bold text-[#111827] mb-4">
              Account Information
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Driver Name <Text className="text-red-500">*</Text>
              </Text>
              <CustomInput
                value={name}
                onChangeText={setName}
                placeholder="Full Name (e.g. Aman Sharma)"
                autoCapitalize="words"
                leftIcon="person-outline"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email Address <Text className="text-red-500">*</Text>
              </Text>
              <CustomInput
                value={email}
                onChangeText={setEmail}
                placeholder="driver@fleet.com"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Password <Text className="text-red-500">*</Text>
              </Text>
              <CustomInput
                value={password}
                onChangeText={setPassword}
                placeholder="Set initial driver password"
                secureTextEntry
                leftIcon="lock-closed-outline"
              />
            </View>

            <View className="mb-2">
              <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number</Text>
              <CustomInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 9876543210"
                keyboardType="phone-pad"
                leftIcon="call-outline"
              />
            </View>
          </View>

          {/* Optional Driver & Licence Details Card */}
          <View className="bg-white border border-[#E8EDF3] rounded-[24px] p-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base font-bold text-[#111827]">
                Driver Details
              </Text>
              <View className="bg-[#F3F4F6] px-2.5 py-0.5 rounded-full">
                <Text className="text-xs text-[#6B7280] font-medium">Optional</Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Licence Number</Text>
              <CustomInput
                value={licence}
                onChangeText={setLicence}
                placeholder="e.g. DL-994821"
                autoCapitalize="characters"
                leftIcon="card-outline"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Licence Expiry</Text>
              <CustomInput
                value={licenceExpiry}
                onChangeText={setLicenceExpiry}
                placeholder="e.g. Dec 2028"
                autoCapitalize="words"
                leftIcon="calendar-outline"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Licence Class</Text>
              <CustomInput
                value={licenceClass}
                onChangeText={setLicenceClass}
                placeholder="e.g. Heavy Combination (HC)"
                autoCapitalize="words"
                leftIcon="ribbon-outline"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</Text>
              <CustomInput
                value={emergencyContact}
                onChangeText={setEmergencyContact}
                placeholder="+91 9876543211"
                keyboardType="phone-pad"
                leftIcon="call-outline"
              />
            </View>

            <View className="mb-2">
              <Text className="text-sm font-medium text-gray-700 mb-2">Employment Status</Text>
              <View className="flex-row flex-wrap gap-2">
                {EMPLOYMENT_OPTIONS.map((statusOption) => {
                  const isSelected = employmentStatus === statusOption;
                  return (
                    <TouchableOpacity
                      key={statusOption}
                      activeOpacity={0.7}
                      onPress={() =>
                        setEmploymentStatus(isSelected ? "" : statusOption)
                      }
                      className={`px-3.5 py-2 rounded-xl border ${
                        isSelected
                          ? "bg-[#2563EB] border-[#2563EB]"
                          : "bg-[#F9FAFB] border-[#E5E7EB]"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? "text-white" : "text-[#4B5563]"
                        }`}
                      >
                        {statusOption}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom Actions */}
      <View
        className="bg-white border-t border-[#E8EDF3] px-6 pt-4 flex-col gap-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        {isSubmitting ? (
          <View className="h-14 bg-[#2563EB] rounded-2xl items-center justify-center">
            <ActivityIndicator color="white" />
          </View>
        ) : (
          <PrimaryButton title="Save Driver" onPress={handleSave} />
        )}
      </View>
    </SafeAreaView>
  );
}
