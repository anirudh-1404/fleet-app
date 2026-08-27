import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
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

export default function AddFuelScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { addFuelLog } = useFleetData();

  const [vehicle, setVehicle] = useState(VEHICLE_OPTIONS[0]);
  const [date, setDate] = useState("Aug 05, 2026");
  const [liters, setLiters] = useState("");
  const [cost, setCost] = useState("");
  const [odometer, setOdometer] = useState("");
  const [efficiency, setEfficiency] = useState("");
  const [vendor, setVendor] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!liters || !cost) {
      Alert.alert("Missing Fields", "Please provide liters and total cost.");
      return;
    }

    const vehicleName = vehicle.split(" (")[0];
    const rego = vehicle.includes("(") ? vehicle.split("(")[1].replace(")", "") : "ABC-123";

    addFuelLog({
      vehicleName,
      registration: rego,
      driverName: "John Smith",
      date: date || "Aug 05, 2026",
      liters: liters.endsWith("L") ? liters : `${liters}L`,
      cost: cost.startsWith("$") ? cost : `$${cost}`,
      odometer: odometer ? (odometer.endsWith("KM") ? odometer : `${odometer} KM`) : "246,000 KM",
      efficiency: efficiency || "32.0 L/100km",
      vendor: vendor || "Shell Express",
      notes
    });

    Alert.alert("Fuel Log Saved", "The new fuel entry has been added successfully.", [
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
            <Text className="text-2xl font-bold text-[#111827]">Add Fuel Log</Text>
            <Text className="text-sm text-[#6B7280] mt-0.5">Record a new fuel transaction</Text>
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
          onPress={handleSave}
          className="h-12 bg-[#2563EB] rounded-[24px] items-center justify-center"
          style={{
            shadowColor: "#2563EB",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text className="text-white text-sm font-semibold">Save Fuel Log</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
