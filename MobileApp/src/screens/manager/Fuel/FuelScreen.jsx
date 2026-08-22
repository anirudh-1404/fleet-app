import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ROUTES from "@constants/routes";
import SearchBar from "@components/fleet/SearchBar";
import EmptyState from "@components/fleet/EmptyState";
import { useFleetData } from "../../../context/FleetDataContext";

export default function FuelScreen() {
  const navigation = useNavigation();
  const { fuelLogs } = useFleetData();
  const [searchQuery, setSearchQuery] = useState("");

  const formattedLogs = useMemo(() => {
    return (fuelLogs || []).map((item) => {
      const v = item.vehicle;
      const d = item.driver || item.createdBy;

      const vehicleName = v
        ? `${v.make || ""} ${v.model || v.vehicleType || ""}`.trim()
        : item.vehicleName || "Vehicle";
      const registration = v ? v.registration : item.registration || "N/A";
      const driverName = d
        ? typeof d === "object"
          ? d.name
          : "Driver"
        : item.driverName || "N/A";

      return {
        id: item._id || item.id,
        _id: item._id || item.id,
        vehicleName,
        registration,
        driverName,
        date: item.date || "Today",
        time: item.time || "12:00 PM",
        liters: item.litres ? `${item.litres} L` : item.liters || "45 L",
        cost: typeof item.cost === "number" ? `$${item.cost.toFixed(2)}` : item.cost || "$120.00",
        odometer: item.odometer ? `${item.odometer} KM` : "245,860 KM",
        vendor: item.vendor || "Shell Fleet",
      };
    });
  }, [fuelLogs]);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return formattedLogs;
    return formattedLogs.filter(
      (item) =>
        item.vehicleName.toLowerCase().includes(q) ||
        item.registration.toLowerCase().includes(q) ||
        item.driverName.toLowerCase().includes(q) ||
        item.vendor.toLowerCase().includes(q)
    );
  }, [formattedLogs, searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 flex-row items-center justify-between mb-5">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white border border-[#E8EDF3] items-center justify-center mr-3"
            style={{
              shadowColor: "#111827",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.015,
              shadowRadius: 10,
              elevation: 1,
            }}
          >
            <Ionicons name="arrow-back-outline" size={20} color="#111827" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-[#111827]">Fuel Data</Text>
            <Text className="text-sm text-[#6B7280] mt-0.5">Monitor driver fuel entries and logs</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-6 mb-5">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by vehicle, rego, driver, or vendor..."
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
          flexGrow: 1,
        }}
        renderItem={({ item }) => (
          <View
            className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 mb-4"
            style={{
              shadowColor: "#111827",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.015,
              shadowRadius: 10,
              elevation: 1,
            }}
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1 mr-2">
                <Text className="text-base font-bold text-[#111827]">{item.vehicleName}</Text>
                <Text className="text-xs text-[#6B7280] mt-0.5">
                  Rego: {item.registration} | Driver: {item.driverName}
                </Text>
              </View>
              <View className="bg-[#EEF4FF] rounded-full px-3 py-1">
                <Text className="text-xs font-bold text-[#2563EB]">{item.liters}</Text>
              </View>
            </View>
            <View className="border-t border-[#E8EDF3] pt-3 mt-1 flex-col gap-2">
              <View className="flex-row justify-between">
                <Text className="text-xs text-[#6B7280]">Date & Time</Text>
                <Text className="text-xs font-semibold text-[#111827]">
                  {item.date} • {item.time}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-[#6B7280]">Total Cost</Text>
                <Text className="text-xs font-bold text-[#16A34A]">{item.cost}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-[#6B7280]">Odometer Reading</Text>
                <Text className="text-xs font-semibold text-[#111827]">{item.odometer}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Fuel Logs Found"
            subtitle="No fuel entries match your search query."
            icon="color-fill-outline"
          />
        }
      />
    </SafeAreaView>
  );
}
