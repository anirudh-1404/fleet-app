import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopInvoiceService } from "../../../services/workshopInvoiceService";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";
import { downloadAndSaveInvoicePdf, printInvoicePdf } from "../../../utils/invoicePdfHelper";

export default function WorkshopInvoiceDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const fetchInvoice = async () => {
    try {
      setError(null);
      const res = await workshopInvoiceService.getInvoiceById(id);
      setInvoice(res);
    } catch (err) {
      console.error("Error loading invoice details:", err);
      setError(err.response?.data?.message || "Failed to load invoice");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInvoice();
    }, [id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchInvoice();
  };

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    setDownloadingPdf(true);
    try {
      await downloadAndSaveInvoicePdf(invoice);
    } catch (err) {
      console.error("PDF download error:", err);
      Alert.alert("PDF Error", "Could not generate or save PDF. Please check device permissions.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = async () => {
    if (!invoice) return;
    try {
      await printInvoicePdf(invoice);
    } catch (err) {
      console.error("Print error:", err);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Invoice", "Are you sure you want to delete this invoice record?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await workshopInvoiceService.deleteInvoice(id);
            Alert.alert("Deleted", "Invoice deleted successfully");
            navigation.goBack();
          } catch (err) {
            Alert.alert("Error", err.response?.data?.message || "Could not delete invoice");
          }
        },
      },
    ]);
  };

  const vehicle = invoice?.vehicle;
  const customer = invoice?.customer;
  const workOrder = invoice?.workOrder;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderColor: "#E2E8F0",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>
            Invoice Details
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={downloadingPdf}
            onPress={handleDownloadPdf}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: "#EFF6FF",
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#BFDBFE",
            }}
          >
            {downloadingPdf ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <>
                <Ionicons name="cloud-download-outline" size={16} color="#2563EB" style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#2563EB" }}>PDF</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDelete} style={{ padding: 6, backgroundColor: "#FEE2E2", borderRadius: 8 }}>
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <WorkshopStateView loading={true} />
      ) : error && !invoice ? (
        <WorkshopStateView error={error} onRetry={fetchInvoice} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Main Invoice Card */}
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <View>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F172A" }}>
                  {invoice?.invoiceNumber}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#2563EB", marginTop: 2 }}>
                  Category: {invoice?.category}
                </Text>
              </View>

              <Text style={{ fontSize: 24, fontWeight: "800", color: "#16A34A" }}>
                ${invoice?.amount?.toLocaleString() || 0}
              </Text>
            </View>

            <View style={{ borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 12, gap: 8 }}>
              <Text style={{ fontSize: 13, color: "#475569" }}>
                Vendor / Supplier: <Text style={{ fontWeight: "700", color: "#0F172A" }}>{invoice?.vendor || "N/A"}</Text>
              </Text>
              <Text style={{ fontSize: 13, color: "#475569" }}>
                Date: <Text style={{ fontWeight: "600", color: "#0F172A" }}>{new Date(invoice?.date || invoice?.createdAt).toLocaleDateString()}</Text>
              </Text>
              {workOrder?.jobNumber ? (
                <Text style={{ fontSize: 13, color: "#475569" }}>
                  Linked Work Order: <Text style={{ fontWeight: "700", color: "#2563EB" }}>{workOrder.jobNumber}</Text>
                </Text>
              ) : null}
              {vehicle?.registration ? (
                <Text style={{ fontSize: 13, color: "#475569" }}>
                  Vehicle: <Text style={{ fontWeight: "600", color: "#0F172A" }}>{vehicle.make} {vehicle.model} ({vehicle.registration})</Text>
                </Text>
              ) : null}
            </View>

            {invoice?.file ? (
              <View style={{ marginTop: 14 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 6 }}>RECEIPT / DOCUMENT</Text>
                <Image source={{ uri: invoice.file }} style={{ width: "100%", height: 200, borderRadius: 8 }} resizeMode="contain" />
              </View>
            ) : null}

            {invoice?.notes ? (
              <View style={{ backgroundColor: "#F8FAFC", borderRadius: 8, padding: 12, marginTop: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 2 }}>NOTES</Text>
                <Text style={{ fontSize: 13, color: "#334155" }}>{invoice.notes}</Text>
              </View>
            ) : null}
          </View>

          {/* Download & Save PDF Action Card */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              padding: 16,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: "#EFF6FF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10,
                }}
              >
                <Ionicons name="document-text-outline" size={18} color="#2563EB" />
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>Tax Invoice PDF</Text>
                <Text style={{ fontSize: 11, color: "#64748B" }}>Download directly or save to phone storage</Text>
              </View>
            </View>

            <Text style={{ fontSize: 12, color: "#64748B", lineHeight: 18, marginBottom: 14 }}>
              Generate an official NHVR-compliant Tax Invoice PDF. Tap below to download and save directly to your phone's Files or Downloads folder, or share via WhatsApp.
            </Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={downloadingPdf}
                onPress={handleDownloadPdf}
                style={{
                  flex: 1,
                  backgroundColor: "#2563EB",
                  borderRadius: 10,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#2563EB",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 3,
                }}
              >
                {downloadingPdf ? (
                  <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} />
                ) : (
                  <Ionicons name="cloud-download-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                )}
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>
                  {downloadingPdf ? "Generating PDF..." : "Download & Save PDF"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handlePrint}
                style={{
                  backgroundColor: "#F1F5F9",
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="print-outline" size={18} color="#334155" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
