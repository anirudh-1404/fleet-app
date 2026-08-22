import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ReviewItem({ title, value, note }) {
  let bgBadge = "bg-[#ECFDF5]";
  let textBadge = "text-[#16A34A]";
  if (value === "FAIL") {
    bgBadge = "bg-[#FEF2F2]";
    textBadge = "text-[#DC2626]";
  } else if (value === "N/A") {
    bgBadge = "bg-[#F1F5F9]";
    textBadge = "text-[#6B7280]";
  }

  return (
    <View className="flex-col py-4 border-b border-[#E8EDF3]">
      <View className="flex-row justify-between items-start gap-4">
        {/* Item Title */}
        <Text className="text-sm text-[#334155] font-medium flex-1 leading-5">
          {title}
        </Text>
        
        {/* Status Badge */}
        <View className={`px-2.5 py-1 rounded-full ${bgBadge}`}>
          <Text className={`text-[10px] font-bold ${textBadge}`}>{value}</Text>
        </View>
      </View>
      
      {/* Optional Note */}
      {note ? (
        <View className="mt-3 bg-[#F8FAFC] border border-[#E8EDF3] rounded-[12px] p-3 flex-row items-start">
          <Ionicons name="document-text-outline" size={14} color="#6B7280" style={{ marginRight: 6, marginTop: 2 }} />
          <Text className="text-xs text-[#6B7280] leading-relaxed flex-1">
            <Text className="font-semibold text-[#475569]">Note: </Text>
            {note}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
