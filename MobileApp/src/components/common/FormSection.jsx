import React from "react";
import { View, Text } from "react-native";

export default function FormSection({ title, subtitle, children, className = "" }) {
  return (
    <View className={`bg-white border border-[#E8EDF3] rounded-[24px] p-5 mb-5 ${className}`}
      style={{
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.015,
        shadowRadius: 10,
        elevation: 1,
      }}
    >
      {title && (
        <View className="mb-4">
          <Text className="text-base font-bold text-[#111827]">{title}</Text>
          {subtitle && <Text className="text-xs text-[#6B7280] mt-0.5">{subtitle}</Text>}
        </View>
      )}
      <View className="flex-col gap-4">
        {children}
      </View>
    </View>
  );
}
