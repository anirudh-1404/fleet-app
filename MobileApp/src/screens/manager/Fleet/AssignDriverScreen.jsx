import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ROUTES from "@constants/routes";

// Import reusable components
import SectionHeader from "@components/fleet/SectionHeader";
import DriverSearchBar from "@components/fleet/DriverSearchBar";
import DriverSelectionCard from "@components/fleet/DriverSelectionCard";
import VehicleSummaryCard from "@components/fleet/VehicleSummaryCard";
import StatusBadge from "@components/fleet/StatusBadge";
import PrimaryButton from "@components/buttons/PrimaryButton";

import { vehicleService } from "../../../services/vehicleService";
import { driverService } from "../../../services/driverService";

export default function AssignDriverScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute();

  const { vehicleId, driverId } = route.params || {};

  const [vehicle, setVehicle] = useState(null);
  const [targetDriver, setTargetDriver] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicleId || null);
  const [selectedDriverId, setSelectedDriverId] = useState(driverId || null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [vehicleId, driverId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vData, dData, allVehicles] = await Promise.all([
        vehicleId ? vehicleService.getVehicleById(vehicleId).catch(() => null) : Promise.resolve(null),
        driverService.getDrivers().catch(() => []),
        vehicleService.getVehicles().catch(() => []),
      ]);

      const allD = dData || [];
      const allV = allVehicles || [];

      setDrivers(allD);
      setVehicles(allV);

      let currentVeh = vData;
      if (!currentVeh && vehicleId) {
        currentVeh = allV.find((v) => (v._id || v.id) === vehicleId) || null;
      }
      if (!currentVeh && allV.length > 0) {
        currentVeh = allV[0];
      }

      setVehicle(currentVeh);
      if (currentVeh) {
        setSelectedVehicleId(currentVeh._id || currentVeh.id);
      }

      if (driverId) {
        const foundDriver = allD.find((d) => (d._id || d.id) === driverId);
        if (foundDriver) {
          setTargetDriver(foundDriver);
          setSelectedDriverId(foundDriver._id || foundDriver.id);
        }
      }

      if (currentVeh && currentVeh.assignedDriver && !driverId) {
        setSelectedDriverId(currentVeh.assignedDriver._id || currentVeh.assignedDriver.id || currentVeh.assignedDriver);
      }
    } catch (error) {
      console.error("Error loading assign driver screen data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formattedDrivers = useMemo(() => {
    return drivers.map((d) => ({
      id: d._id || d.id,
      _id: d._id || d.id,
      name: d.name,
      licence: "DL-994821",
      phone: d.phone || "+61 400 000 000",
      status: d.status || "Active",
      vehicle: d.assignedVehicle ? d.assignedVehicle.registration || d.assignedVehicle : "Unassigned",
    }));
  }, [drivers]);

  const filteredDrivers = useMemo(() => {
    return formattedDrivers.filter((d) => {
      const query = searchQuery.toLowerCase().trim();
      return (
        query === "" ||
        d.name.toLowerCase().includes(query) ||
        d.licence.toLowerCase().includes(query) ||
        d.vehicle.toLowerCase().includes(query)
      );
    });
  }, [formattedDrivers, searchQuery]);

  const handleAssign = async () => {
    const targetVehId = selectedVehicleId || (vehicle ? (vehicle._id || vehicle.id) : null);
    const targetDrvId = selectedDriverId;

    if (!targetVehId) {
      Alert.alert("Missing Vehicle", "Please select a vehicle to assign.");
      return;
    }

    if (!targetDrvId) {
      Alert.alert("Missing Driver", "Please select a driver to assign.");
      return;
    }

    setIsSubmitting(true);
    try {
      await vehicleService.assignDriver(targetVehId, targetDrvId);
      const selectedDriverObj = drivers.find((d) => (d._id || d.id) === targetDrvId);
      const nameStr = selectedDriverObj ? selectedDriverObj.name : "the driver";

      Alert.alert(
        "Assignment Successful",
        `Vehicle has been successfully assigned to ${nameStr}.`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const msg =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Failed to assign driver. Please try again.";
      Alert.alert("Assignment Error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F7FA] justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  const activeVehicle = vehicles.find((v) => (v._id || v.id) === selectedVehicleId) || vehicle;
  const vehicleName = activeVehicle
    ? `${activeVehicle.make || ""} ${activeVehicle.model || activeVehicle.vehicleType}`.trim()
    : "Vehicle";

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      {/* 1. Header Section */}
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
          <Text className="text-2xl font-bold text-[#111827]">Assign Vehicle / Driver</Text>
          <Text className="text-sm text-[#6B7280] mt-0.5">
            Link a vehicle with an active driver
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 32,
        }}
      >
        {/* 2. Target Driver Info (if coming from driver context) */}
        {targetDriver && (
          <View className="px-6 mb-6">
            <SectionHeader title="Selected Driver" />
            <View
              className="bg-white border border-[#2563EB]/30 bg-[#EFF6FF]/40 rounded-[24px] p-5 flex-row items-center justify-between"
              style={{
                shadowColor: "#111827",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.015,
                shadowRadius: 10,
                elevation: 1,
              }}
            >
              <View className="flex-row items-center flex-1 mr-4">
                <View className="w-12 h-12 rounded-full bg-[#2563EB] items-center justify-center mr-4">
                  <Ionicons name="person-outline" size={22} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-[#111827]">{targetDriver.name}</Text>
                  <Text className="text-xs text-[#6B7280] mt-0.5">{targetDriver.email}</Text>
                </View>
              </View>
              <StatusBadge status="Active" />
            </View>
          </View>
        )}

        {/* 3. Vehicle Selection Section */}
        {vehicles.length > 0 ? (
          <View className="px-6 mb-6">
            <SectionHeader title="Select Vehicle" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
              {vehicles.map((v) => {
                const vId = v._id || v.id;
                const isSelected = selectedVehicleId === vId;
                const vTitle = `${v.make || ""} ${v.model || v.vehicleType}`.trim();
                return (
                  <TouchableOpacity
                    key={vId}
                    activeOpacity={0.75}
                    onPress={() => setSelectedVehicleId(vId)}
                    className={`mr-3 p-4 rounded-[20px] border ${
                      isSelected
                        ? "bg-[#2563EB] border-[#2563EB]"
                        : "bg-white border-[#E8EDF3]"
                    }`}
                    style={{ minWidth: 150 }}
                  >
                    <Text className={`text-sm font-bold ${isSelected ? "text-white" : "text-[#111827]"}`}>
                      {vTitle}
                    </Text>
                    <Text className={`text-xs mt-1 ${isSelected ? "text-white/80" : "text-[#6B7280]"}`}>
                      {v.registration}
                    </Text>
                    <Text className={`text-[10px] mt-2 font-semibold ${isSelected ? "text-white/70" : "text-[#94A3B8]"}`}>
                      Fleet: {v.fleetNumber || "N/A"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          activeVehicle && (
            <View className="px-6 mb-6">
              <VehicleSummaryCard
                name={vehicleName}
                registration={activeVehicle.registration}
                fleetNumber={activeVehicle.fleetNumber}
                status={activeVehicle.status || "Active"}
              />
            </View>
          )
        )}

        {/* 4. Driver Selection Section */}
        <View className="px-6">
          <SectionHeader title="Select Driver" />
          <View className="mb-4">
            <DriverSearchBar value={searchQuery} onChangeText={setSearchQuery} />
          </View>

          {filteredDrivers.map((driver) => (
            <DriverSelectionCard
              key={driver.id}
              driver={driver}
              isSelected={selectedDriverId === driver.id}
              onPress={() => setSelectedDriverId(driver.id)}
            />
          ))}

          {filteredDrivers.length === 0 && (
            <View className="bg-white border border-[#E8EDF3] rounded-[24px] p-6 items-center justify-center mt-2">
              <Text className="text-sm font-semibold text-[#6B7280] text-center">
                No drivers found.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 5. Sticky Bottom Actions */}
      <View
        className="bg-white border-t border-[#E8EDF3] px-6 pt-4 flex-col gap-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        {isSubmitting ? (
          <View className="h-14 bg-[#2563EB] rounded-2xl items-center justify-center">
            <ActivityIndicator color="white" />
          </View>
        ) : (
          <PrimaryButton title="Assign Driver to Vehicle" onPress={handleAssign} />
        )}
        <TouchableOpacity
          activeOpacity={0.75}
          disabled={isSubmitting}
          className="h-14 border border-[#111827] rounded-2xl bg-white items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-[#111827] text-base font-semibold">
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
