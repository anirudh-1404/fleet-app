import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, Alert } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import CustomInput from "@components/inputs/CustomInput";
import CustomDropdown from "@components/inputs/CustomDropdown";
import FormSection from "@components/common/FormSection";
import { useFleetData } from "../../../context/FleetDataContext";

const VEHICLE_OPTIONS = [
  "Volvo FH16 (ABC-123)",
  "Scania R500 (XYZ-789)",
  "Toyota Hiace (VAN-456)",
  "Ford Ranger (UTE-101)",
  "Mercedes Actros (MQA-707)"
];

export default function EditFuelScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { fuelLogs, updateFuelLog } = useFleetData();
  const { fuelId } = route.params || {};

  const fuelItem = fuelLogs.find((f) => f.id === fuelId) || fuelLogs[0];

  const initialVehicle = `${fuelItem.vehicleName} (${fuelItem.registration})`;

  const [vehicle, setVehicle] = useState(initialVehicle);
  const [date, setDate] = useState(fuelItem.date || "");
  const [liters, setLiters] = useState(fuelItem.liters ? fuelItem.liters.replace("L", "") : "");
  const [cost, setCost] = useState(fuelItem.cost ? fuelItem.cost.replace("$", "") : "");
  const [odometer, setOdometer] = useState(fuelItem.odometer ? fuelItem.odometer.replace(" KM", "") : "");
  const [efficiency, setEfficiency] = useState(fuelItem.efficiency || "");
  const [vendor, setVendor] = useState(fuelItem.vendor || "");
  const [notes, setNotes] = useState(fuelItem.notes || "");

  const handleUpdate = () => {
    const vehicleName = vehicle.split(" (")[0];
    const rego = vehicle.includes("(") ? vehicle.split("(")[1].replace(")", "") : fuelItem.registration;

    updateFuelLog(fuelItem.id, {
      vehicleName,
      registration: rego,
      date,
      liters: liters.endsWith("L") ? liters : `${liters}L`,
      cost: cost.startsWith("$") ? cost : `$${cost}`,
      odometer: odometer.endsWith("KM") ? odometer : `${odometer} KM`,
      efficiency: efficiency || "32.0 L/100km",
      vendor: vendor || "BP Truckstop Sydney",
      notes
    });

    Alert.alert("Fuel Log Updated", "The fuel entry has been updated successfully.", [
      { text: "OK", onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      <View className="px-6 pt-4 flex-row items-center justify-between mb-5">
        <View className="flex-row items-center flex-1 mr-2">
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
            <Text className="text-2xl font-bold text-[#111827]">Edit Fuel Log</Text>
            <Text className="text-sm text-[#6B7280] mt-0.5">Modify fuel transaction details</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
        }}
      >
        <FormSection title="Vehicle & Date Info">
          <CustomDropdown
            label="Select Vehicle"
            options={VEHICLE_OPTIONS}
            selectedValue={vehicle}
            onSelect={setVehicle}
          />
          <CustomInput
            label="Transaction Date"
            placeholder="e.g. Aug 05, 2026"
            value={date}
            onChangeText={setDate}
          />
          <CustomInput
            label="Vendor / Station"
            placeholder="e.g. BP Truckstop Sydney"
            value={vendor}
            onChangeText={setVendor}
          />
        </FormSection>

        <FormSection title="Fuel & Cost Details">
          <CustomInput
            label="Litres Purchased"
            placeholder="e.g. 420"
            keyboardType="numeric"
            value={liters}
            onChangeText={setLiters}
          />
          <CustomInput
            label="Total Cost ($)"
            placeholder="e.g. 798.00"
            keyboardType="numeric"
            value={cost}
            onChangeText={setCost}
          />
          <CustomInput
            label="Odometer Reading (KM)"
            placeholder="e.g. 245900"
            keyboardType="numeric"
            value={odometer}
            onChangeText={setOdometer}
          />
          <CustomInput
            label="Fuel Efficiency (L/100km)"
            placeholder="e.g. 31.5 L/100km"
            value={efficiency}
            onChangeText={setEfficiency}
          />
        </FormSection>

        <FormSection title="Additional Notes">
          <CustomInput
            label="Notes"
            placeholder="Optional comments or receipt reference"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </FormSection>
      </ScrollView>

      <View
        className="bg-white border-t border-[#E8EDF3] px-6 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleUpdate}
          className="h-12 bg-[#2563EB] rounded-[24px] items-center justify-center"
          style={{
            shadowColor: "#2563EB",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text className="text-white text-sm font-semibold">Update Fuel Log</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
