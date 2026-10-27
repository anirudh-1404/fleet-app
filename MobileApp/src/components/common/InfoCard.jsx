import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InfoCard({
  title,
  subtitle,
  icon,
  children,
  action,
  className = "",
  style
}) {
  return (
    <View
      className={`bg-white border border-[#E8EDF3] rounded-[24px] p-5 mb-5 ${className}`}
      style={[
        {
          shadowColor: "#111827",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.015,
          shadowRadius: 10,
          elevation: 1,
        },
        style
      ]}
    >
      {(title || icon || action) && (
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center flex-1 mr-3">
            {icon && (
              <View className="w-9 h-9 rounded-full bg-[#ECFDF5] items-center justify-center mr-3">
                <Ionicons name={icon} size={18} color="#059669" />
              </View>
            )}
            <View className="flex-1">
              {title && <Text className="text-base font-bold text-[#111827]">{title}</Text>}
              {subtitle && <Text className="text-xs text-[#6B7280] mt-0.5">{subtitle}</Text>}
            </View>
          </View>
          {action}
        </View>
      )}
      {children}
    </View>
  );
}
