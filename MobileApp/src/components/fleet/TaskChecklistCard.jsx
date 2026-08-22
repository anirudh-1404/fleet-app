import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TaskChecklistCard({ isInspectionCompleted, isJourneyStarted }) {
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
      {/* Task 1 */}
      <View className="flex-row items-center py-3 border-b border-[#F1F5F9]">
        <View className="mr-3">
          {isInspectionCompleted ? (
            <Ionicons name="checkbox" size={20} color="#16A34A" />
          ) : (
            <View className="w-5 h-5 rounded-md border-2 border-[#CBD5E1]" style={{ borderWidth: 2 }} />
          )}
        </View>
        <Text className={`text-sm font-semibold ${isInspectionCompleted ? "text-[#94A3B8] line-through" : "text-[#111827]"}`}>
          Complete Vehicle Inspection
        </Text>
      </View>

      {/* Task 2 */}
      <View className="flex-row items-center py-3 border-b border-[#F1F5F9]">
        <View className="mr-3">
          {isJourneyStarted ? (
            <Ionicons name="checkbox" size={20} color="#16A34A" />
          ) : (
            <View className="w-5 h-5 rounded-md border-2 border-[#CBD5E1]" style={{ borderWidth: 2 }} />
          )}
        </View>
        <Text className={`text-sm font-semibold ${isJourneyStarted ? "text-[#94A3B8] line-through" : "text-[#111827]"}`}>
          Start Journey
        </Text>
      </View>

      {/* Task 3 */}
      <View className="flex-row items-center py-3">
        <View className="mr-3">
          <View className="w-5 h-5 rounded-md border-2 border-[#E2E8F0] bg-[#F8FAFC] items-center justify-center" style={{ borderWidth: 2 }}>
            <Ionicons name="lock-closed" size={10} color="#94A3B8" />
          </View>
        </View>
        <Text className="text-sm font-semibold text-[#94A3B8]">
          End Journey (Coming Soon)
        </Text>
      </View>
    </View>
  );
}
