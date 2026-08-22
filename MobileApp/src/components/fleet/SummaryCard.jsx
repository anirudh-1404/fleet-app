import React from "react";
import { View, Text } from "react-native";
import StatusBadge from "./StatusBadge";

export default function SummaryCard({ passCount, failCount, naCount, notesCount }) {
  const overallStatus = failCount > 0 ? "Requires Attention" : "Ready for Submission";

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
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-sm font-bold text-[#111827]">Inspection Summary</Text>
        <StatusBadge status={overallStatus} />
      </View>
      
      <View className="flex-row justify-between">
        {/* PASS count */}
        <View className="flex-1 items-center bg-[#ECFDF5] rounded-[16px] py-3 mx-1 border border-[#A7F3D0]/20">
          <Text className="text-lg font-bold text-[#16A34A]">{passCount}</Text>
          <Text className="text-[10px] font-bold text-[#16A34A] uppercase mt-0.5">PASS</Text>
        </View>
        
        {/* FAIL count */}
        <View className="flex-1 items-center bg-[#FEF2F2] rounded-[16px] py-3 mx-1 border border-[#FCA5A5]/20">
          <Text className="text-lg font-bold text-[#DC2626]">{failCount}</Text>
          <Text className="text-[10px] font-bold text-[#DC2626] uppercase mt-0.5">FAIL</Text>
        </View>
        
        {/* N/A count */}
        <View className="flex-1 items-center bg-[#F1F5F9] rounded-[16px] py-3 mx-1 border border-[#CBD5E1]/20">
          <Text className="text-lg font-bold text-[#6B7280]">{naCount}</Text>
          <Text className="text-[10px] font-bold text-[#6B7280] uppercase mt-0.5">N/A</Text>
        </View>

        {/* Notes count */}
        <View className="flex-1 items-center bg-[#EFF6FF] rounded-[16px] py-3 mx-1 border border-[#BFDBFE]/20">
          <Text className="text-lg font-bold text-[#2563EB]">{notesCount}</Text>
          <Text className="text-[10px] font-bold text-[#2563EB] uppercase mt-0.5">Notes</Text>
        </View>
      </View>
    </View>
  );
}
