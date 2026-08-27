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
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopInspectionService } from "../../../services/workshopInspectionService";
import WorkshopStatusBadge from "../../../components/workshop/WorkshopStatusBadge";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

export default function InspectionDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [inspection, setInspection] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchInspection = async () => {
    try {
      setError(null);
      const res = await workshopInspectionService.getInspectionById(id);
      setInspection(res);
    } catch (err) {
      console.error("Error loading inspection:", err);
      setError(err.response?.data?.message || "Failed to load inspection");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInspection();
    }, [id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchInspection();
  };

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await workshopInspectionService.updateInspection(id, { status: newStatus });
      await fetchInspection();
      Alert.alert("Status Updated", `Inspection marked as ${newStatus}.`);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to update inspection status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Inspection", "Are you sure you want to delete this inspection?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await workshopInspectionService.deleteInspection(id);
            Alert.alert("Deleted", "Inspection deleted successfully");
            navigation.goBack();
          } catch (err) {
            Alert.alert("Error", err.response?.data?.message || "Could not delete inspection");
          }
        },
      },
    ]);
  };

  const vehicle = inspection?.vehicle;
  const customer = inspection?.customer;
  const workOrder = inspection?.workOrder;
  const checklistItems = inspection?.checklistItems || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC", paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0 }} edges={["top"]}>
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
            Inspection Details
          </Text>
        </View>

        <TouchableOpacity onPress={handleDelete} style={{ padding: 6, backgroundColor: "#FEE2E2", borderRadius: 8 }}>
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <WorkshopStateView loading={true} />
      ) : error && !inspection ? (
        <WorkshopStateView error={error} onRetry={fetchInspection} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Main Inspection Card */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <View>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F172A" }}>
                  {inspection?.inspectionType} Inspection
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#2563EB", marginTop: 2 }}>
                  {vehicle?.make} {vehicle?.model} ({vehicle?.registration})
                </Text>
              </View>
              <WorkshopStatusBadge status={inspection?.status} />
            </View>

            <View style={{ borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 12, marginTop: 8, gap: 6 }}>
              <Text style={{ fontSize: 13, color: "#475569" }}>
                Inspector: <Text style={{ fontWeight: "700", color: "#0F172A" }}>{inspection?.inspectorName}</Text>
              </Text>
              <Text style={{ fontSize: 13, color: "#475569" }}>
                Date: <Text style={{ fontWeight: "600", color: "#0F172A" }}>{new Date(inspection?.date || inspection?.createdAt).toLocaleDateString()}</Text>
              </Text>
              {workOrder?.jobNumber ? (
                <Text style={{ fontSize: 13, color: "#475569" }}>
                  Work Order: <Text style={{ fontWeight: "700", color: "#2563EB" }}>{workOrder.jobNumber} ({workOrder.jobType})</Text>
                </Text>
              ) : null}
              {customer?.fullName ? (
                <Text style={{ fontSize: 13, color: "#475569" }}>
                  Customer: <Text style={{ fontWeight: "600", color: "#0F172A" }}>{customer.fullName}</Text>
                </Text>
              ) : null}
            </View>

            {/* Quick Status Buttons */}
            <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
              <TouchableOpacity
                onPress={() => handleUpdateStatus("PASSED")}
                disabled={updating}
                style={{ flex: 1, backgroundColor: "#15803D", paddingVertical: 8, borderRadius: 8, alignItems: "center" }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>Mark PASSED</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleUpdateStatus("FAILED")}
                disabled={updating}
                style={{ flex: 1, backgroundColor: "#DC2626", paddingVertical: 8, borderRadius: 8, alignItems: "center" }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>Mark FAILED</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Checklist Items */}
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A", marginBottom: 12 }}>
            Inspection Checklist ({checklistItems.length} items)
          </Text>

          {checklistItems.length === 0 ? (
            <View style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>No checklist items recorded.</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {checklistItems.map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A", flex: 1, marginRight: 8 }}>
                      {item.item}
                    </Text>
                    <WorkshopStatusBadge status={item.status} size="small" />
                  </View>
                  {item.note ? (
                    <Text style={{ fontSize: 12, color: "#64748B", marginTop: 6, fontStyle: "italic" }}>
                      Note: {item.note}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          )}

          {inspection?.notes ? (
            <View style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, marginTop: 14, borderWidth: 1, borderColor: "#E2E8F0" }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 4 }}>OVERALL NOTES</Text>
              <Text style={{ fontSize: 13, color: "#334155" }}>{inspection.notes}</Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
