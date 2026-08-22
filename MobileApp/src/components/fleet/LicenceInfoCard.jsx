import React from "react";
import { View, Text } from "react-native";

const LicenceRow = ({ label, value, isStatus, statusValue }) => (
  <View className="flex-1">
    <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">{label}</Text>
    {isStatus ? (
      <View className="flex-row items-center mt-1">
        <View className={`px-2.5 py-0.5 rounded-full ${
          statusValue === "Valid" ? "bg-[#ECFDF5]" : statusValue === "Expiring Soon" ? "bg-[#FFFBEB]" : "bg-[#FEF2F2]"
        }`}>
          <Text className={`text-[10px] font-bold ${
            statusValue === "Valid" ? "text-[#16A34A]" : statusValue === "Expiring Soon" ? "text-[#D97706]" : "text-[#DC2626]"
          }`}>{statusValue}</Text>
        </View>
      </View>
    ) : (
      <Text className="text-sm font-semibold text-[#111827] mt-1">{value}</Text>
    )}
  </View>
);

export default function LicenceInfoCard({ licenceNumber, licenceClass, issueDate, expiryDate, status }) {
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
          <LicenceRow label="Licence Number" value={licenceNumber} />
          <LicenceRow label="Licence Class" value={licenceClass} />
        </View>
        <View className="flex-row gap-4">
          <LicenceRow label="Issue Date" value={issueDate} />
          <LicenceRow label="Expiry Date" value={expiryDate} />
        </View>
        <View className="flex-row gap-4">
          <LicenceRow label="Licence Status" isStatus={true} statusValue={status} />
          <View className="flex-1" />
        </View>
      </View>
    </View>
  );
}
