import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import ROUTES from "@constants/routes";

// Import reusable components
import DriverSearchBar from "@components/fleet/DriverSearchBar";
import FilterChip from "@components/fleet/FilterChip";
import DriverCard from "@components/fleet/DriverCard";
import EmptyState from "@components/fleet/EmptyState";

import { driverService } from "../../../services/driverService";

const FILTER_OPTIONS = ["All", "Active", "On Leave", "Unassigned", "Inactive"];

export default function DriverListScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    if (isFocused) {
      loadDrivers();
    }
  }, [isFocused]);

  const loadDrivers = async () => {
    setIsLoading(true);
    try {
      const data = await driverService.getDrivers();
      setDrivers(data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Map API fields to UI format expected by DriverCard
  const formattedDrivers = useMemo(() => {
    return drivers.map((d) => {
      const vehicleName = d.assignedVehicle
        ? `${d.assignedVehicle.make || ""} ${d.assignedVehicle.model || d.assignedVehicle.vehicleType} (${d.assignedVehicle.registration})`.trim()
        : "Unassigned";

      return {
        id: d._id,
        _id: d._id,
        name: d.name,
        email: d.email,
        phone: d.phone || "-",
        licence: d.licence || "-",
        status: d.status || "Active",
        vehicle: vehicleName,
        photo: d.photo || "",
      };
    });
  }, [drivers]);

  // Filter logic
  const filteredDrivers = useMemo(() => {
    return formattedDrivers.filter((driver) => {
      const matchesStatus =
        activeFilter === "All" ||
        driver.status.toLowerCase() === activeFilter.toLowerCase() ||
        (activeFilter === "Unassigned" && driver.vehicle === "Unassigned");

      const search = searchQuery.toLowerCase().trim();
      const matchesSearch =
        search === "" ||
        driver.name.toLowerCase().includes(search) ||
        driver.licence.toLowerCase().includes(search) ||
        driver.vehicle.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [formattedDrivers, searchQuery, activeFilter]);

  const handleAddDriver = () => {
    navigation.navigate(ROUTES.ADD_DRIVER || "AddDriver");
  };

  const handleDriverPress = (driverId) => {
    navigation.navigate(ROUTES.DRIVER_DETAILS, { driverId });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      {/* 1. Header Section */}
      <View className="px-6 pt-4 flex-row justify-between items-center mb-5">
        <View className="flex-row items-center flex-1 mr-4">
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
            <Text className="text-2xl font-bold text-[#111827]">Drivers</Text>
            <Text className="text-sm text-[#6B7280] mt-0.5">Manage your fleet drivers</Text>
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleAddDriver}
          className="bg-[#2563EB] rounded-[24px] px-4 py-3 flex-row items-center"
          style={{
            shadowColor: "#2563EB",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Ionicons name="add" size={16} color="white" />
          <Text className="text-white text-xs font-semibold ml-1">Add Driver</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Search Section */}
      <View className="px-6 mb-5">
        <DriverSearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      {/* 3. Filter Section */}
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

      {/* 4. List Section */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={filteredDrivers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DriverCard
              driver={item}
              onPress={() => handleDriverPress(item.id)}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: Platform.OS === "ios" ? 40 : 24,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <EmptyState
              title="No Drivers Found"
              subtitle="Add your first driver to start managing your fleet."
              actionText="Add Driver"
              icon="person-outline"
              onActionPress={handleAddDriver}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
