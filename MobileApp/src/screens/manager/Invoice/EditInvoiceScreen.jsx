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
import { useNavigation, useRoute } from "@react-navigation/native";
import CustomInput from "@components/inputs/CustomInput";
import CustomDropdown from "@components/inputs/CustomDropdown";
import FormSection from "@components/common/FormSection";
import { useFleetData } from "../../../context/FleetDataContext";

const CATEGORY_OPTIONS = ["Service", "Parts", "Insurance", "Other"];
const STATUS_OPTIONS = ["Paid", "Pending"];
const VEHICLE_OPTIONS = [
  "Volvo FH16 (ABC-123)",
  "Scania R500 (XYZ-789)",
  "Toyota Hiace (VAN-456)",
  "Ford Ranger (UTE-101)",
  "Mercedes Actros (MQA-707)"
];

export default function EditInvoiceScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { invoices, updateInvoice } = useFleetData();
  const { invoiceId } = route.params || {};

  const invoice = invoices.find((i) => i.id === invoiceId) || invoices[0];

  const initialVehicle = `${invoice.vehicleName} (${invoice.registration})`;

  const [vehicle, setVehicle] = useState(initialVehicle);
  const [category, setCategory] = useState(invoice.category || "Service");
  const [amount, setAmount] = useState(invoice.amount ? invoice.amount.replace("$", "") : "");
  const [date, setDate] = useState(invoice.date || "");
  const [status, setStatus] = useState(invoice.status || "Pending");
  const [description, setDescription] = useState(invoice.description || "");

  const handleUpdate = () => {
    const vehicleName = vehicle.split(" (")[0];
    const rego = vehicle.includes("(") ? vehicle.split("(")[1].replace(")", "") : invoice.registration;

    updateInvoice(invoice.id, {
      vehicleName,
      registration: rego,
      category,
      amount: amount.startsWith("$") ? amount : `$${amount}`,
      date,
      status,
      description
    });

    Alert.alert("Invoice Updated", "The invoice has been updated successfully.", [
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
            <Text className="text-2xl font-bold text-[#111827]">Edit Invoice</Text>
            <Text className="text-sm text-[#6B7280] mt-0.5">{invoice.invoiceNumber}</Text>
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
        <FormSection title="Vehicle & Category">
          <CustomDropdown
            label="Linked Vehicle"
            options={VEHICLE_OPTIONS}
            selectedValue={vehicle}
            onSelect={setVehicle}
          />
          <CustomDropdown
            label="Invoice Category"
            options={CATEGORY_OPTIONS}
            selectedValue={category}
            onSelect={setCategory}
          />
        </FormSection>

        <FormSection title="Billing Details">
          <CustomInput
            label="Amount ($)"
            placeholder="e.g. 1250.00"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <CustomInput
            label="Date Issued"
            placeholder="e.g. Aug 05, 2026"
            value={date}
            onChangeText={setDate}
          />
          <CustomDropdown
            label="Payment Status"
            options={STATUS_OPTIONS}
            selectedValue={status}
            onSelect={setStatus}
          />
        </FormSection>

        <FormSection title="Description">
          <CustomInput
            label="Line Items & Description"
            placeholder="Detailed invoice description..."
            value={description}
            onChangeText={setDescription}
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
          className="h-12 bg-[#059669] rounded-[24px] items-center justify-center"
          style={{
            shadowColor: "#059669",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text className="text-white text-sm font-semibold">Update Invoice</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
