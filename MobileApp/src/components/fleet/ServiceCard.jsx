import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ServiceRow = ({ label, value, icon, isLast }) => (
  <View className={`flex-row justify-between items-center py-3 ${!isLast ? "border-b border-[#E8EDF3]" : ""}`}>
    <View className="flex-row items-center flex-1 mr-4">
      <View className="w-9 h-9 rounded-full bg-[#F1F5F9] items-center justify-center mr-3">
        <Ionicons name={icon} size={18} color="#6B7280" />
      </View>
      <Text className="text-sm font-semibold text-[#6B7280]">{label}</Text>
    </View>
    <Text className="text-sm font-bold text-[#111827]">{value}</Text>
  </View>
);

export default function ServiceCard({
  lastService = "15 July 2026",
  nextService = "15 October 2026",
  regoExpiry = "10 March 2027",
  insuranceExpiry = "20 December 2026"
}) {
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
      <ServiceRow label="Last Service" value={lastService} icon="construct-outline" />
      <ServiceRow label="Next Service Due" value={nextService} icon="alert-circle-outline" />
      <ServiceRow label="Registration Expiry" value={regoExpiry} icon="calendar-outline" />
      <ServiceRow label="Insurance Expiry" value={insuranceExpiry} icon="shield-checkmark-outline" isLast={true} />
    </View>
  );
}
