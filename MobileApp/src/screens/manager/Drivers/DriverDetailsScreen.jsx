import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useIsFocused } from "@react-navigation/native";
import ROUTES from "@constants/routes";

// Import custom reusable components
import SectionHeader from "@components/fleet/SectionHeader";
import DriverHeroCard from "@components/fleet/DriverHeroCard";
import DriverInfoCard from "@components/fleet/DriverInfoCard";
import QuickActionCard from "@components/fleet/QuickActionCard";
import LicenceInfoCard from "@components/fleet/LicenceInfoCard";
import AssignedVehicleCard from "@components/fleet/AssignedVehicleCard";
import RecentActivityCard from "@components/fleet/RecentActivityCard";

import { driverService } from "../../../services/driverService";
import { getDriverById as getMockDriverById } from "@data/drivers";

export default function DriverDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();

  const { driverId } = route.params || {};

  const [driver, setDriver] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isFocused) {
      fetchDriverDetails();
    }
  }, [driverId, isFocused]);

  const fetchDriverDetails = async () => {
    setIsLoading(true);
    try {
      if (driverId) {
        const backendDriver = await driverService.getDriverById(driverId);
        if (backendDriver) {
          setDriver(backendDriver);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not fetch driver from backend API, using mock fallback:", e.message);
    } finally {
      setIsLoading(false);
    }

    // Fallback to mock data if API call is null or fails
    const mock = getMockDriverById(driverId || "1");
    setDriver(mock);
  };

  const handleActionPress = (actionName) => {
    console.log(`Action pressed: ${actionName}`);
  };

  if (isLoading && !driver) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F7FA] justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  const name = driver ? driver.name : "Driver";
  const status = driver ? (driver.status || "Active") : "Active";
  const phone = driver?.phone || "-";
  const email = driver?.email || "-";
  const licence = driver?.licence || "-";

  // Vehicle formatting
  let vehicleName = "Unassigned";
  let assignedVehicleId = null;
  let vehicleRego = "";
  let vehicleStatus = "Active";

  if (driver && driver.assignedVehicle) {
    if (typeof driver.assignedVehicle === "object") {
      assignedVehicleId = driver.assignedVehicle._id || driver.assignedVehicle.id;
      vehicleRego = driver.assignedVehicle.registration || "";
      vehicleStatus = driver.assignedVehicle.status || "Active";
      vehicleName = `${driver.assignedVehicle.make || ""} ${driver.assignedVehicle.model || driver.assignedVehicle.vehicleType} (${vehicleRego})`.trim();
    } else if (typeof driver.assignedVehicle === "string") {
      vehicleName = driver.assignedVehicle;
    }
  } else if (driver && driver.vehicle && driver.vehicle !== "Not Assigned") {
    vehicleName = driver.vehicle;
  }

  const isUnassigned = vehicleName === "Unassigned" || vehicleName === "Not Assigned";

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
        <Text className="text-lg font-bold text-[#111827]">Driver Details</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleActionPress("Menu")}
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
        {/* 2. Driver Hero Card */}
        <View className="px-6 mb-6">
          <DriverHeroCard
            name={name}
            status={status}
            licence={licence}
            vehicle={vehicleName}
            phone={phone}
            email={email}
          />
        </View>

        {/* 3. Driver Information */}
        <View className="px-6 mb-6">
          <SectionHeader title="Driver Information" />
          <DriverInfoCard
            fullName={name}
            licenceNumber={licence}
            licenceExpiry={driver?.licenceExpiry || "-"}
            phone={phone}
            email={email}
            emergencyContact={driver?.emergencyContact || "-"}
            employmentStatus={driver?.employmentStatus || "-"}
            vehicle={vehicleName}
          />
        </View>

        {/* 4. Quick Actions Grid */}
        <View className="px-6 mb-6">
          <SectionHeader title="Quick Actions" />
          <View className="flex-col gap-4">
            <View className="flex-row gap-4">
              <QuickActionCard
                title="Driver Pre Check"
                description="View latest reports"
                icon="checkbox-outline"
                onPress={() => navigation.navigate(ROUTES.DRIVER_INSPECTIONS)}
              />
              <QuickActionCard
                title="Assign / Change Vehicle"
                description={isUnassigned ? "Click to assign vehicle" : vehicleName}
                icon="car-sport-outline"
                onPress={() => {
                  navigation.navigate(ROUTES.ASSIGN_DRIVER, {
                    driverId: driver?._id || driver?.id || driverId,
                    vehicleId: assignedVehicleId,
                  });
                }}
              />
            </View>
            <View className="flex-row gap-4">
              <QuickActionCard
                title="Documents"
                description="Licence & permits"
                icon="document-text-outline"
                onPress={() => handleActionPress("Documents")}
              />
              <QuickActionCard
                title="Contact Driver"
                description="Send message or call"
                icon="chatbubble-ellipses-outline"
                onPress={() => handleActionPress("Contact")}
              />
            </View>
          </View>
        </View>

        {/* 5. Assigned Vehicle Section or Unassigned Prompt */}
        <View className="px-6 mb-6">
          <SectionHeader title="Assigned Vehicle" />
          {!isUnassigned ? (
            <AssignedVehicleCard
              name={vehicleName}
              registration={vehicleRego}
              status={vehicleStatus}
              onPress={() => {
                if (assignedVehicleId) {
                  navigation.navigate(ROUTES.VEHICLE_DETAILS, { vehicleId: assignedVehicleId });
                }
              }}
            />
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                navigation.navigate(ROUTES.ASSIGN_DRIVER, {
                  driverId: driver?._id || driver?.id || driverId,
                });
              }}
              className="bg-white border border-dashed border-[#2563EB]/40 bg-[#EFF6FF]/30 rounded-[24px] p-5 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1 mr-3">
                <View className="w-12 h-12 rounded-full bg-[#2563EB] items-center justify-center mr-3">
                  <Ionicons name="bus-outline" size={22} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-[#111827]">No Vehicle Assigned</Text>
                  <Text className="text-xs text-[#6B7280] mt-0.5">Tap here to assign a vehicle to this driver</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#2563EB" />
            </TouchableOpacity>
          )}
        </View>

        {/* 6. Licence Information */}
        <View className="px-6 mb-6">
          <SectionHeader title="Licence Details" />
          <LicenceInfoCard
            licenceNumber={licence}
            licenceClass={driver?.licenceClass || "-"}
            issueDate={driver?.issueDate || "-"}
            expiryDate={driver?.licenceExpiry || "-"}
            status={driver?.licenceStatus || (driver?.licence ? "Valid" : "-")}
          />
        </View>

        {/* 7. Recent Activity */}
        <View className="px-6">
          <SectionHeader title="Recent Activity" />
          <View className="bg-white border border-[#E8EDF3] rounded-[24px] px-5">
            <RecentActivityCard
              title="Registered driver profile"
              subtitle="Active • Recently"
              icon="person-add-outline"
            />
            <RecentActivityCard
              title={`Vehicle Status: ${vehicleName}`}
              subtitle="Updated"
              icon="car-sport-outline"
              isLast={true}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
