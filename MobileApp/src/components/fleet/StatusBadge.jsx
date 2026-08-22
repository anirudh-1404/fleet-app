import React from "react";
import { View, Text } from "react-native";

export default function StatusBadge({ status }) {
  let bgColorClass = "bg-[#ECFDF5]";
  let textColorClass = "text-[#16A34A]";
  let displayStatus = status || "Active";

  const lowerStatus = status ? status.toLowerCase().trim() : "";

  if (lowerStatus === "active" || lowerStatus === "completed" || lowerStatus === "paid" || lowerStatus === "good" || lowerStatus === "passed" || lowerStatus === "pass") {
    bgColorClass = "bg-[#ECFDF5]";
    textColorClass = "text-[#16A34A]";
    displayStatus = status || "Active";
  } else if (lowerStatus === "in service" || lowerStatus === "in_service" || lowerStatus === "on leave" || lowerStatus === "on_leave" || lowerStatus === "pending" || lowerStatus === "due soon" || lowerStatus === "needs attention" || lowerStatus === "urgent") {
    bgColorClass = "bg-[#FFFBEB]";
    textColorClass = "text-[#D97706]";
    displayStatus = status || "Pending";
  } else if (lowerStatus === "out of service" || lowerStatus === "out_of_service" || lowerStatus === "inactive" || lowerStatus === "overdue" || lowerStatus === "critical" || lowerStatus === "failed" || lowerStatus === "fail" || lowerStatus === "requires attention") {
    bgColorClass = "bg-[#FEF2F2]";
    textColorClass = "text-[#DC2626]";
    displayStatus = status || "Out of Service";
  } else if (lowerStatus === "unassigned" || lowerStatus === "normal" || lowerStatus === "not started" || lowerStatus === "n/a") {
    bgColorClass = "bg-[#F1F5F9]";
    textColorClass = "text-[#6B7280]";
    displayStatus = status || "Normal";
  } else if (lowerStatus === "started" || lowerStatus === "journey started") {
    bgColorClass = "bg-[#EFF6FF]";
    textColorClass = "text-[#2563EB]";
    displayStatus = status || "Started";
  }

  return (
    <View className={`px-3 py-1 rounded-full items-center justify-center ${bgColorClass}`}>
      <Text className={`text-[11px] font-semibold ${textColorClass}`}>
        {displayStatus}
      </Text>
    </View>
  );
}
