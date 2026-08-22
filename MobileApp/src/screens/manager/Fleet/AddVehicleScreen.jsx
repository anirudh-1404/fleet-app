import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import VehicleForm from "@components/fleet/VehicleForm";
import { vehicleService } from "../../../services/vehicleService";

export default function AddVehicleScreen() {
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        registration: formData.registration || "REG-999",
        fleetNumber: formData.fleetNumber || "FLT-99",
        vehicleType: formData.type || formData.vehicleType || "Truck",
        make: formData.make || formData.name || "Volvo",
        model: formData.model || "FH16",
        year: Number(formData.year) || 2024,
        vin: formData.vin || "1V1FH16X8MA999999",
        status: "Active",
        photo: formData.photo || formData.imageUrl || "",
      };

      await vehicleService.createVehicle(payload);
      Alert.alert(
        "Vehicle Added Successfully",
        "The vehicle has been registered to your fleet.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const msg =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Failed to add vehicle. Please try again.";
      Alert.alert("Error Adding Vehicle", msg);
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
          <Text className="text-2xl font-bold text-[#111827]">Add Vehicle</Text>
          <Text className="text-sm text-[#6B7280] mt-0.5">
            Register a new vehicle to your fleet
          </Text>
        </View>
      </View>

      {/* 2. Reusable Vehicle Form */}
      <VehicleForm
        submitButtonText="Save Vehicle"
        onSubmit={handleSave}
        showCancelButton={false}
        isLoading={isSubmitting}
      />
    </SafeAreaView>
  );
}
