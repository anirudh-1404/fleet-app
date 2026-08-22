import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TodaysOperationsCard({
  totalDrivers = 4,
  inspectionsCompleted = 2,
  inspectionsPending = 1,
  failedInspections = 1,
  journeysStarted = 1,
  journeysNotStarted = 3,
  onPress
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 mb-5"
      style={{
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.015,
        shadowRadius: 10,
        elevation: 1,
      }}
    >
      {/* Top Title Row */}
      <View className="flex-row justify-between items-center mb-1">
        <View className="flex-row items-center flex-1 mr-2">
          <View className="w-10 h-10 rounded-full bg-[#EFF6FF] items-center justify-center mr-3">
            <Ionicons name="compass-outline" size={20} color="#2563EB" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-[#111827]">Today's Operations</Text>
            <Text className="text-xs text-[#6B7280] mt-0.5">
              Monitor today's driver activity and vehicle readiness
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#6B7280" />
      </View>

      {/* Summary Grid (3 rows of 2 columns) */}
      <View className="mt-4 pt-4 border-t border-[#E8EDF3] flex-col gap-3">
        {/* Row 1: Total Drivers & Inspections Done */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-[#F8FAFC] border border-[#E8EDF3] rounded-[16px] p-3 flex-row items-center justify-between">
            <View>
              <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                Total Drivers
              </Text>
              <Text className="text-xl font-bold text-[#111827] mt-0.5">{totalDrivers}</Text>
            </View>
          </View>

          <View className="flex-1 bg-[#ECFDF5] border border-[#D1FAE5] rounded-[16px] p-3 flex-row items-center justify-between">
            <View>
              <Text className="text-[10px] font-bold text-[#065F46] uppercase tracking-wider">
                Insp. Done
              </Text>
              <Text className="text-xl font-bold text-[#047857] mt-0.5">{inspectionsCompleted}</Text>
            </View>
          </View>
        </View>

        {/* Row 2: Inspections Pending & Failed Inspections */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-[#FFFBEB] border border-[#FDE68A] rounded-[16px] p-3 flex-row items-center justify-between">
            <View>
              <Text className="text-[10px] font-bold text-[#92400E] uppercase tracking-wider">
                Insp. Pending
              </Text>
              <Text className="text-xl font-bold text-[#B45309] mt-0.5">{inspectionsPending}</Text>
            </View>
          </View>

          <View className="flex-1 bg-[#FEF2F2] border border-[#FEE2E2] rounded-[16px] p-3 flex-row items-center justify-between">
            <View>
              <Text className="text-[10px] font-bold text-[#991B1B] uppercase tracking-wider">
                Failed Insp.
              </Text>
              <Text className="text-xl font-bold text-[#B91C1C] mt-0.5">{failedInspections}</Text>
            </View>
          </View>
        </View>

        {/* Row 3: Journeys Started & Journeys Pending */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-[#EFF6FF] border border-[#DBEAFE] rounded-[16px] p-3 flex-row items-center justify-between">
            <View>
              <Text className="text-[10px] font-bold text-[#1E40AF] uppercase tracking-wider">
                Journeys Started
              </Text>
              <Text className="text-xl font-bold text-[#1D4ED8] mt-0.5">{journeysStarted}</Text>
            </View>
          </View>

          <View className="flex-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-[16px] p-3 flex-row items-center justify-between">
            <View>
              <Text className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                Journeys Pending
              </Text>
              <Text className="text-xl font-bold text-[#475569] mt-0.5">{journeysNotStarted}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
