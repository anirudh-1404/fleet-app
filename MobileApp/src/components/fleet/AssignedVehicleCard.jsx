import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "./StatusBadge";

export default function AssignedVehicleCard({
  name,
  registration,
  status = "Assigned",
  fleetNumber,
  trailerNumber,
  photo,
  isDriverView = false,
  isUnassigned = false,
  onPress
}) {
  if (isUnassigned || !name) {
    return (
      <View
        className="bg-white border border-[#E2E8F0] rounded-[24px] p-5 flex-row items-center justify-between"
        style={{
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.025,
          shadowRadius: 12,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center flex-1">
          <View className="w-14 h-14 rounded-[18px] bg-[#F8FAFC] items-center justify-center mr-4 border border-[#E2E8F0]">
            <Ionicons name="bus-outline" size={26} color="#94A3B8" />
          </View>
          <View className="flex-1">
            <View className="flex-row justify-between items-center mr-1">
              <Text className="text-base font-bold text-[#334155]">No Vehicle Assigned</Text>
              <View className="px-2.5 py-0.5 rounded-full bg-[#F1F5F9] border border-[#CBD5E1]">
                <Text className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Unassigned</Text>
              </View>
            </View>
            <Text className="text-xs text-[#64748B] mt-1 font-medium leading-4">
              Select vehicle during start inspection to assign yourself.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      activeOpacity={0.75}
      onPress={onPress}
      className="bg-white border border-[#E2E8F0] rounded-[24px] p-5 flex-row items-center justify-between"
      style={{
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center flex-1 mr-4">
        {/* Photo Placeholder / Icon */}
        <View className="w-14 h-14 rounded-[18px] bg-[#EFF6FF] items-center justify-center mr-4 border border-[#BFDBFE] overflow-hidden">
          {photo ? (
            <Image
              source={{ uri: photo }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="bus-outline" size={26} color="#2563EB" />
          )}
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between items-center mr-1 mb-0.5">
            <Text className="text-base font-extrabold text-[#0F172A]">{name}</Text>
            <StatusBadge status={status || "Assigned"} />
          </View>
          <Text className="text-xs font-semibold text-[#64748B]">
            Rego: <Text className="font-bold text-[#1E293B]">{registration}</Text>
            {fleetNumber ? ` • Fleet: ${fleetNumber}` : ""}
          </Text>
          {trailerNumber && (
            <Text className="text-[11px] font-semibold text-[#94A3B8] mt-1">
              Trailer: {trailerNumber}
            </Text>
          )}
        </View>
      </View>
      {!isDriverView && onPress && (
        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
      )}
    </CardContainer>
  );
}
