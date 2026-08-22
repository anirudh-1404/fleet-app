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

export default function DriverInfoCard({
  fullName,
  licenceNumber,
  licenceExpiry,
  phone,
  email,
  emergencyContact,
  employmentStatus,
  vehicle
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
          <InfoItem label="Full Name" value={fullName} />
          <InfoItem label="Licence Number" value={licenceNumber} />
        </View>
        <View className="flex-row gap-4">
          <InfoItem label="Licence Expiry" value={licenceExpiry} />
          <InfoItem label="Phone Number" value={phone} />
        </View>
        <View className="flex-row gap-4">
          <InfoItem label="Email Address" value={email} />
          <InfoItem label="Emergency Contact" value={emergencyContact} />
        </View>
        <View className="flex-row gap-4">
          <InfoItem label="Employment Status" value={employmentStatus} />
          <InfoItem label="Assigned Vehicle" value={vehicle} />
        </View>
      </View>
    </View>
  );
}
