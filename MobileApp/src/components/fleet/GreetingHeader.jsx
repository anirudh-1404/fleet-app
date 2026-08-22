import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function GreetingHeader({ name, date, onLogout, onNotificationPress }) {
  return (
    <View className="flex-row justify-between items-center px-6 pt-4 mb-5">
      <View className="flex-1 mr-4">
        <Text className="text-xs font-semibold text-[#6B7280]">Good Morning,</Text>
        <Text className="text-2xl font-bold text-[#111827] mt-0.5">{name} 👋</Text>
        <Text className="text-xs text-[#94A3B8] mt-1">{date}</Text>
      </View>
      <View className="flex-row items-center gap-3">
        {/* Notification Icon */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onNotificationPress}
          className="w-10 h-10 rounded-full bg-white border border-[#E8EDF3] items-center justify-center"
          style={{
            shadowColor: "#111827",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.015,
            shadowRadius: 10,
            elevation: 1,
          }}
        >
          <Ionicons name="notifications-outline" size={20} color="#111827" />
          <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444] border-2 border-white" />
        </TouchableOpacity>
        
        {/* Logout Icon */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onLogout}
          className="w-10 h-10 rounded-full bg-white border border-[#E8EDF3] items-center justify-center"
          style={{
            shadowColor: "#111827",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.015,
            shadowRadius: 10,
            elevation: 1,
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
