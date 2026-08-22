import React from "react";
import { View, Text } from "react-native";

const InfoItem = ({ label, value }) => {
  return (
    <View className="flex-1">
      <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">{label}</Text>
      <Text className="text-sm font-semibold text-[#111827] mt-1" numberOfLines={1} ellipsizeMode="tail">
        {value}
      </Text>
    </View>
  );
};

export default function VehicleInfoCard({
  registration,
  fleetNumber,
  type,
  make,
  model,
  year,
  vin,
  createdDate = "01 June 2026"
}) {
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
      <View className="flex-col gap-5">
        <View className="flex-row gap-4">
          <InfoItem label="Registration" value={registration} />
          <InfoItem label="Fleet Number" value={fleetNumber} />
        </View>
        <View className="flex-row gap-4">
          <InfoItem label="Vehicle Type" value={type} />
          <InfoItem label="Make" value={make} />
        </View>
        <View className="flex-row gap-4">
          <InfoItem label="Model" value={model} />
          <InfoItem label="Year" value={year} />
        </View>
        <View className="flex-row gap-4">
          <InfoItem label="VIN" value={vin} />
          <InfoItem label="Created Date" value={createdDate} />
        </View>
      </View>
    </View>
  );
}
