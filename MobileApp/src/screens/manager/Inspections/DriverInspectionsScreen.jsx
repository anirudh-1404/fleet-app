import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ROUTES from "@constants/routes";

// Import reusable components
import InspectionsSearchBar from "@components/fleet/InspectionsSearchBar";
import FilterChip from "@components/fleet/FilterChip";
import StatusBadge from "@components/fleet/StatusBadge";
import EmptyState from "@components/fleet/EmptyState";

import { inspectionService } from "../../../services/inspectionService";
import { useFleetData } from "../../../context/FleetDataContext";

// Import dummy data fallback
import { MOCK_INSPECTIONS } from "@data/managerInspections";

const FILTER_OPTIONS = ["Today", "Pending", "Completed", "Journey Started"];

export default function DriverInspectionsScreen() {
  const navigation = useNavigation();
  const { inspections: contextInspections } = useFleetData();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Today");
  const [realInspections, setRealInspections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    setIsLoading(true);
    try {
      const data = await inspectionService.getManagerInspections();
      if (Array.isArray(data)) {
        setRealInspections(data);
      }
    } catch (err) {
      console.warn("Could not load backend inspections:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const displayList = useMemo(() => {
    const list = realInspections.length > 0 ? realInspections : (contextInspections || []);
    return list.map((item) => ({
      id: item._id || item.id,
      driver: {
        name: item.driver ? (typeof item.driver === "object" ? item.driver.name : "Driver") : "Driver",
      },
      vehicle: {
        name: item.vehicle ? `${item.vehicle.make || ""} ${item.vehicle.model || ""}`.trim() || item.vehicleRegistration : item.vehicleRegistration || "Vehicle",
        registration: item.vehicleRegistration || (item.vehicle ? item.vehicle.registration : "N/A"),
        fleetNumber: item.fleetNumber || (item.vehicle ? item.vehicle.fleetNumber : "N/A"),
      },
      inspectionStatus: item.overallStatus || "Completed",
      journeyStatus: "Started",
      inspectionTime: item.submittedAt ? new Date(item.submittedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "Today",
      journeyStartTime: "07:30 AM",
      summary: {
        pass: item.passCount || 0,
        fail: item.failCount || 0,
        na: item.naCount || 0,
        notes: item.notesCount || 0,
      },
    }));
  }, [realInspections, contextInspections]);

  // Filtering logic
  const filteredInspections = useMemo(() => {
    return displayList.filter((item) => {
      // 1. Search Query Filter (Driver name, registration, fleet number)
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === "" ||
        (item.driver && item.driver.name && item.driver.name.toLowerCase().includes(query)) ||
        (item.vehicle && item.vehicle.registration && item.vehicle.registration.toLowerCase().includes(query)) ||
        (item.vehicle && item.vehicle.fleetNumber && item.vehicle.fleetNumber.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // 2. Filter Chip logic
      if (activeFilter === "Pending") {
        return item.inspectionStatus === "Pending";
      }
      if (activeFilter === "Completed") {
        return item.inspectionStatus === "Completed";
      }
      if (activeFilter === "Journey Started") {
        return item.journeyStatus === "Started";
      }

      return true;
    });
  }, [displayList, searchQuery, activeFilter]);

  const handleCardPress = (id, status) => {
    navigation.navigate(ROUTES.INSPECTION_DETAILS, { inspectionId: id });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      {/* ========================= */}
      {/* 1. Header Section */}
      {/* ========================= */}
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
          <Text className="text-2xl font-bold text-[#111827]">Driver Inspections</Text>
          <Text className="text-sm text-[#6B7280] mt-0.5">
            Review daily vehicle inspection reports
          </Text>
        </View>
      </View>

      {/* ========================= */}
      {/* 2. Search Section */}
      {/* ========================= */}
      <View className="px-6 mb-5">
        <InspectionsSearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      {/* ========================= */}
      {/* 3. Filter Section */}
      {/* ========================= */}
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

      {/* ========================= */}
      {/* 4. List Section */}
      {/* ========================= */}
      <FlatList
        data={filteredInspections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleCardPress(item.id, item.status)}
            className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 mb-4"
            style={{
              shadowColor: "#111827",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.015,
              shadowRadius: 10,
              elevation: 1,
            }}
          >
            {/* Top Row: Driver Name and Status Badges */}
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-4">
                <Text className="text-base font-bold text-[#111827]">
                  {item.driver.name}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <StatusBadge status={item.inspectionStatus} />
                <StatusBadge status={item.journeyStatus} />
              </View>
            </View>

            {/* Middle Row: Vehicle & Timing Details */}
            <View className="bg-[#F8FAFC] border border-[#E8EDF3] rounded-[16px] px-4 py-3 my-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-xs font-semibold text-[#6B7280]">Vehicle</Text>
                <Text className="text-xs font-bold text-[#111827]">
                  {item.vehicle.name}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-xs font-semibold text-[#6B7280]">Registration</Text>
                <Text className="text-xs font-semibold text-[#111827]">
                  {item.vehicle.registration}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-xs font-semibold text-[#6B7280]">Inspection Time</Text>
                <Text className="text-xs font-semibold text-[#111827]">
                  {item.inspectionTime}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-xs font-semibold text-[#6B7280]">Journey Start Time</Text>
                <Text className="text-xs font-semibold text-[#111827]">
                  {item.journeyStartTime}
                </Text>
              </View>
            </View>

            {/* Bottom Row: Summary Counts & Chevron */}
            <View className="flex-row items-center justify-between border-t border-[#E8EDF3] pt-4 mt-1">
              <View className="flex-row items-center gap-5">
                <View>
                  <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Pass
                  </Text>
                  <Text className="text-sm font-bold text-[#16A34A] mt-0.5">
                    {item.summary.pass}
                  </Text>
                </View>
                <View>
                  <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Fail
                  </Text>
                  <Text className="text-sm font-bold text-[#DC2626] mt-0.5">
                    {item.summary.fail}
                  </Text>
                </View>
                <View>
                  <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    N/A
                  </Text>
                  <Text className="text-sm font-bold text-[#6B7280] mt-0.5">
                    {item.summary.na}
                  </Text>
                </View>
                <View>
                  <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Notes
                  </Text>
                  <Text
                    className={`text-sm font-bold mt-0.5 ${
                      item.summary.notes > 0 ? "text-[#059669]" : "text-[#6B7280]"
                    }`}
                  >
                    {item.summary.notes}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
          flexGrow: 1
        }}
        ListEmptyComponent={
          <EmptyState
            title="No Drivers Found"
            subtitle="There are no drivers that match the selected filter or search term."
            actionText="Clear Filters"
            icon="people-outline"
            onActionPress={() => {
              setSearchQuery("");
              setActiveFilter("Today");
            }}
          />
        }
      />
    </SafeAreaView>
  );
}
