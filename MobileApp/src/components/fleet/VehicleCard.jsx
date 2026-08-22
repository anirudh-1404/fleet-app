import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "./StatusBadge";
import { normalizeImageUrl } from "../../services/uploadService";

export default function VehicleCard({ vehicle, onPress }) {
  const isTruck = vehicle.type === "Trucks" || vehicle.type === "Truck" || vehicle.vehicleType === "Truck";
  const isVan = vehicle.type === "Vans" || vehicle.type === "Van" || vehicle.vehicleType === "Van";
  const isUte = vehicle.type === "Utes" || vehicle.type === "Ute" || vehicle.vehicleType === "Ute";

  let vehicleIcon = "car-sport-outline";
  if (isTruck) {
    vehicleIcon = "bus-outline";
  } else if (isVan || isUte) {
    vehicleIcon = "car-outline";
  }

  const rawUri = vehicle.photo || vehicle.imageUrl;
  const displayUri = normalizeImageUrl(rawUri);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="bg-white border border-[#E8EDF3] rounded-[24px] mb-5 overflow-hidden"
      style={{
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.015,
        shadowRadius: 10,
        elevation: 1,
      }}
    >
      {/* Top: Image with Badge */}
      <View className="h-40 bg-[#F1F5F9] relative overflow-hidden">
        {displayUri ? (
          <Image
            source={{ uri: displayUri }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <View className="w-12 h-12 rounded-full bg-white items-center justify-center shadow-sm">
              <Ionicons name={vehicleIcon} size={24} color="#2563EB" />
            </View>
          </View>
        )}
        <View className="absolute top-3 right-3 bg-white/90 border border-[#E8EDF3] px-3 py-1 rounded-full">
          <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">{vehicle.vehicleType || vehicle.type}</Text>
        </View>
      </View>

      {/* Middle: Details */}
      <View className="p-5">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-4">
            <Text className="text-base font-bold text-[#111827]">{vehicle.name || `${vehicle.make || ""} ${vehicle.model || ""}`.trim()}</Text>
            <Text className="text-xs font-semibold text-[#6B7280] mt-0.5">{vehicle.registration}</Text>
          </View>
          <View className="items-end">
            <Text className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Driver</Text>
            <Text className="text-sm font-semibold text-[#111827] mt-0.5">{vehicle.assignedDriver?.name || vehicle.driver?.name || vehicle.driver || "Unassigned"}</Text>
          </View>
        </View>

        {/* Bottom: Divider, Status, and Chevron */}
        <View className="flex-row justify-between items-center pt-4 border-t border-[#E8EDF3] mt-4">
          <StatusBadge status={vehicle.status} />
          <View className="flex-row items-center">
            <Text className="text-xs font-semibold text-[#2563EB] mr-1">Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#2563EB" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
