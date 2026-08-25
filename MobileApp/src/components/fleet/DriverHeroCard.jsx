import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DriverAvatar from "./DriverAvatar";
import StatusBadge from "./StatusBadge";

export default function DriverHeroCard({ name, status, licence, vehicle, phone, email }) {
  return (
    <View
      className="bg-white border border-[#E8EDF3] rounded-[24px] p-6 items-center"
      style={{
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.015,
        shadowRadius: 10,
        elevation: 1,
      }}
    >
      <DriverAvatar name={name} size={80} />
      
      <Text className="text-xl font-bold text-[#111827] mt-3">{name}</Text>
      <View className="mt-1.5 mb-4">
        <StatusBadge status={status} />
      </View>

      <View className="w-full border-t border-[#E8EDF3] pt-4 flex-col gap-2.5">
        <View className="flex-row items-center justify-center">
          <Ionicons name="card-outline" size={14} color="#6B7280" />
          <Text className="text-xs font-semibold text-[#6B7280] ml-1.5">Licence: {licence || "-"}</Text>
        </View>
        <View className="flex-row items-center justify-center">
          <Ionicons name="car-sport-outline" size={14} color="#6B7280" />
          <Text className="text-xs font-semibold text-[#6B7280] ml-1.5">Vehicle: {vehicle || "Unassigned"}</Text>
        </View>
        <View className="flex-row items-center justify-center">
          <Ionicons name="call-outline" size={14} color="#6B7280" />
          <Text className="text-xs font-semibold text-[#6B7280] ml-1.5">{phone || "-"}</Text>
        </View>
        <View className="flex-row items-center justify-center">
          <Ionicons name="mail-outline" size={14} color="#6B7280" />
          <Text className="text-xs font-semibold text-[#6B7280] ml-1.5">{email || "-"}</Text>
        </View>
      </View>
    </View>
  );
}
