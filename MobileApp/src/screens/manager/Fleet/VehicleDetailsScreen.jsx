import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useIsFocused } from "@react-navigation/native";
import ROUTES from "@constants/routes";

// Import custom reusable components
import SectionHeader from "@components/fleet/SectionHeader";
import VehicleHeroCard from "@components/fleet/VehicleHeroCard";
import VehicleInfoCard from "@components/fleet/VehicleInfoCard";
import AssignedDriverCard from "@components/fleet/AssignedDriverCard";
import ServiceCard from "@components/fleet/ServiceCard";
import QuickActionCard from "@components/fleet/QuickActionCard";
import RecentActivityCard from "@components/fleet/RecentActivityCard";
import PrimaryButton from "@components/buttons/PrimaryButton";

import { vehicleService } from "../../../services/vehicleService";

export default function VehicleDetailsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const isFocused = useIsFocused();

  const { vehicleId } = route.params || {};

  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (vehicleId && isFocused) {
      loadVehicle();
    }
  }, [vehicleId, isFocused]);

  const loadVehicle = async () => {
    setIsLoading(true);
    try {
      const data = await vehicleService.getVehicleById(vehicleId);
      setVehicle(data);
    } catch (error) {
      console.error("Error loading vehicle details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionPress = (actionName) => {
    if (actionName === "Edit Vehicle") {
      navigation.navigate(ROUTES.EDIT_VEHICLE, { vehicleId });
    } else if (actionName === "Assign Driver" || actionName === "Assign / Change Driver") {
      navigation.navigate(ROUTES.ASSIGN_DRIVER, { vehicleId });
    } else {
      Alert.alert("Quick Action", `${actionName} details recorded.`);
    }
  };

  if (isLoading || !vehicle) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F7FA] justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  const vehicleName = `${vehicle.make || ""} ${vehicle.model || vehicle.vehicleType}`.trim();
  const driverObj = vehicle.assignedDriver;
  const driverName = driverObj ? driverObj.name : "Unassigned";

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      {/* 1. Top App Bar */}
      <View className="px-6 pt-4 flex-row justify-between items-center mb-5">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-white border border-[#E8EDF3] items-center justify-center"
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
        <Text className="text-lg font-bold text-[#111827]">Vehicle Details</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleActionPress("Options Menu")}
          className="w-10 h-10 rounded-full bg-white border border-[#E8EDF3] items-center justify-center"
          style={{
            shadowColor: "#111827",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.015,
            shadowRadius: 10,
            elevation: 1,
          }}
        >
          <Ionicons name="ellipsis-horizontal-outline" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
        }}
      >
        {/* 2. Top Hero Card */}
        <View className="px-6 mb-6">
          <VehicleHeroCard
            name={vehicleName}
            registration={vehicle.registration}
            fleetNumber={vehicle.fleetNumber}
            type={vehicle.vehicleType}
            status={vehicle.status || "Active"}
            imageUrl={vehicle.photo || vehicle.imageUrl}
          />
        </View>

        {/* 3. Vehicle Information Card */}
        <View className="px-6 mb-6">
          <SectionHeader title="Vehicle Information" />
          <VehicleInfoCard
            registration={vehicle.registration}
            fleetNumber={vehicle.fleetNumber}
            type={vehicle.vehicleType}
            make={vehicle.make || "N/A"}
            model={vehicle.model || "N/A"}
            year={vehicle.year ? String(vehicle.year) : "2024"}
            vin={vehicle.vin || "N/A"}
            createdDate="12 Jan 2026"
          />
        </View>

        {/* 4. Assigned Driver Card */}
        <View className="px-6 mb-6">
          <SectionHeader title="Assigned Driver" />
          <AssignedDriverCard
            name={driverName}
            licence="AU-248716"
            phone={driverObj ? driverObj.phone : "Unassigned"}
            status={driverObj ? "Active" : "Unassigned"}
            onPress={() => {
              if (driverObj) {
                navigation.navigate(ROUTES.DRIVER_DETAILS, { driverId: driverObj._id || driverObj.id });
              }
            }}
          />
        </View>

        {/* 5. Service Information Card */}
        <View className="px-6 mb-6">
          <SectionHeader title="Service & Schedule" />
          <ServiceCard
            lastService="15 Jun 2026"
            nextService="15 Aug 2026"
            regoExpiry="12 Oct 2026"
            insuranceExpiry="01 Nov 2026"
          />
        </View>

        {/* 6. Quick Actions Grid */}
        <View className="px-6 mb-6">
          <SectionHeader title="Quick Actions" />
          <View className="flex-col gap-4">
            <View className="flex-row gap-4">
              <QuickActionCard
                title="Edit Vehicle"
                description="Update vehicle details"
                icon="create-outline"
                onPress={() => handleActionPress("Edit Vehicle")}
              />
              <QuickActionCard
                title="Assign Driver"
                description="Assign or change driver"
                icon="person-add-outline"
                onPress={() => handleActionPress("Assign Driver")}
              />
            </View>
            <View className="flex-row gap-4">
              <QuickActionCard
                title="Fuel History"
                description="View fuel entries"
                icon="flash-outline"
                onPress={() => handleActionPress("Fuel History")}
              />
              <QuickActionCard
                title="Invoices"
                description="View billing & receipts"
                icon="receipt-outline"
                onPress={() => handleActionPress("Invoices")}
              />
            </View>
          </View>
        </View>

        {/* 7. Recent Activity Section */}
        <View className="px-6">
          <SectionHeader title="Recent Activity" />
          <View className="bg-white border border-[#E8EDF3] rounded-[24px] px-5">
            <RecentActivityCard
              title="Service Completed"
              subtitle="Completed • 2 hours ago"
              icon="construct-outline"
            />
            <RecentActivityCard
              title={`Assigned to ${driverName}`}
              subtitle="Completed • Yesterday"
              icon="person-outline"
              isLast={true}
            />
          </View>
        </View>
      </ScrollView>

      {/* 8. Sticky Bottom Actions */}
      <View
        className="bg-[#FFFFFF] border-t border-[#E8EDF3] px-6 pt-4 flex-col gap-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <PrimaryButton
          title="Edit Vehicle"
          onPress={() => handleActionPress("Edit Vehicle")}
        />
        <TouchableOpacity
          activeOpacity={0.75}
          className="h-14 border border-[#111827] rounded-2xl bg-white items-center justify-center"
          onPress={() => handleActionPress("Assign / Change Driver")}
        >
          <Text className="text-[#111827] text-base font-semibold">
            Assign / Change Driver
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
