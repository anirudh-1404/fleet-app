import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function NotificationButton({ onPress, hasUnread = true }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="w-11 h-11 bg-white border border-[#E8EDF3] rounded-full items-center justify-center relative"
      style={{
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.015,
        shadowRadius: 10,
        elevation: 1,
      }}
    >
      <Ionicons name="notifications-outline" size={20} color="#111827" />
      {hasUnread && (
        <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444] border-2 border-white" />
      )}
    </TouchableOpacity>
  );
}
