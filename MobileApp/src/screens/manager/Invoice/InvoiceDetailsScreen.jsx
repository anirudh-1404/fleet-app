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
import { downloadAndSaveInvoicePdf, printInvoicePdf } from "../../../utils/invoicePdfHelper";

export default function InvoiceDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { invoices, deleteInvoice } = useFleetData();
  const { invoiceId } = route.params || {};

  const invoice = invoices.find((i) => i.id === invoiceId) || invoices[0];
  const [downloadingPdf, setDownloadingPdf] = React.useState(false);

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    setDownloadingPdf(true);
    try {
      await downloadAndSaveInvoicePdf(invoice);
    } catch (err) {
      console.error("PDF download error:", err);
      Alert.alert("PDF Error", "Could not generate or save PDF to device.");
    } finally {
      setDownloadingPdf(false);
    }
  };

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
          disabled={downloadingPdf}
          onPress={handleDownloadPdf}
          className="w-10 h-10 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] items-center justify-center mr-2"
        >
          <Ionicons name="cloud-download-outline" size={18} color="#059669" />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate(ROUTES.EDIT_INVOICE, { invoiceId: invoice.id })}
          className="w-10 h-10 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] items-center justify-center mr-2"
        >
          <Ionicons name="create-outline" size={18} color="#475569" />
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
          paddingBottom: Platform.OS === "ios" ? 60 : 40,
        }}
      >
        {/* PDF Download Card */}
        <View className="bg-white rounded-2xl p-4 border border-[#E2E8F0] mb-4">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-lg bg-[#ECFDF5] items-center justify-center mr-2.5">
              <Ionicons name="document-text-outline" size={18} color="#059669" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-[#0F172A]">Tax Invoice PDF</Text>
              <Text className="text-xs text-[#64748B]">Save directly to your phone or share</Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={downloadingPdf}
            onPress={handleDownloadPdf}
            className="bg-[#059669] rounded-xl py-3 flex-row items-center justify-center"
          >
            <Ionicons name="cloud-download-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text className="text-sm font-bold text-white">
              {downloadingPdf ? "Generating PDF..." : "Download & Save PDF"}
            </Text>
          </TouchableOpacity>
        </View>

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
          <DetailRow label="Total Amount Due" value={invoice.amount} valueColor="text-[#059669]" />
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
