import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "@components/fleet/StatusBadge";

export default function DriverActivityCard({ activity, onPress }) {
  const {
    driverName,
    vehicleName,
    registration,
    inspectionStatus,
    inspectionTime,
    passCount,
    failCount,
    naCount,
    notesCount,
    journeyStatus,
    journeyStartTime
  } = activity;

  const isPending = inspectionStatus === "Pending";

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
      {/* Top Header: Driver Name & Arrow */}
      <View className="flex-row justify-between items-center mb-1">
        <View className="flex-1 mr-2">
          <Text className="text-base font-bold text-[#111827]">{driverName}</Text>
          <Text className="text-xs font-semibold text-[#6B7280] mt-0.5">
            {vehicleName} • {registration}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#6B7280" />
      </View>

      {/* Main Status Grid */}
      <View className="bg-[#F8FAFC] border border-[#E8EDF3] rounded-[16px] p-4 my-3 flex-col gap-3">
        {/* Inspection Status Line */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Text className="text-xs font-semibold text-[#6B7280] mr-2">Inspection:</Text>
            <StatusBadge status={inspectionStatus} />
          </View>
          <Text className="text-xs font-semibold text-[#111827]">
            {inspectionTime !== "--" && inspectionTime !== "-" ? inspectionTime : ""}
          </Text>
        </View>

        {/* Journey Status Line */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Text className="text-xs font-semibold text-[#6B7280] mr-2">Journey:</Text>
            <StatusBadge status={journeyStatus} />
          </View>
          <Text className="text-xs font-semibold text-[#111827]">
            {journeyStartTime !== "--" && journeyStartTime !== "-" ? journeyStartTime : ""}
          </Text>
        </View>
      </View>

      {/* Inspection Item Counts Summary (if not pending) */}
      {!isPending && (
        <View className="flex-row items-center justify-between border-t border-[#E8EDF3] pt-3 mt-1">
          <View className="flex-row items-center gap-5">
            <View>
              <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Pass</Text>
              <Text className="text-xs font-bold text-[#16A34A] mt-0.5">{passCount}</Text>
            </View>
            <View>
              <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Fail</Text>
              <Text className={`text-xs font-bold mt-0.5 ${failCount > 0 ? "text-[#DC2626]" : "text-[#6B7280]"}`}>
                {failCount}
              </Text>
            </View>
            <View>
              <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">N/A</Text>
              <Text className="text-xs font-bold text-[#6B7280] mt-0.5">{naCount}</Text>
            </View>
            <View>
              <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Notes</Text>
              <Text className={`text-xs font-bold mt-0.5 ${notesCount > 0 ? "text-[#059669]" : "text-[#6B7280]"}`}>
                {notesCount}
              </Text>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
