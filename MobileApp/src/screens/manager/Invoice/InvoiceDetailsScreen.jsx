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
import StatusBadge from "@components/fleet/StatusBadge";
import { useFleetData } from "../../../context/FleetDataContext";

export default function InvoiceDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { invoices, deleteInvoice } = useFleetData();
  const { invoiceId } = route.params || {};

  const invoice = invoices.find((i) => i.id === invoiceId) || invoices[0];

  const handleDelete = () => {
    Alert.alert("Delete Invoice", "Are you sure you want to delete this invoice?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteInvoice(invoice.id);
          navigation.goBack();
        },
      },
    ]);
  };

  if (!invoice) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F7FA] justify-center items-center">
        <Text className="text-base text-[#6B7280]">Invoice not found.</Text>
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
            <Text className="text-xl font-bold text-[#111827]">{invoice.invoiceNumber}</Text>
            <Text className="text-xs text-[#6B7280] mt-0.5">{invoice.category || "Service"} Invoice</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate(ROUTES.EDIT_INVOICE, { invoiceId: invoice.id })}
          className="w-10 h-10 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] items-center justify-center mr-2"
        >
          <Ionicons name="create-outline" size={18} color="#2563EB" />
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
        <InfoCard title="Invoice Information" icon="receipt-outline">
          <DetailRow label="Invoice Number" value={invoice.invoiceNumber} />
          <DetailRow label="Vehicle" value={invoice.vehicleName} />
          <DetailRow label="Registration" value={invoice.registration} />
          <DetailRow label="Category" value={invoice.category || "Service"} />
          <DetailRow label="Date Issued" value={invoice.date} />
          <DetailRow label="Payment Status" badge={<StatusBadge status={invoice.status} />} />
        </InfoCard>

        <InfoCard title="Financial Summary" icon="cash-outline">
          <DetailRow label="Subtotal" value={invoice.subtotal || "$1,681.82"} />
          <DetailRow label="GST / Tax (10%)" value={invoice.tax || "$168.18"} />
          <DetailRow label="Total Amount Due" value={invoice.amount} valueColor="text-[#2563EB]" />
        </InfoCard>

        <InfoCard title="Itemized Description" icon="document-text-outline">
          <Text className="text-xs text-[#4B5563] leading-5">
            {invoice.description || "No specific line item description available."}
          </Text>
        </InfoCard>
      </ScrollView>
    </SafeAreaView>
  );
}
