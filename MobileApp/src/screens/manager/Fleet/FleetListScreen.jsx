import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import ROUTES from "@constants/routes";

// Import reusable components
import FleetSearchBar from "@components/fleet/FleetSearchBar";
import VehicleTypeChip from "@components/fleet/VehicleTypeChip";
import VehicleCard from "@components/fleet/VehicleCard";
import EmptyState from "@components/fleet/EmptyState";

import { vehicleService } from "../../../services/vehicleService";

const VEHICLE_TYPES = ["All", "Trucks", "Trailers", "Cars", "Vans", "Utes"];

export default function FleetListScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    if (isFocused) {
      loadVehicles();
    }
  }, [isFocused]);

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      const data = await vehicleService.getVehicles();
      setVehicles(data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Map API fields to UI format expected by VehicleCard
  const formattedVehicles = useMemo(() => {
    return vehicles.map((v) => {
      const driverName = v.assignedDriver ? v.assignedDriver.name : "Unassigned";
      return {
        id: v._id,
        _id: v._id,
        name: `${v.make || ""} ${v.model || v.vehicleType}`.trim(),
        registration: v.registration,
        fleetNumber: v.fleetNumber,
        type: v.vehicleType,
        status: v.status || "Active",
        photo: v.photo || v.imageUrl || "",
        imageUrl: v.photo || v.imageUrl || "",
        driver: {
          name: driverName,
          photo: v.assignedDriver ? v.assignedDriver.photo : "",
        },
      };
    });
  }, [vehicles]);

  // Filtering logic
  const filteredVehicles = useMemo(() => {
    return formattedVehicles.filter((vehicle) => {
      const vType = (vehicle.type || "").toLowerCase();
      const filter = activeFilter.toLowerCase();

      const matchesType =
        activeFilter === "All" ||
        vType === filter ||
        vType.includes(filter.replace(/s$/, "")) ||
        (activeFilter === "Trucks" && vType === "truck") ||
        (activeFilter === "Trailers" && vType === "trailer") ||
        (activeFilter === "Cars" && vType === "car") ||
        (activeFilter === "Vans" && vType === "van") ||
        (activeFilter === "Utes" && vType === "ute");

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === "" ||
        vehicle.registration.toLowerCase().includes(query) ||
        vehicle.name.toLowerCase().includes(query) ||
        vehicle.driver.name.toLowerCase().includes(query);

      return matchesType && matchesSearch;
    });
  }, [formattedVehicles, searchQuery, activeFilter]);

  const handleAddVehicle = () => {
    navigation.navigate(ROUTES.ADD_VEHICLE);
  };

  const handleVehiclePress = (vehicleId) => {
    navigation.navigate(ROUTES.VEHICLE_DETAILS, { vehicleId });
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
            <Text className="text-2xl font-bold text-[#111827]">Fleet</Text>
            <Text className="text-sm text-[#6B7280] mt-0.5">Manage your fleet vehicles</Text>
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleAddVehicle}
          className="bg-[#059669] rounded-[24px] px-4 py-3 flex-row items-center"
          style={{
            shadowColor: "#059669",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Ionicons name="add" size={16} color="white" />
          <Text className="text-white text-xs font-semibold ml-1">Add Vehicle</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Search Section */}
      <View className="px-6 mb-5">
        <FleetSearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      {/* 3. Horizontal Filter Chips */}
      <View className="mb-5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          {VEHICLE_TYPES.map((type) => (
            <VehicleTypeChip
              key={type}
              label={type}
              isActive={activeFilter === type}
              onPress={() => setActiveFilter(type)}
            />
          ))}
        </ScrollView>
      </View>

      {/* 4. Vehicles List */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : (
        <FlatList
          data={filteredVehicles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VehicleCard
              vehicle={item}
              onPress={() => handleVehiclePress(item.id)}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: Platform.OS === "ios" ? 40 : 24,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <EmptyState
              title="No Vehicles Found"
              subtitle="Add your first vehicle to start managing your fleet."
              actionText="Add Vehicle"
              icon="car-outline"
              onActionPress={handleAddVehicle}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
