import React from "react";
import { View, Text } from "react-native";
import StatusBadge from "./StatusBadge";

export default function JourneyProgressCard({ inspectionStatus, journeyStatus, startTime }) {
  return (
    <View
      className="bg-white border border-[#E8EDF3] rounded-[24px] p-5"
      style={{
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.015,
        shadowRadius: 10,
        elevation: 1,
      }}
    >
      <View className="flex-row justify-between items-center py-3 border-b border-[#F1F5F9]">
        <Text className="text-sm font-semibold text-[#6B7280]">Inspection</Text>
        <StatusBadge status={inspectionStatus} />
      </View>
      <View className="flex-row justify-between items-center py-3 border-b border-[#F1F5F9]">
        <Text className="text-sm font-semibold text-[#6B7280]">Journey</Text>
        <StatusBadge status={journeyStatus} />
      </View>
      <View className="flex-row justify-between items-center py-3">
        <Text className="text-sm font-semibold text-[#6B7280]">Start Time</Text>
        <Text className={`text-sm font-bold ${startTime ? "text-[#111827]" : "text-[#94A3B8]"}`}>
          {startTime || "--"}
        </Text>
      </View>
    </View>
  );
}
