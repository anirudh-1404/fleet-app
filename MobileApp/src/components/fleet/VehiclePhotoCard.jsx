import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { normalizeImageUrl } from "../../services/uploadService";

export default function VehiclePhotoCard({ imageUrl, onPress, isEdit }) {
  const displayUri = normalizeImageUrl(imageUrl);

  return (
    <View
      className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 mb-2"
      style={{
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.015,
        shadowRadius: 10,
        elevation: 1,
      }}
    >
      <Text className="text-sm font-bold text-[#111827] mb-3">
        Vehicle Media (Optional)
      </Text>

      {displayUri ? (
        <View className="flex-col items-center">
          <View className="w-full h-48 rounded-[24px] overflow-hidden border border-[#E8EDF3] bg-[#F1F5F9]">
            <Image
              source={{ uri: displayUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          {isEdit && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onPress}
              className="mt-4 h-11 px-6 rounded-full border border-[#E8EDF3] bg-white items-center justify-center flex-row"
            >
              <Ionicons
                name="camera-outline"
                size={16}
                color="#64748B"
                style={{ marginRight: 6 }}
              />
              <Text className="text-xs font-semibold text-[#64748B]">
                Change Photo
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          className="h-44 border border-[#E8EDF3] rounded-[24px] bg-[#F8FAFC] items-center justify-center"
          style={{
            borderStyle: "dashed",
            borderWidth: 1.5,
            borderColor: "#CBD5E1"
          }}
        >
          <View className="w-12 h-12 rounded-full bg-white border border-[#E8EDF3] items-center justify-center mb-3">
            <Ionicons name="camera-outline" size={24} color="#64748B" />
          </View>
          <Text className="text-sm font-semibold text-[#64748B]">
            Tap to add vehicle photo
          </Text>
          <Text className="text-xs text-[#94A3B8] mt-1">
            Supports JPG, PNG (Max 5MB)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
