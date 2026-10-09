import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Clean, minimal visual hierarchy for simplicity
const ICON_THEMES = {
  "car-outline": { bg: "#F0F7FF", icon: "#2563EB", border: "#DBEAFE" },
  "car-sport-outline": { bg: "#F0F7FF", icon: "#2563EB", border: "#DBEAFE" },
  "people-outline": { bg: "#F8FAFC", icon: "#334155", border: "#E2E8F0" },
  "clipboard-outline": { bg: "#F8FAFC", icon: "#334155", border: "#E2E8F0" },
  "checkbox-outline": { bg: "#F8FAFC", icon: "#334155", border: "#E2E8F0" },
  "build-outline": { bg: "#F8FAFC", icon: "#334155", border: "#E2E8F0" },
  "construct-outline": { bg: "#F8FAFC", icon: "#334155", border: "#E2E8F0" },
  "receipt-outline": { bg: "#F8FAFC", icon: "#334155", border: "#E2E8F0" },
  "water-outline": { bg: "#F8FAFC", icon: "#334155", border: "#E2E8F0" },
  "flash-outline": { bg: "#F8FAFC", icon: "#334155", border: "#E2E8F0" },
  "call-outline": { bg: "#F8FAFC", icon: "#334155", border: "#E2E8F0" },
  "document-text-outline": { bg: "#F8FAFC", icon: "#334155", border: "#E2E8F0" },
  "notifications-outline": { bg: "#F8FAFC", icon: "#334155", border: "#E2E8F0" },
  "chatbubbles-outline": { bg: "#EFF6FF", icon: "#2563EB", border: "#BFDBFE" },
  "mail-unread-outline": { bg: "#ECFDF5", icon: "#10B981", border: "#A7F3D0" },
};

export default function FleetActionCard({ title, subtitle, icon, isFeatured, onPress }) {
  const theme = ICON_THEMES[icon] || { bg: "#EFF6FF", icon: "#2563EB", border: "#BFDBFE" };

  if (isFeatured) {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        className="w-full bg-white border border-[#E2E8F0] rounded-[24px] p-4 flex-row items-center justify-between min-h-[92px]"
        style={{
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.03,
          shadowRadius: 12,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center flex-1 mr-4">
          <View
            className="w-12 h-12 rounded-[18px] items-center justify-center mr-3.5"
            style={{ backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border }}
          >
            <Ionicons name={icon} size={24} color={theme.icon} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-[#0F172A] tracking-tight">{title}</Text>
            <Text className="text-xs text-[#64748B] mt-0.5 font-medium">{subtitle}</Text>
          </View>
        </View>
        <View className="w-8 h-8 rounded-full bg-[#F8FAFC] items-center justify-center border border-[#E2E8F0]">
          <Ionicons name="chevron-forward" size={16} color="#64748B" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className="flex-1 bg-white border border-[#E2E8F0] rounded-[24px] p-4 justify-between min-h-[142px]"
      style={{
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      <View
        className="w-11 h-11 rounded-[16px] items-center justify-center"
        style={{ backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border }}
      >
        <Ionicons name={icon} size={22} color={theme.icon} />
      </View>
      <View className="flex-row justify-between items-end mt-4">
        <View className="flex-1 mr-2">
          <Text className="text-sm font-bold text-[#0F172A] tracking-tight">{title}</Text>
          <Text className="text-[11px] text-[#64748B] font-medium mt-0.5" numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  );
}
