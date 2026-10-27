import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ROUTES from "@constants/routes";
import InfoCard from "@components/common/InfoCard";
import DetailRow from "@components/common/DetailRow";
import { useFleetData } from "../../../context/FleetDataContext";

export default function FuelDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { fuelLogs, deleteFuelLog } = useFleetData();
  const { fuelId } = route.params || {};

  const fuelItem = fuelLogs.find((f) => f.id === fuelId) || fuelLogs[0];

  const handleDelete = () => {
    Alert.alert(
      "Delete Fuel Entry",
      "Are you sure you want to delete this fuel record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteFuelLog(fuelItem.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!fuelItem) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F7FA] justify-center items-center">
        <Text className="text-base text-[#6B7280]">Fuel record not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      {/* Header */}
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
            <Text className="text-xl font-bold text-[#111827]">Fuel Record</Text>
            <Text className="text-xs text-[#6B7280] mt-0.5">{fuelItem.vehicleName}</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate(ROUTES.EDIT_FUEL, { fuelId: fuelItem.id })}
          className="w-10 h-10 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] items-center justify-center mr-2"
        >
          <Ionicons name="create-outline" size={18} color="#059669" />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleDelete}
          className="w-10 h-10 rounded-full bg-[#FEF2F2] border border-[#FEE2E2] items-center justify-center"
        >
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
        }}
      >
        {/* Main Overview Card */}
        <InfoCard title="Transaction Summary" icon="color-fill-outline">
          <DetailRow label="Vehicle" value={fuelItem.vehicleName} />
          <DetailRow label="Registration" value={fuelItem.registration} />
          <DetailRow label="Driver" value={fuelItem.driverName || "N/A"} />
          <DetailRow label="Transaction Date" value={fuelItem.date} />
          <DetailRow label="Vendor / Station" value={fuelItem.vendor || "BP Truckstop"} />
        </InfoCard>

        {/* Consumption & Metrics */}
        <InfoCard title="Fuel Metrics" icon="stats-chart-outline">
          <DetailRow label="Litres Purchased" value={fuelItem.liters} valueColor="text-[#059669]" />
          <DetailRow label="Total Cost" value={fuelItem.cost} valueColor="text-[#16A34A]" />
          <DetailRow label="Odometer Reading" value={fuelItem.odometer} />
          <DetailRow label="Fuel Efficiency" value={fuelItem.efficiency || "32.4 L/100km"} />
        </InfoCard>

        {/* Notes */}
        <InfoCard title="Notes & Remarks" icon="document-text-outline">
          <Text className="text-xs text-[#4B5563] leading-5">
            {fuelItem.notes || "No additional notes provided for this fuel entry."}
          </Text>
        </InfoCard>
      </ScrollView>
    </SafeAreaView>
  );
}
