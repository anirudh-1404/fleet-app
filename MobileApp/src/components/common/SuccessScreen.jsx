import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function SuccessScreen({
  title = "Action Completed",
  subtitle = "Operation completed successfully",
  detailsCard,
  buttonText = "Done",
  onButtonPress
}) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA] justify-between" edges={["top", "bottom"]}>
      <View />
      <View className="px-6 items-center">
        <View className="w-20 h-20 bg-[#ECFDF5] border border-[#A7F3D0] rounded-full items-center justify-center mb-6">
          <Ionicons name="checkmark-circle" size={48} color="#10B981" />
        </View>

        <Text className="text-2xl font-bold text-[#111827] text-center mb-2">
          {title}
        </Text>
        <Text className="text-sm font-medium text-[#10B981] text-center mb-8">
          ✅ {subtitle}
        </Text>

        {detailsCard}
      </View>

      <View
        className="bg-white border-t border-[#E8EDF3] px-6 pt-4 w-full"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onButtonPress}
          className="h-12 bg-[#059669] rounded-[24px] items-center justify-center w-full"
          style={{
            shadowColor: "#059669",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text className="text-white text-sm font-semibold">{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
