import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ROUTES from "@constants/routes";
import { useInspection } from "../../../context/InspectionContext";
import { useFleetData } from "../../../context/FleetDataContext";

export default function InspectionSubmittedScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { setIsInspectionCompleted, selectedVehicle } = useInspection();
  const fleetData = useFleetData();
  const updateTodayInspection = fleetData?.updateTodayInspection;

  const vehicleInfo = {
    name: selectedVehicle ? `${selectedVehicle.make || ""} ${selectedVehicle.model || selectedVehicle.vehicleType}`.trim() : "Assigned Vehicle",
    registration: selectedVehicle ? selectedVehicle.registration : "--",
    submissionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  // Formatted date (e.g. Wednesday, 5 August 2026)
  const formattedDate = useMemo(() => {
    const today = new Date();
    const options = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
    return today.toLocaleDateString("en-AU", options);
  }, []);

  const handleReturnHome = () => {
    // 1. Update status to completed using local state
    setIsInspectionCompleted(true);
    // 2. Sync to Manager's Today Operations
    if (typeof updateTodayInspection === "function") {
      updateTodayInspection("John Smith", vehicleInfo.submissionTime, { pass: 30, fail: 1, na: 2, notes: 1 });
    }
    // 3. Return to Driver Home screen
    navigation.navigate(ROUTES.DRIVER_HOME);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA] justify-between" edges={["top", "bottom"]}>
      {/* Spacer */}
      <View />

      {/* Success Content */}
      <View className="px-6 items-center">
        {/* Checkmark Icon container */}
        <View className="w-20 h-20 bg-[#ECFDF5] border border-[#A7F3D0] rounded-full items-center justify-center mb-6">
          <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
        </View>

        <Text className="text-2xl font-bold text-[#111827] text-center mb-2">
          Inspection Submitted
        </Text>
        <Text className="text-sm font-medium text-[#10B981] text-center mb-8">
          ✅ Inspection Submitted Successfully
        </Text>

        {/* Details Card */}
        <View
          className="w-full bg-white border border-[#E8EDF3] rounded-[24px] p-6"
          style={{
            shadowColor: "#111827",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.015,
            shadowRadius: 10,
            elevation: 1,
          }}
        >
          <View className="flex-col gap-4">
            <View className="flex-row justify-between border-b border-[#F1F5F9] pb-3">
              <Text className="text-xs font-semibold text-[#6B7280]">Vehicle</Text>
              <Text className="text-xs font-bold text-[#111827]">{vehicleInfo.name}</Text>
            </View>

            <View className="flex-row justify-between border-b border-[#F1F5F9] pb-3">
              <Text className="text-xs font-semibold text-[#6B7280]">Registration</Text>
              <Text className="text-xs font-bold text-[#111827]">{vehicleInfo.registration}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-xs font-semibold text-[#6B7280]">Submission Time</Text>
              <Text className="text-xs font-bold text-[#111827]">
                {formattedDate} • {vehicleInfo.submissionTime}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Action Button */}
      <View
        className="bg-white border-t border-[#E8EDF3] px-6 pt-4 w-full"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleReturnHome}
          className="h-12 bg-[#2563EB] rounded-[24px] items-center justify-center w-full"
          style={{
            shadowColor: "#2563EB",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text className="text-white text-sm font-semibold">Return to Driver Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
