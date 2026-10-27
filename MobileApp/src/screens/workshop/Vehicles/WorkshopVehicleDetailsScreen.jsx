import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopVehicleService } from "../../../services/workshopVehicleService";
import WorkshopStatusBadge from "../../../components/workshop/WorkshopStatusBadge";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

export default function WorkshopVehicleDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("workOrders"); // "workOrders" | "inspections" | "services" | "invoices"

  const fetchVehicleDetails = async () => {
    try {
      setError(null);
      const res = await workshopVehicleService.getVehicleById(id);
      setData(res);
    } catch (err) {
      console.error("Error loading vehicle details:", err);
      setError(err.response?.data?.message || "Failed to load vehicle details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchVehicleDetails();
    }, [id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchVehicleDetails();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Vehicle",
      "Are you sure you want to delete this vehicle record? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await workshopVehicleService.deleteVehicle(id);
              Alert.alert("Deleted", "Vehicle removed successfully");
              navigation.goBack();
            } catch (err) {
              Alert.alert("Error", err.response?.data?.message || "Could not delete vehicle");
            }
          },
        },
      ]
    );
  };

  const vehicle = data?.vehicle;
  const workOrders = data?.workOrders || [];
  const inspections = data?.inspections || [];
  const services = data?.services || [];
  const invoices = data?.invoices || [];

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
            Vehicle Details
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.EDIT_WORKSHOP_VEHICLE, { vehicle })}
            style={{ padding: 6, backgroundColor: "#F1F5F9", borderRadius: 8 }}
          >
            <Ionicons name="pencil-outline" size={18} color="#0F172A" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            style={{ padding: 6, backgroundColor: "#FEE2E2", borderRadius: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <WorkshopStateView loading={true} />
      ) : error && !data ? (
        <WorkshopStateView error={error} onRetry={fetchVehicleDetails} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Hero Card with Photo / Specs */}
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
            {vehicle?.photo ? (
              <Image
                source={{ uri: vehicle.photo }}
                style={{ width: "100%", height: 160, borderRadius: 10, marginBottom: 14 }}
                resizeMode="cover"
              />
            ) : null}

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ fontSize: 22, fontWeight: "800", color: "#0F172A" }}>
                  {vehicle?.make} {vehicle?.model}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#059669", marginTop: 2 }}>
                  {vehicle?.registration} • {vehicle?.year} • {vehicle?.vehicleType}
                </Text>
              </View>
              <WorkshopStatusBadge status={vehicle?.status} />
            </View>

            {/* Customer info link */}
            <TouchableOpacity
              onPress={() => {
                if (vehicle?.customer?._id) {
                  navigation.navigate(ROUTES.WORKSHOP_CUSTOMER_DETAILS, { id: vehicle.customer._id });
                }
              }}
              style={{
                backgroundColor: "#F8FAFC",
                borderRadius: 8,
                padding: 10,
                marginTop: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B" }}>OWNER / CUSTOMER</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A", marginTop: 2 }}>
                  {vehicle?.customer?.fullName || "Unassigned"}
                </Text>
                <Text style={{ fontSize: 12, color: "#64748B" }}>{vehicle?.customer?.phone}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Quick Specs */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 12, marginTop: 12 }}>
              <View>
                <Text style={{ fontSize: 11, color: "#64748B" }}>Odometer</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>
                  {vehicle?.odometer?.toLocaleString() || 0} km
                </Text>
              </View>

              <View>
                <Text style={{ fontSize: 11, color: "#64748B" }}>VIN</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#0F172A" }}>
                  {vehicle?.vin || "N/A"}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions Row */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.CREATE_WORKSHOP_WORKORDER, { prefilledVehicleId: vehicle?._id, prefilledCustomerId: vehicle?.customer?._id })}
              style={{ flex: 1, backgroundColor: "#059669", paddingVertical: 10, borderRadius: 8, alignItems: "center" }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>+ Work Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.CREATE_WORKSHOP_INSPECTION, { prefilledVehicleId: vehicle?._id, prefilledCustomerId: vehicle?.customer?._id, vehicleType: vehicle?.vehicleType })}
              style={{ flex: 1, backgroundColor: "#7C3AED", paddingVertical: 10, borderRadius: 8, alignItems: "center" }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>+ Inspect</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (vehicle?.vehicleType === "Trailer") {
                  navigation.navigate(ROUTES.ADD_WORKSHOP_TRAILER_SERVICE, { prefilledVehicleId: vehicle?._id, prefilledCustomerId: vehicle?.customer?._id });
                } else {
                  navigation.navigate(ROUTES.ADD_WORKSHOP_TRUCK_SERVICE, { prefilledVehicleId: vehicle?._id, prefilledCustomerId: vehicle?.customer?._id });
                }
              }}
              style={{ flex: 1, backgroundColor: "#15803D", paddingVertical: 10, borderRadius: 8, alignItems: "center" }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>+ Service</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {[
                { key: "workOrders", label: `Work Orders (${workOrders.length})` },
                { key: "inspections", label: `Inspections (${inspections.length})` },
                { key: "services", label: `Services (${services.length})` },
                { key: "invoices", label: `Invoices (${invoices.length})` },
              ].map((t) => {
                const isSelected = activeTab === t.key;
                return (
                  <TouchableOpacity
                    key={t.key}
                    onPress={() => setActiveTab(t.key)}
                    style={{
                      backgroundColor: isSelected ? "#0F172A" : "#FFFFFF",
                      borderWidth: 1,
                      borderColor: isSelected ? "#0F172A" : "#E2E8F0",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 18,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#64748B" }}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Tab 1: Work Orders */}
          {activeTab === "workOrders" && (
            <View style={{ gap: 10 }}>
              {workOrders.length === 0 ? (
                <View style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" }}>
                  <Text style={{ fontSize: 13, color: "#64748B" }}>No work orders recorded for this vehicle.</Text>
                </View>
              ) : (
                workOrders.map((wo) => (
                  <TouchableOpacity
                    key={wo._id}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate(ROUTES.WORKSHOP_WORKORDER_DETAILS, { id: wo._id })}
                    style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#E2E8F0" }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <View>
                        <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A" }}>{wo.jobType} ({wo.jobNumber})</Text>
                        <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{wo.description || "No description"}</Text>
                      </View>
                      <WorkshopStatusBadge status={wo.status} size="small" />
                    </View>
                    <Text style={{ fontSize: 11, color: "#94A3B8" }}>
                      {new Date(wo.dateReceived || wo.createdAt).toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* Tab 2: Inspections */}
          {activeTab === "inspections" && (
            <View style={{ gap: 10 }}>
              {inspections.length === 0 ? (
                <View style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" }}>
                  <Text style={{ fontSize: 13, color: "#64748B" }}>No inspections recorded for this vehicle.</Text>
                </View>
              ) : (
                inspections.map((insp) => (
                  <TouchableOpacity
                    key={insp._id}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate(ROUTES.WORKSHOP_INSPECTION_DETAILS, { id: insp._id })}
                    style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#E2E8F0" }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <View>
                        <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A" }}>{insp.inspectionType} Inspection</Text>
                        <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Inspector: {insp.inspectorName}</Text>
                      </View>
                      <WorkshopStatusBadge status={insp.status} size="small" />
                    </View>
                    <Text style={{ fontSize: 11, color: "#94A3B8" }}>
                      {new Date(insp.date || insp.createdAt).toLocaleDateString()} • {insp.checklistItems?.length || 0} checklist items
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* Tab 3: Services */}
          {activeTab === "services" && (
            <View style={{ gap: 10 }}>
              {services.length === 0 ? (
                <View style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" }}>
                  <Text style={{ fontSize: 13, color: "#64748B" }}>No service records recorded for this vehicle.</Text>
                </View>
              ) : (
                services.map((srv) => (
                  <TouchableOpacity
                    key={srv._id}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (srv.vehicleCategory === "Trailer") {
                        navigation.navigate(ROUTES.WORKSHOP_TRAILER_SERVICE_DETAILS, { id: srv._id });
                      } else {
                        navigation.navigate(ROUTES.WORKSHOP_TRUCK_SERVICE_DETAILS, { id: srv._id });
                      }
                    }}
                    style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#E2E8F0" }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <View>
                        <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A" }}>{srv.serviceType}</Text>
                        <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Odometer: {srv.odometer?.toLocaleString() || 0} km</Text>
                      </View>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: "#16A34A" }}>
                        ${srv.cost || 0}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: "#94A3B8" }}>
                      {new Date(srv.date || srv.createdAt).toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* Tab 4: Invoices */}
          {activeTab === "invoices" && (
            <View style={{ gap: 10 }}>
              {invoices.length === 0 ? (
                <View style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" }}>
                  <Text style={{ fontSize: 13, color: "#64748B" }}>No invoice/expense records for this vehicle.</Text>
                </View>
              ) : (
                invoices.map((inv) => (
                  <TouchableOpacity
                    key={inv._id}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate(ROUTES.WORKSHOP_INVOICE_DETAILS, { id: inv._id })}
                    style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#E2E8F0" }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <View>
                        <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A" }}>{inv.invoiceNumber}</Text>
                        <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Category: {inv.category} • Vendor: {inv.vendor || "N/A"}</Text>
                      </View>
                      <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
                        ${inv.amount || 0}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: "#94A3B8" }}>
                      {new Date(inv.date || inv.createdAt).toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
