import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";

export default function InspectionItem({ title, selectedValue, onValueChange, noteValue, onNoteChange }) {
  const [showNote, setShowNote] = useState(false);

  return (
    <View className="flex-col pb-4 border-b border-[#E8EDF3] mb-4">
      {/* Title */}
      <Text className="text-sm font-medium text-[#111827] leading-5 mb-3">{title}</Text>

      {/* Segmented Chips */}
      <View className="flex-row bg-[#F1F5F9] p-1 rounded-full">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onValueChange("PASS")}
          className={`flex-1 py-2 rounded-full items-center justify-center ${
            selectedValue === "PASS" ? "bg-[#16A34A]" : ""
          }`}
        >
          <Text className={`text-xs font-bold ${selectedValue === "PASS" ? "text-white" : "text-[#6B7280]"}`}>
            PASS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onValueChange("FAIL")}
          className={`flex-1 py-2 rounded-full items-center justify-center ${
            selectedValue === "FAIL" ? "bg-[#DC2626]" : ""
          }`}
        >
          <Text className={`text-xs font-bold ${selectedValue === "FAIL" ? "text-white" : "text-[#6B7280]"}`}>
            FAIL
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onValueChange("N/A")}
          className={`flex-1 py-2 rounded-full items-center justify-center ${
            selectedValue === "N/A" ? "bg-[#CBD5E1]" : ""
          }`}
        >
          <Text className={`text-xs font-bold ${selectedValue === "N/A" ? "text-white" : "text-[#6B7280]"}`}>
            N/A
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onValueChange("NOTE")}
          className={`flex-1 py-2 rounded-full items-center justify-center ${
            selectedValue === "NOTE" ? "bg-[#059669]" : ""
          }`}
        >
          <Text className={`text-xs font-bold ${selectedValue === "NOTE" ? "text-white" : "text-[#6B7280]"}`}>
            NOTE
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Note Button & Input */}
      <View className="mt-3">
        {selectedValue === "NOTE" || noteValue || showNote ? (
          <View className="flex-col mt-2">
            <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Inspection Note</Text>
            <TextInput
              value={noteValue}
              onChangeText={onNoteChange}
              placeholder="Enter details or failure reasons..."
              placeholderTextColor="#CBD5E1"
              multiline
              numberOfLines={3}
              className="bg-white border border-[#E8EDF3] rounded-[12px] p-3 text-xs text-[#111827] min-h-[60px]"
              style={{ textAlignVertical: "top" }}
            />
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowNote(true)}
            className="flex-row items-center"
          >
            <Text className="text-xs font-bold text-[#059669]">+ Add Note</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
