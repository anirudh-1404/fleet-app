import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ROUTES from "@constants/routes";
import SearchBar from "@components/fleet/SearchBar";
import FilterChip from "@components/fleet/FilterChip";
import StatusBadge from "@components/fleet/StatusBadge";
import EmptyState from "@components/fleet/EmptyState";
import { useFleetData } from "../../../context/FleetDataContext";

const FILTER_OPTIONS = ["All", "Due Soon", "Overdue", "Normal", "Completed"];

export default function DueServiceScreen() {
  const navigation = useNavigation();
  const { services } = useFleetData();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredServices = useMemo(() => {
    return services.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.vehicleName.toLowerCase().includes(q) ||
        item.registration.toLowerCase().includes(q) ||
        (item.fleetNumber && item.fleetNumber.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (activeFilter === "All") return true;
      return item.status === activeFilter;
    });
  }, [services, searchQuery, activeFilter]);

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 flex-row items-center mb-5">
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
          <Text className="text-2xl font-bold text-[#111827]">Due Service</Text>
          <Text className="text-sm text-[#6B7280] mt-0.5">Vehicles requiring upcoming maintenance</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-6 mb-4">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by vehicle, rego, fleet number..."
        />
      </View>

      {/* Filters */}
      <View className="mb-5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          {FILTER_OPTIONS.map((opt) => (
            <FilterChip
              key={opt}
              label={opt}
              isActive={activeFilter === opt}
              onPress={() => setActiveFilter(opt)}
            />
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
          flexGrow: 1,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate(ROUTES.SERVICE_DETAILS, { serviceId: item.id })}
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
                  Rego: {item.registration} | Fleet: {item.fleetNumber}
                </Text>
              </View>
              <StatusBadge status={item.status} />
            </View>
            <View className="border-t border-[#E8EDF3] pt-3 mt-1 flex-col gap-2">
              <View className="flex-row justify-between">
                <Text className="text-xs text-[#6B7280]">Last Service Date</Text>
                <Text className="text-xs font-semibold text-[#111827]">{item.lastService}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-[#6B7280]">Next Service Due</Text>
                <Text className="text-xs font-bold text-[#2563EB]">{item.nextService}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-[#6B7280]">Days Remaining</Text>
                <Text
                  className={`text-xs font-bold ${
                    item.daysRemaining <= 0
                      ? "text-[#DC2626]"
                      : item.daysRemaining <= 7
                      ? "text-[#D97706]"
                      : "text-[#16A34A]"
                  }`}
                >
                  {item.daysRemaining <= 0 ? "Overdue" : `${item.daysRemaining} Days`}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-[#6B7280]">Health Condition</Text>
                <Text
                  className={`text-xs font-bold ${
                    item.healthStatus === "Good"
                      ? "text-[#16A34A]"
                      : item.healthStatus === "Critical"
                      ? "text-[#DC2626]"
                      : "text-[#D97706]"
                  }`}
                >
                  {item.healthStatus}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Services Found"
            subtitle="There are no vehicle service schedules matching your filter or search query."
            icon="construct-outline"
            actionText="Clear Filters"
            onActionPress={() => {
              setSearchQuery("");
              setActiveFilter("All");
            }}
          />
        }
      />
    </SafeAreaView>
  );
}
