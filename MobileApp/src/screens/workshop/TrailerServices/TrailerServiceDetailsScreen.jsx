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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopServiceService } from "../../../services/workshopServiceService";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

export default function TrailerServiceDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [service, setService] = useState(null);

  const fetchService = async () => {
    try {
      setError(null);
      const res = await workshopServiceService.getServiceById(id);
      setService(res);
    } catch (err) {
      console.error("Error loading trailer service details:", err);
      setError(err.response?.data?.message || "Failed to load trailer service details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchService();
    }, [id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchService();
  };

  const handleDelete = () => {
    Alert.alert("Delete Trailer Service", "Are you sure you want to delete this trailer service record?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await workshopServiceService.deleteService(id);
            Alert.alert("Deleted", "Trailer service record deleted");
            navigation.goBack();
          } catch (err) {
            Alert.alert("Error", err.response?.data?.message || "Could not delete service record");
          }
        },
      },
    ]);
  };

  const vehicle = service?.vehicle;
  const workOrder = service?.workOrder;

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
            Trailer Service Details
          </Text>
        </View>

        <TouchableOpacity onPress={handleDelete} style={{ padding: 6, backgroundColor: "#FEE2E2", borderRadius: 8 }}>
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <WorkshopStateView loading={true} />
      ) : error && !service ? (
        <WorkshopStateView error={error} onRetry={fetchService} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <View>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F172A" }}>
                  {service?.serviceType}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#DC2626", marginTop: 2 }}>
                  {vehicle?.make} {vehicle?.model} ({vehicle?.registration})
                </Text>
              </View>
              <Text style={{ fontSize: 22, fontWeight: "800", color: "#DC2626" }}>
                ${service?.cost || 0}
              </Text>
            </View>

            <View style={{ borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 12, gap: 8 }}>
              <Text style={{ fontSize: 13, color: "#475569" }}>
                Date: <Text style={{ fontWeight: "700", color: "#0F172A" }}>{new Date(service?.date || service?.createdAt).toLocaleDateString()}</Text>
              </Text>
              {service?.workshopVendor ? (
                <Text style={{ fontSize: 13, color: "#475569" }}>
                  Vendor / Workshop: <Text style={{ fontWeight: "600", color: "#0F172A" }}>{service.workshopVendor}</Text>
                </Text>
              ) : null}
              {service?.nextDueDate ? (
                <Text style={{ fontSize: 13, color: "#475569" }}>
                  Next Due Date: <Text style={{ fontWeight: "700", color: "#2563EB" }}>{new Date(service.nextDueDate).toLocaleDateString()}</Text>
                </Text>
              ) : null}
              {workOrder?.jobNumber ? (
                <Text style={{ fontSize: 13, color: "#475569" }}>
                  Work Order: <Text style={{ fontWeight: "700", color: "#2563EB" }}>{workOrder.jobNumber}</Text>
                </Text>
              ) : null}
            </View>

            {service?.notes ? (
              <View style={{ backgroundColor: "#F8FAFC", borderRadius: 8, padding: 12, marginTop: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 2 }}>NOTES</Text>
                <Text style={{ fontSize: 13, color: "#334155" }}>{service.notes}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
