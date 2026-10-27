import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TodaysOperationsCard({
  totalDrivers = 0,
  inspectionsCompleted = 0,
  inspectionsPending = 0,
  failedInspections = 0,
  journeysStarted = 0,
  journeysNotStarted = 0,
  onPress
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className="bg-white border border-[#E2E8F0] rounded-[24px] p-5 mb-2"
      style={{
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      {/* Top Title Row */}
      <View className="flex-row justify-between items-center mb-1">
        <View className="flex-row items-center flex-1 mr-2">
          <View className="w-11 h-11 rounded-[16px] bg-[#ECFDF5] border border-[#A7F3D0] items-center justify-center mr-3">
            <Ionicons name="compass-outline" size={22} color="#059669" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-[#0F172A] tracking-tight">Today's Operations</Text>
            <Text className="text-xs text-[#64748B] mt-0.5 font-medium">
              Monitor today's driver activity and vehicle readiness
            </Text>
          </View>
        </View>
        <View className="w-8 h-8 rounded-full bg-[#F8FAFC] items-center justify-center border border-[#E2E8F0]">
          <Ionicons name="chevron-forward" size={16} color="#64748B" />
        </View>
      </View>

      {/* Summary Grid (3 rows of 2 columns) */}
      <View className="mt-4 pt-4 border-t border-[#F1F5F9] flex-col gap-3">
        {/* Row 1: Total Drivers & Inspections Done */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[18px] p-3 flex-row items-center justify-between">
            <View>
              <Text className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                Total Drivers
              </Text>
              <Text className="text-xl font-extrabold text-[#0F172A] mt-0.5">{totalDrivers}</Text>
            </View>
          </View>

          <View className="flex-1 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[18px] p-3 flex-row items-center justify-between">
            <View>
              <Text className="text-[10px] font-bold text-[#065F46] uppercase tracking-wider">
                Insp. Done
              </Text>
              <Text className="text-xl font-extrabold text-[#047857] mt-0.5">{inspectionsCompleted}</Text>
            </View>
          </View>
        </View>

        {/* Row 2: Inspections Pending & Failed Inspections */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-[#FFFBEB] border border-[#FDE68A] rounded-[18px] p-3 flex-row items-center justify-between">
            <View>
              <Text className="text-[10px] font-bold text-[#92400E] uppercase tracking-wider">
                Insp. Pending
              </Text>
              <Text className="text-xl font-extrabold text-[#B45309] mt-0.5">{inspectionsPending}</Text>
            </View>
          </View>

          <View className="flex-1 bg-[#FEF2F2] border border-[#FECDD3] rounded-[18px] p-3 flex-row items-center justify-between">
            <View>
              <Text className="text-[10px] font-bold text-[#991B1B] uppercase tracking-wider">
                Failed Insp.
              </Text>
              <Text className="text-xl font-extrabold text-[#B91C1C] mt-0.5">{failedInspections}</Text>
            </View>
          </View>
        </View>

        {/* Row 3: Journeys Started & Journeys Pending */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[18px] p-3 flex-row items-center justify-between">
            <View>
              <Text className="text-[10px] font-bold text-[#065F46] uppercase tracking-wider">
                Journeys Started
              </Text>
              <Text className="text-xl font-extrabold text-[#047857] mt-0.5">{journeysStarted}</Text>
            </View>
          </View>

          <View className="flex-1 bg-[#F1F5F9] border border-[#CBD5E1] rounded-[18px] p-3 flex-row items-center justify-between">
            <View>
              <Text className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                Journeys Pending
              </Text>
              <Text className="text-xl font-extrabold text-[#334155] mt-0.5">{journeysNotStarted}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
