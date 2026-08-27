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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopInvoiceService } from "../../../services/workshopInvoiceService";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

export default function WorkshopInvoiceDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [invoice, setInvoice] = useState(null);

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
    <SafeAreaView style={{  flex: 1, backgroundColor: "#F8FAFC"  }} edges={["top"]}>
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

        <TouchableOpacity onPress={handleDelete} style={{ padding: 6, backgroundColor: "#FEE2E2", borderRadius: 8 }}>
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <WorkshopStateView loading={true} />
      ) : error && !invoice ? (
        <WorkshopStateView error={error} onRetry={fetchInvoice} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
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
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
