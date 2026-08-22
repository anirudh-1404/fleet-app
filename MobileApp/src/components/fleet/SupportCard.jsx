import React from "react";
import { View, Text, TouchableOpacity, Alert, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SupportCard() {
  const managerPhone = "+61412345678";

  const handleSupportPress = async (type) => {
    try {
      if (type === "Call") {
        const url = `tel:${managerPhone}`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert("Contact Manager", `Manager Phone: ${managerPhone}`);
        }
      } else if (type === "Message") {
        const url = `sms:${managerPhone}`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert("Message Manager", `Send SMS to: ${managerPhone}`);
        }
      }
    } catch (e) {
      Alert.alert("Support Action", `Contact Manager: ${managerPhone}`);
    }
  };

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
      <Text className="text-sm font-bold text-[#111827] mb-3.5">Need Help?</Text>
      <View className="flex-row gap-3">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleSupportPress("Call")}
          className="flex-1 h-12 rounded-[16px] bg-[#F8FAFC] border border-[#E8EDF3] flex-row items-center justify-center gap-2"
        >
          <Ionicons name="call-outline" size={18} color="#2563EB" />
          <Text className="text-sm font-bold text-[#2563EB]">Call Manager</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleSupportPress("Message")}
          className="flex-1 h-12 rounded-[16px] bg-[#F8FAFC] border border-[#E8EDF3] flex-row items-center justify-center gap-2"
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#2563EB" />
          <Text className="text-sm font-bold text-[#2563EB]">Message Manager</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
