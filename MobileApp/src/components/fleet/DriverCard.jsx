import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DriverAvatar from "./DriverAvatar";
import StatusBadge from "./StatusBadge";

export default function DriverCard({ driver, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 mb-4"
      style={{
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.015,
        shadowRadius: 10,
        elevation: 1,
      }}
    >
      {/* Top Row: Avatar, Name, Status Badge */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center flex-1 mr-4">
          <DriverAvatar name={driver.name} />
          <View className="ml-3 flex-1">
            <Text className="text-base font-bold text-[#111827]">{driver.name}</Text>
            <Text className="text-xs text-[#6B7280] mt-0.5">Licence: {driver.licence || "-"}</Text>
          </View>
        </View>
        <StatusBadge status={driver.status} />
      </View>

      {/* Middle Row: Assigned Vehicle Details */}
      <View className="bg-[#F8FAFC] border border-[#E8EDF3] rounded-[16px] px-4 py-3 my-4 flex-row justify-between items-center">
        <Text className="text-xs font-semibold text-[#6B7280]">Assigned Vehicle</Text>
        <Text className={`text-xs font-bold ${driver.vehicle === "Not Assigned" || !driver.vehicle ? "text-[#94A3B8]" : "text-[#2563EB]"}`}>
          {driver.vehicle || "Not Assigned"}
        </Text>
      </View>

      {/* Bottom Row: Contact & Details Link */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Ionicons name="call-outline" size={14} color="#6B7280" />
          <Text className="text-xs font-semibold text-[#6B7280] ml-1.5">{driver.phone || "-"}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-xs font-semibold text-[#2563EB] mr-1">Details</Text>
          <Ionicons name="chevron-forward" size={16} color="#2563EB" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
