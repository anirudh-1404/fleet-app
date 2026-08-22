import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Platform,
  SafeAreaView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CustomDropdown({
  label,
  selectedValue,
  onValueChange,
  options = [],
  placeholder = "Select option",
  error = false,
  leftIcon
}) {
  const [modalVisible, setModalVisible] = useState(false);

  const getOptionLabel = (option) => {
    if (typeof option === "object" && option !== null) {
      return option.label;
    }
    return option;
  };

  const getOptionValue = (option) => {
    if (typeof option === "object" && option !== null) {
      return option.value;
    }
    return option;
  };

  const currentDisplayLabel = () => {
    if (!selectedValue) return placeholder;
    const matched = options.find(
      (opt) => getOptionValue(opt) === selectedValue
    );
    return matched ? getOptionLabel(matched) : selectedValue;
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
          {label}
        </Text>
      )}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
        className={`h-14 border rounded-2xl flex-row items-center justify-between px-4 bg-white ${
          error ? "border-[#EF4444]" : "border-[#E8EDF3]"
        }`}
      >
        <View className="flex-row items-center flex-1 mr-2 h-full">
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={20}
              color="#64748B"
              style={{ marginRight: 10 }}
            />
          )}
          <Text
            className={`text-base flex-1 ${
              selectedValue ? "text-gray-900" : "text-[#94A3B8]"
            }`}
            style={{ textAlignVertical: "center", includeFontPadding: false }}
            numberOfLines={1}
          >
            {currentDisplayLabel()}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#64748B" />
      </TouchableOpacity>

      {error && (
        <Text className="text-xs text-[#EF4444] font-medium mt-1.5 ml-1">
          This field is required
        </Text>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(17, 24, 39, 0.4)", justifyContent: "flex-end" }}>
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-t-[28px] max-h-[60%] pb-6">
                {/* Modal Header */}
                <View className="flex-row justify-between items-center px-6 pt-6 pb-4 border-b border-[#E8EDF3]">
                  <Text className="text-lg font-bold text-[#111827]">
                    Select {label || "Option"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="w-8 h-8 rounded-full bg-[#F1F5F9] items-center justify-center"
                  >
                    <Ionicons name="close" size={18} color="#475569" />
                  </TouchableOpacity>
                </View>

                {/* Options List */}
                <FlatList
                  data={options}
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 12 }}
                  renderItem={({ item }) => {
                    const val = getOptionValue(item);
                    const lbl = getOptionLabel(item);
                    const isSelected = val === selectedValue;

                    return (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          onValueChange(val);
                          setModalVisible(false);
                        }}
                        className="py-4 border-b border-[#F1F5F9] flex-row justify-between items-center"
                      >
                        <Text
                          className={`text-base ${
                            isSelected ? "text-[#2563EB] font-bold" : "text-gray-900"
                          }`}
                        >
                          {lbl}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark" size={20} color="#2563EB" />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
                <SafeAreaView edges={["bottom"]} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
