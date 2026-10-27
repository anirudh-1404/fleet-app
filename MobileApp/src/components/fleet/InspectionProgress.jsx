import React from "react";
import { View, Text } from "react-native";

export default function InspectionProgress({ completed, total }) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  
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
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-sm font-semibold text-[#111827]">Inspection Progress</Text>
        <Text className="text-sm font-bold text-[#059669]">{completed} / {total} Checks Completed</Text>
      </View>
      
      {/* Progress Bar */}
      <View className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
        <View
          className="h-full bg-[#16A34A] rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}
