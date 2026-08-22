import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform,
  TextInput,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ROUTES from "@constants/routes";

import SearchBar from "@components/fleet/SearchBar";
import FilterChip from "@components/fleet/FilterChip";
import EmptyState from "@components/fleet/EmptyState";
import DriverActivityCard from "@components/fleet/DriverActivityCard";

import { useFleetData } from "../../../context/FleetDataContext";

const DATE_FILTERS = ["Today", "Yesterday", "This Week", "Custom Date"];
const STATUS_FILTERS = [
  "All",
  "Inspection Pending",
  "Inspection Completed",
  "Failed",
  "Journey Started",
  "Journey Not Started"
];

export default function TodaysOperationsScreen() {
  const navigation = useNavigation();
  const { driverActivities, fetchOperationsData } = useFleetData();

  const [selectedDateFilter, setSelectedDateFilter] = useState("Today");

  // Dynamic date helpers
  const getFormattedDate = (daysOffset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const todayStr = getFormattedDate(0);
  const yesterdayStr = getFormattedDate(-1);
  const weekStartStr = getFormattedDate(-7);

  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);

  const [activeStatusFilter, setActiveStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadBackendOperations = useCallback(async () => {
    setIsRefreshing(true);
    let from = todayStr;
    let to = todayStr;

    if (selectedDateFilter === "Yesterday") {
      from = yesterdayStr;
      to = yesterdayStr;
    } else if (selectedDateFilter === "This Week") {
      from = weekStartStr;
      to = todayStr;
    } else if (selectedDateFilter === "Custom Date") {
      from = fromDate || todayStr;
      to = toDate || todayStr;
    }

    try {
      if (fetchOperationsData) {
        await fetchOperationsData({
          from,
          to,
          status: activeStatusFilter,
          search: searchQuery,
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedDateFilter, fromDate, toDate, activeStatusFilter, searchQuery, todayStr, yesterdayStr, weekStartStr, fetchOperationsData]);

  useEffect(() => {
    loadBackendOperations();
  }, [loadBackendOperations]);

  const handleCardPress = (activity) => {
    if (activity.inspectionId) {
      navigation.navigate(ROUTES.INSPECTION_DETAILS, { inspectionId: activity.inspectionId });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      {/* 1. Header Bar */}
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
          <Text className="text-2xl font-bold text-[#111827]">Today's Operations</Text>
          <Text className="text-sm text-[#6B7280] mt-0.5">
            Operational status & driver readiness
          </Text>
        </View>
        {isRefreshing && <ActivityIndicator color="#2563EB" size="small" />}
      </View>

      {/* 2. Date Filter Bar */}
      <View className="mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          {DATE_FILTERS.map((dOpt) => (
            <FilterChip
              key={dOpt}
              label={dOpt}
              isActive={selectedDateFilter === dOpt}
              onPress={() => setSelectedDateFilter(dOpt)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Custom Date Range Picker inputs if Custom Date selected */}
      {selectedDateFilter === "Custom Date" && (
        <View className="px-6 mb-4 flex-row gap-3">
          <View className="flex-1 bg-white border border-[#E8EDF3] rounded-[16px] px-3 py-2">
            <Text className="text-[10px] font-bold text-[#6B7280] uppercase">From Date</Text>
            <TextInput
              value={fromDate}
              onChangeText={setFromDate}
              placeholder="YYYY-MM-DD"
              className="text-xs font-semibold text-[#111827] mt-0.5"
            />
          </View>
          <View className="flex-1 bg-white border border-[#E8EDF3] rounded-[16px] px-3 py-2">
            <Text className="text-[10px] font-bold text-[#6B7280] uppercase">To Date</Text>
            <TextInput
              value={toDate}
              onChangeText={setToDate}
              placeholder="YYYY-MM-DD"
              className="text-xs font-semibold text-[#111827] mt-0.5"
            />
          </View>
        </View>
      )}

      {/* 3. Search Bar */}
      <View className="px-6 mb-4">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search driver, vehicle, or rego..."
        />
      </View>

      {/* 4. Status Filter Chips */}
      <View className="mb-5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          {STATUS_FILTERS.map((sOpt) => (
            <FilterChip
              key={sOpt}
              label={sOpt}
              isActive={activeStatusFilter === sOpt}
              onPress={() => setActiveStatusFilter(sOpt)}
            />
          ))}
        </ScrollView>
      </View>

      {/* 5. Driver Activity List */}
      <FlatList
        data={driverActivities}
        keyExtractor={(item) => item.id || item.driverId}
        renderItem={({ item }) => (
          <DriverActivityCard
            activity={item}
            onPress={() => handleCardPress(item)}
          />
        )}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
          flexGrow: 1
        }}
        ListEmptyComponent={
          <EmptyState
            title="No driver activity"
            subtitle="No inspections or journeys were recorded for this date."
            icon="compass-outline"
            actionText="Reset Filters"
            onActionPress={() => {
              setSelectedDateFilter("Today");
              setActiveStatusFilter("All");
              setSearchQuery("");
            }}
          />
        }
      />
    </SafeAreaView>
  );
}
