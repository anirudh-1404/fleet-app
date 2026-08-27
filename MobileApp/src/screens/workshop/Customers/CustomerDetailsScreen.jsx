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
import { workshopCustomerService } from "../../../services/workshopCustomerService";
import WorkshopStatusBadge from "../../../components/workshop/WorkshopStatusBadge";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

export default function CustomerDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("vehicles"); // "vehicles" | "workOrders"

  const fetchCustomerDetails = async () => {
    try {
      setError(null);
      const res = await workshopCustomerService.getCustomerById(id);
      setData(res);
    } catch (err) {
      console.error("Error loading customer details:", err);
      setError(err.response?.data?.message || "Failed to load customer profile");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCustomerDetails();
    }, [id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomerDetails();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Customer",
      "Are you sure you want to delete this customer record? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await workshopCustomerService.deleteCustomer(id);
              Alert.alert("Deleted", "Customer removed successfully");
              navigation.goBack();
            } catch (err) {
              Alert.alert("Error", err.response?.data?.message || "Could not delete customer");
            }
          },
        },
      ]
    );
  };

  const customer = data?.customer;
  const vehicles = data?.vehicles || [];
  const workOrders = data?.workOrders || [];

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
            Customer Profile
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.EDIT_WORKSHOP_CUSTOMER, { customer })}
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
        <WorkshopStateView error={error} onRetry={fetchCustomerDetails} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Customer Hero Card */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              padding: 18,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F172A" }}>
              {customer?.fullName}
            </Text>
            {customer?.companyName ? (
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#2563EB", marginTop: 2 }}>
                {customer?.companyName}
              </Text>
            ) : null}

            <View style={{ borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 14, marginTop: 14, gap: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="call-outline" size={16} color="#64748B" />
                <Text style={{ fontSize: 14, color: "#334155", marginLeft: 10, fontWeight: "500" }}>
                  {customer?.phone || "No phone provided"}
                </Text>
              </View>

              {customer?.email ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="mail-outline" size={16} color="#64748B" />
                  <Text style={{ fontSize: 14, color: "#334155", marginLeft: 10 }}>
                    {customer?.email}
                  </Text>
                </View>
              ) : null}

              {customer?.address ? (
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <Ionicons name="location-outline" size={16} color="#64748B" style={{ marginTop: 2 }} />
                  <Text style={{ fontSize: 14, color: "#334155", marginLeft: 10, flex: 1 }}>
                    {customer?.address}
                  </Text>
                </View>
              ) : null}

              {customer?.notes ? (
                <View style={{ backgroundColor: "#F8FAFC", padding: 10, borderRadius: 8, marginTop: 4 }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 2 }}>NOTES</Text>
                  <Text style={{ fontSize: 13, color: "#334155" }}>{customer?.notes}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Tab Filter (Vehicles vs Work Orders) */}
          <View style={{ flexDirection: "row", backgroundColor: "#E2E8F0", borderRadius: 10, padding: 3, marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => setActiveTab("vehicles")}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: activeTab === "vehicles" ? "#FFFFFF" : "transparent",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: activeTab === "vehicles" ? "#0F172A" : "#64748B" }}>
                Vehicles ({vehicles.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("workOrders")}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: activeTab === "workOrders" ? "#FFFFFF" : "transparent",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: activeTab === "workOrders" ? "#0F172A" : "#64748B" }}>
                Work Orders ({workOrders.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab 1: Vehicles */}
          {activeTab === "vehicles" && (
            <View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
                  Customer Vehicles
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate(ROUTES.ADD_WORKSHOP_VEHICLE, { prefilledCustomerId: customer?._id })}
                  style={{ backgroundColor: "#2563EB", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <Ionicons name="add" size={14} color="#FFFFFF" />
                  <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>Add Vehicle</Text>
                </TouchableOpacity>
              </View>

              {vehicles.length === 0 ? (
                <View style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" }}>
                  <Ionicons name="car-outline" size={28} color="#94A3B8" />
                  <Text style={{ fontSize: 13, color: "#64748B", marginTop: 6 }}>No vehicles registered for this customer yet.</Text>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  {vehicles.map((v) => (
                    <TouchableOpacity
                      key={v._id}
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate(ROUTES.WORKSHOP_VEHICLE_DETAILS, { id: v._id })}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 12,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: "#E2E8F0",
                      }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <View>
                          <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
                            {v.make} {v.model} ({v.year})
                          </Text>
                          <Text style={{ fontSize: 13, fontWeight: "700", color: "#2563EB", marginTop: 2 }}>
                            {v.registration} • {v.vehicleType}
                          </Text>
                        </View>
                        <WorkshopStatusBadge status={v.status} size="small" />
                      </View>
                      <Text style={{ fontSize: 12, color: "#64748B" }}>
                        Odometer: {v.odometer?.toLocaleString() || 0} km
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Tab 2: Work Orders */}
          {activeTab === "workOrders" && (
            <View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
                  Service & Work Order History
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate(ROUTES.CREATE_WORKSHOP_WORKORDER, { prefilledCustomerId: customer?._id })}
                  style={{ backgroundColor: "#2563EB", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <Ionicons name="add" size={14} color="#FFFFFF" />
                  <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>New Job</Text>
                </TouchableOpacity>
              </View>

              {workOrders.length === 0 ? (
                <View style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" }}>
                  <Ionicons name="clipboard-outline" size={28} color="#94A3B8" />
                  <Text style={{ fontSize: 13, color: "#64748B", marginTop: 6 }}>No work orders created for this customer yet.</Text>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  {workOrders.map((wo) => (
                    <TouchableOpacity
                      key={wo._id}
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate(ROUTES.WORKSHOP_WORKORDER_DETAILS, { id: wo._id })}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 12,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: "#E2E8F0",
                      }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A" }}>
                            {wo.jobType} ({wo.jobNumber})
                          </Text>
                          <Text style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                            {wo.vehicle?.make} {wo.vehicle?.model} ({wo.vehicle?.registration})
                          </Text>
                        </View>
                        <WorkshopStatusBadge status={wo.status} size="small" />
                      </View>
                      <Text style={{ fontSize: 12, color: "#94A3B8" }}>
                        Received: {new Date(wo.dateReceived || wo.createdAt).toLocaleDateString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
