import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomDropdown from "@components/inputs/CustomDropdown";

export default function InspectionVehicleCard({
  vehicles = [],
  selectedVehicleId,
  onSelectVehicle,
  registrationInput,
  onRegistrationInputChange,
  fleetNumber,
  trailerNumber,
  odometer,
  onOdometerChange,
  validationStatus = "VALID", // "VALID" | "INVALID" | "ASSIGNED_OTHER" | "ASSIGNED_SELF"
  assignedDriverName = "",
}) {
  const dropdownOptions = vehicles.map((v) => {
    const isSelf = validationStatus === "ASSIGNED_SELF";
    const driverInfo = v.assignedDriver
      ? typeof v.assignedDriver === "object"
        ? v.assignedDriver.name
        : "Assigned"
      : "Unassigned";

    return {
      label: `${v.registration} (${v.fleetNumber || v.vehicleType}) • ${driverInfo}`,
      value: v._id || v.id,
    };
  });

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
      <Text className="text-sm font-bold text-[#111827] mb-3">
        Select Vehicle to Inspect
      </Text>

      {/* Vehicle Dropdown */}
      {dropdownOptions.length > 0 && (
        <View className="mb-4">
          <CustomDropdown
            label="Choose Fleet Vehicle"
            selectedValue={selectedVehicleId}
            onValueChange={onSelectVehicle}
            options={dropdownOptions}
            placeholder="Select a vehicle from fleet"
            leftIcon="bus-outline"
          />
        </View>
      )}

      {/* Manual Registration Input / Display */}
      <View className="flex-col gap-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-1 mr-3">
            <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
              Vehicle Registration No.
            </Text>
            <View className="flex-row items-center justify-center border border-[#E8EDF3] rounded-xl px-3 h-12 bg-[#F8FAFC]">
              <Ionicons name="car-outline" size={18} color="#6B7280" style={{ marginRight: 6 }} />
              <TextInput
                value={registrationInput}
                onChangeText={onRegistrationInputChange}
                placeholder="e.g. ABC-123"
                autoCapitalize="characters"
                style={{
                  fontSize: 14,
                  height: 48,
                  paddingTop: 0,
                  paddingBottom: 0,
                  paddingVertical: 0,
                  marginVertical: 0,
                  textAlignVertical: "center",
                  includeFontPadding: false,
                }}
                className="font-bold text-[#111827] flex-1"
              />
            </View>
          </View>
          <View className="w-28">
            <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
              Fleet No.
            </Text>
            <View className="border border-[#E8EDF3] rounded-xl px-3 h-12 bg-[#F8FAFC] justify-center items-start">
              <Text className="text-sm font-bold text-[#111827]">{fleetNumber || "N/A"}</Text>
            </View>
          </View>
        </View>

        {/* Validation Status Notice Banner */}
        {validationStatus === "INVALID" && (
          <View className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 flex-row items-center gap-2">
            <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
            <Text className="text-xs font-semibold text-[#DC2626] flex-1">
              Vehicle with registration "{registrationInput}" does not exist in the fleet.
            </Text>
          </View>
        )}

        {validationStatus === "ASSIGNED_OTHER" && (
          <View className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 flex-row items-center gap-2">
            <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
            <Text className="text-xs font-semibold text-[#DC2626] flex-1">
              This vehicle is already assigned to {assignedDriverName || "another driver"}.
            </Text>
          </View>
        )}

        {validationStatus === "ASSIGNED_SELF" && (
          <View className="bg-[#EFF6FF] border border-[#93C5FD] rounded-xl p-3 flex-row items-center gap-2">
            <Ionicons name="checkmark-circle-outline" size={18} color="#2563EB" />
            <Text className="text-xs font-semibold text-[#2563EB] flex-1">
              Currently assigned to you. Ready for inspection.
            </Text>
          </View>
        )}

        {validationStatus === "VALID" && (
          <View className="bg-[#ECFDF5] border border-[#6EE7B7] rounded-xl p-3 flex-row items-center gap-2">
            <Ionicons name="checkmark-circle-outline" size={18} color="#16A34A" />
            <Text className="text-xs font-semibold text-[#16A34A] flex-1">
              Vehicle is available. Completing inspection will assign it to you.
            </Text>
          </View>
        )}

        {/* Trailer & Odometer Inputs */}
        <View className="flex-row justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Trailer No.</Text>
            <Text className="text-sm font-semibold text-[#111827] mt-1">{trailerNumber || "TR-11"}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Odometer Reading</Text>
            <View className="flex-row items-center border-b border-[#E8EDF3] mt-1 h-9">
              <TextInput
                value={odometer}
                onChangeText={onOdometerChange}
                keyboardType="numeric"
                placeholder="e.g. 245860"
                style={{
                  fontSize: 14,
                  height: 36,
                  paddingTop: 0,
                  paddingBottom: 0,
                  paddingVertical: 0,
                  marginVertical: 0,
                  textAlignVertical: "center",
                  includeFontPadding: false,
                }}
                className="font-bold text-[#2563EB] flex-1"
              />
              <Text className="text-[10px] font-bold text-[#6B7280] ml-1">KM</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
