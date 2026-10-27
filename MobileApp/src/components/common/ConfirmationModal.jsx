import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  icon = "help-circle-outline",
  iconBgColor = "bg-[#ECFDF5]",
  iconColor = "#059669",
  confirmButtonBg = "bg-[#059669]"
}) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(17, 24, 39, 0.4)",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <View
          className="bg-white rounded-[24px] p-6 w-full max-w-[340px]"
          style={{
            shadowColor: "#111827",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 4,
          }}
        >
          <View className={`w-12 h-12 rounded-full ${iconBgColor} items-center justify-center mb-4`}>
            <Ionicons name={icon} size={24} color={iconColor} />
          </View>
          <Text className="text-lg font-bold text-[#111827] mb-2">{title}</Text>
          <Text className="text-sm text-[#6B7280] leading-5 mb-6">{message}</Text>

          <View className="flex-row gap-3">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              className="flex-1 h-11 border border-[#E8EDF3] bg-white rounded-full items-center justify-center"
            >
              <Text className="text-sm font-semibold text-[#6B7280]">{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onConfirm}
              className={`flex-1 h-11 ${confirmButtonBg} rounded-full items-center justify-center`}
            >
              <Text className="text-white text-sm font-semibold">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
