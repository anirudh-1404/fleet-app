import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

import VehicleForm from "@components/fleet/VehicleForm";
import { vehicleService } from "../../../services/vehicleService";

export default function EditVehicleScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { vehicleId } = route.params || {};

  const [initialValues, setInitialValues] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (vehicleId) {
      fetchVehicle();
    }
  }, [vehicleId]);

  const fetchVehicle = async () => {
    setIsLoading(true);
    try {
      const data = await vehicleService.getVehicleById(vehicleId);
      if (data) {
        setInitialValues({
          vehicleType: data.vehicleType || "Truck",
          rego: data.registration || "",
          fleetNumber: data.fleetNumber || "",
          make: data.make || "",
          model: data.model || "",
          year: data.year ? String(data.year) : "",
          vin: data.vin || "",
          status: data.status || "Active",
          assignedDriver: data.assignedDriver
            ? typeof data.assignedDriver === "object"
              ? data.assignedDriver._id
              : data.assignedDriver
            : "",
          imageUrl: data.photo || data.imageUrl || "",
          photo: data.photo || data.imageUrl || "",
        });
      }
    } catch (err) {
      console.error("Error fetching vehicle for edit:", err);
      Alert.alert("Error", "Could not load vehicle details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (updatedData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        registration: updatedData.registration || updatedData.rego,
        fleetNumber: updatedData.fleetNumber,
        vehicleType: updatedData.vehicleType || updatedData.type,
        make: updatedData.make,
        model: updatedData.model,
        year: updatedData.year ? Number(updatedData.year) : undefined,
        vin: updatedData.vin,
        status: updatedData.status,
        photo: updatedData.photo || updatedData.imageUrl || "",
      };

      await vehicleService.updateVehicle(vehicleId, payload);
      Alert.alert(
        "Vehicle Updated Successfully",
        "The vehicle specifications have been saved.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const msg =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Failed to update vehicle. Please try again.";
      Alert.alert("Error Updating Vehicle", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
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
          <Text className="text-2xl font-bold text-[#111827]">Edit Vehicle</Text>
          <Text className="text-sm text-[#6B7280] mt-0.5">
            Update vehicle information
          </Text>
        </View>
      </View>

      {/* 2. Reusable Vehicle Form */}
      {isLoading || !initialValues ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <VehicleForm
          initialValues={initialValues}
          submitButtonText="Save Changes"
          onSubmit={handleSave}
          showCancelButton={true}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          isEdit={true}
        />
      )}
    </SafeAreaView>
  );
}
