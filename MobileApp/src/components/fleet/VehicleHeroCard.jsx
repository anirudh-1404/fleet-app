import React from "react";
import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "./StatusBadge";
import { normalizeImageUrl } from "../../services/uploadService";

export default function VehicleHeroCard({ name, registration, fleetNumber, type, status, imageUrl }) {
  const isTruck = type === "Trucks" || type === "Truck";
  const displayUri = normalizeImageUrl(imageUrl);

  return (
    <View
      className="bg-white border border-[#E8EDF3] rounded-[24px] overflow-hidden"
      style={{
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.015,
        shadowRadius: 10,
        elevation: 1,
      }}
    >
      {/* Vehicle Image Banner */}
      <View className="h-48 bg-[#F1F5F9] relative overflow-hidden">
        {displayUri ? (
          <Image
            source={{ uri: displayUri }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <View className="w-16 h-16 rounded-full bg-white items-center justify-center shadow-sm border border-[#E8EDF3]/30">
              <Ionicons name={isTruck ? "bus-outline" : "car-outline"} size={32} color="#2563EB" />
            </View>
          </View>
        )}
      </View>

      {/* Info Details Section */}
      <View className="p-5">
        <View className="flex-row justify-between items-center">
          <View className="flex-1 mr-4">
            <Text className="text-xl font-bold text-[#111827]">{name}</Text>
            <Text className="text-sm font-semibold text-[#6B7280] mt-1">
              {registration}{fleetNumber ? ` • ${fleetNumber}` : ""}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="bg-[#EEF4FF] border border-[#E8EDF3] px-3 py-1 rounded-full justify-center">
              <Text className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">{type}</Text>
            </View>
            <StatusBadge status={status} />
          </View>
        </View>
      </View>
    </View>
  );
}
