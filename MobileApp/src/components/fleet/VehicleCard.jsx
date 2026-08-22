import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "./StatusBadge";
import { normalizeImageUrl } from "../../services/uploadService";

export default function VehicleCard({ vehicle, onPress }) {
  const isTruck =
    vehicle.type === "Trucks" ||
    vehicle.type === "Truck" ||
    vehicle.vehicleType === "Truck";
  const isVan =
    vehicle.type === "Vans" ||
    vehicle.type === "Van" ||
    vehicle.vehicleType === "Van";
  const isUte =
    vehicle.type === "Utes" ||
    vehicle.type === "Ute" ||
    vehicle.vehicleType === "Ute";

  let vehicleIcon = "car-sport-outline";
  if (isTruck) {
    vehicleIcon = "bus-outline";
  } else if (isVan || isUte) {
    vehicleIcon = "car-outline";
  }

  const rawUri = vehicle.photo || vehicle.imageUrl;
  const displayUri = normalizeImageUrl(rawUri);

  const vehicleName =
    vehicle.name ||
    `${vehicle.make || ""} ${vehicle.model || vehicle.vehicleType || ""}`.trim();
  const driverName =
    vehicle.assignedDriver?.name ||
    vehicle.driver?.name ||
    (typeof vehicle.driver === "string" ? vehicle.driver : null) ||
    "Unassigned";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="bg-white border border-[#E8EDF3] rounded-[20px] p-4 mb-3 flex-row items-center justify-between"
      style={{
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.015,
        shadowRadius: 8,
        elevation: 1,
      }}
    >
      {/* Left Section: Thumbnail & Main Info */}
      <View className="flex-row items-center flex-1 mr-3">
        {/* Compact Vehicle Icon / Image Box */}
        <View className="w-14 h-14 rounded-[16px] bg-[#F1F5F9] border border-[#E2E8F0] items-center justify-center mr-3.5 overflow-hidden">
          {displayUri ? (
            <Image
              source={{ uri: displayUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name={vehicleIcon} size={24} color="#2563EB" />
          )}
        </View>

        {/* Text Details */}
        <View className="flex-1">
          <View className="flex-row items-center flex-wrap gap-1.5 mb-1">
            <Text className="text-base font-bold text-[#111827] flex-shrink" numberOfLines={1}>
              {vehicleName}
            </Text>
            <View className="px-2 py-0.5 rounded-md bg-[#F1F5F9] border border-[#E2E8F0]">
              <Text className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                {vehicle.vehicleType || vehicle.type || "Vehicle"}
              </Text>
            </View>
          </View>

          <Text className="text-xs text-[#64748B] font-medium" numberOfLines={1}>
            Rego: <Text className="font-bold text-[#1E293B]">{vehicle.registration}</Text>
            {vehicle.fleetNumber ? ` • Fleet: ${vehicle.fleetNumber}` : ""}
          </Text>

          <Text className="text-xs text-[#64748B] mt-0.5 font-medium" numberOfLines={1}>
            Driver:{" "}
            <Text
              className={
                driverName === "Unassigned"
                  ? "font-semibold text-[#D97706]"
                  : "font-semibold text-[#2563EB]"
              }
            >
              {driverName}
            </Text>
          </Text>
        </View>
      </View>

      {/* Right Section: Status Badge & Chevron */}
      <View className="items-end justify-between self-stretch py-0.5">
        <StatusBadge status={vehicle.status || "Active"} />
        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  );
}
