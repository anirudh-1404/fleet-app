import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "./StatusBadge";

export default function AssignedVehicleCard({
  name,
  registration,
  status = "Assigned",
  fleetNumber,
  trailerNumber,
  isDriverView = false,
  onPress
}) {
  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      activeOpacity={0.7}
      onPress={onPress}
      className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 flex-row items-center justify-between"
      style={{
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.015,
        shadowRadius: 10,
        elevation: 1,
      }}
    >
      <View className="flex-row items-center flex-1 mr-4">
        {/* Photo Placeholder / Icon */}
        <View className="w-16 h-16 rounded-[16px] bg-[#EEF4FF] items-center justify-center mr-4 border border-[#E8EDF3]/30 overflow-hidden">
          {isDriverView ? (
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=150&q=80" }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="bus-outline" size={24} color="#2563EB" />
          )}
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between items-center mr-1">
            <Text className="text-base font-bold text-[#111827]">{name}</Text>
            {!isDriverView && <StatusBadge status={status} />}
            {isDriverView && <StatusBadge status="Assigned" />}
          </View>
          <Text className="text-xs text-[#6B7280] mt-0.5">
            Rego: {registration} {fleetNumber ? `| Fleet: ${fleetNumber}` : ""}
          </Text>
          {trailerNumber && (
            <Text className="text-[11px] font-semibold text-[#94A3B8] mt-1.5">
              Trailer: {trailerNumber}
            </Text>
          )}
        </View>
      </View>
      {!isDriverView && onPress && (
        <Ionicons name="chevron-forward" size={18} color="#6B7280" />
      )}
    </CardContainer>
  );
}
