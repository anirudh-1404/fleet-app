import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopDashboardService } from "../../../services/workshopDashboardService";
import { useAuth } from "../../../context/AuthContext";
import WorkshopStatusBadge from "../../../components/workshop/WorkshopStatusBadge";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

export default function WorkshopDashboardScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboard = async () => {
    try {
      setError(null);
      const data = await workshopDashboardService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of Workshop?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: ROUTES.LOGIN }] });
        },
      },
    ]);
  };

  const summary = dashboardData?.summary || {
    todaysJobs: 0,
    openWorkOrders: 0,
    vehiclesInWorkshop: 0,
    inspectionsPending: 0,
    servicesInProgress: 0,
    readyForCollection: 0,
    overdueJobs: 0,
    upcomingScheduledServices: 0,
    todayRevenue: 0,
  };

  const recentActivity = dashboardData?.recentActivity || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Clean Modern Header */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 14,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomWidth: 1,
          borderColor: "#F1F5F9",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: "#0F172A",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>
              {(user?.name || "W")[0].toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#0F172A" }}>
              {user?.name || "Workshop Manager"}
            </Text>
            <Text style={{ fontSize: 12, color: "#64748B" }}>
              Workshop Garage • Active
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: "#F8FAFC",
            borderWidth: 1,
            borderColor: "#E2E8F0",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="log-out-outline" size={18} color="#64748B" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <WorkshopStateView loading={true} />
      ) : error && !dashboardData ? (
        <WorkshopStateView error={error} onRetry={fetchDashboard} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Hero KPI Summary Card */}
          <View
            style={{
              backgroundColor: "#0F172A",
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>
              Today's Operations
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={{ fontSize: 26, fontWeight: "800", color: "#FFFFFF" }}>
                  {summary.vehiclesInWorkshop}
                </Text>
                <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>In Workshop</Text>
              </View>

              <View style={{ width: 1, height: 36, backgroundColor: "#334155" }} />

              <View>
                <Text style={{ fontSize: 26, fontWeight: "800", color: "#FCD34D" }}>
                  {summary.readyForCollection}
                </Text>
                <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>Ready for Pickup</Text>
              </View>

              <View style={{ width: 1, height: 36, backgroundColor: "#334155" }} />

              <View>
                <Text style={{ fontSize: 26, fontWeight: "800", color: "#4ADE80" }}>
                  ${summary.todayRevenue.toLocaleString()}
                </Text>
                <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>Today's Billing</Text>
              </View>
            </View>
          </View>

          {/* Quick Action Bar */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate(ROUTES.CREATE_WORKSHOP_WORKORDER)}
              style={{
                flex: 1.4,
                backgroundColor: "#2563EB",
                borderRadius: 10,
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Ionicons name="add-circle" size={18} color="#FFFFFF" />
              <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>
                New Work Order
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate(ROUTES.ADD_WORKSHOP_VEHICLE)}
              style={{
                flex: 1,
                backgroundColor: "#FFFFFF",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#CBD5E1",
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <Ionicons name="car-outline" size={16} color="#0F172A" />
              <Text style={{ color: "#0F172A", fontSize: 12, fontWeight: "700" }}>
                Add Vehicle
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate(ROUTES.ADD_WORKSHOP_CUSTOMER)}
              style={{
                flex: 1,
                backgroundColor: "#FFFFFF",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#CBD5E1",
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <Ionicons name="person-add-outline" size={16} color="#0F172A" />
              <Text style={{ color: "#0F172A", fontSize: 12, fontWeight: "700" }}>
                Customer
              </Text>
            </TouchableOpacity>
          </View>

          {/* Section 1: Active Work Orders */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
              Active Floor Jobs
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.WORKSHOP_WORKORDER_LIST)}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#2563EB" }}>View All ›</Text>
            </TouchableOpacity>
          </View>

          {recentActivity.length === 0 ? (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 20,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#E2E8F0",
                marginBottom: 20,
              }}
            >
              <Ionicons name="clipboard-outline" size={28} color="#94A3B8" />
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#64748B", marginTop: 6 }}>
                No active jobs currently in workshop
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8, marginBottom: 20 }}>
              {recentActivity.slice(0, 3).map((item) => (
                <TouchableOpacity
                  key={item._id}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate(ROUTES.WORKSHOP_WORKORDER_DETAILS, { id: item._id })}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}>
                        {item.vehicle?.registration || "UNREGISTERED"} • {item.vehicle?.make} {item.vehicle?.model}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                        {item.customer?.fullName || "Walk-in"} • {item.jobType}
                      </Text>
                    </View>
                    <WorkshopStatusBadge status={item.status} size="small" />
                  </View>

                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderColor: "#F8FAFC", paddingTop: 8, marginTop: 4 }}>
                    <Text style={{ fontSize: 11, color: "#94A3B8" }}>
                      Job #{item.jobNumber}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#64748B" }}>
                      Mechanic: <Text style={{ fontWeight: "600", color: "#334155" }}>{item.assignedMechanic || "Unassigned"}</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Section 2: Workshop Operations */}
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>
            Garage Operations
          </Text>

          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", overflow: "hidden", marginBottom: 20 }}>
            {/* Work Orders */}
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_WORKORDER_LIST)}
              style={{ flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderColor: "#F1F5F9" }}
            >
              <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name="clipboard" size={17} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>All Work Orders</Text>
                <Text style={{ fontSize: 12, color: "#64748B" }}>Active jobs, service stages & history</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={{ backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#475569" }}>{summary.openWorkOrders}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
              </View>
            </TouchableOpacity>

            {/* Inspections */}
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_INSPECTION_LIST)}
              style={{ flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderColor: "#F1F5F9" }}
            >
              <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: "#F5F3FF", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name="shield-checkmark" size={17} color="#7C3AED" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>Vehicle Inspections</Text>
                <Text style={{ fontSize: 12, color: "#64748B" }}>Truck & Trailer mechanical checklists</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Truck Services */}
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_TRUCK_SERVICES)}
              style={{ flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderColor: "#F1F5F9" }}
            >
              <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: "#F0FDF4", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name="construct" size={17} color="#16A34A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>Truck Services</Text>
                <Text style={{ fontSize: 12, color: "#64748B" }}>Lube, Basic & Annual truck maintenance</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Trailer Services */}
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_TRAILER_SERVICES)}
              style={{ flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderColor: "#F1F5F9" }}
            >
              <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: "#FEF2F2", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name="bus" size={17} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>Trailer Services</Text>
                <Text style={{ fontSize: 12, color: "#64748B" }}>Axle, lube & trailer maintenance</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Due Service */}
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_DUE_SERVICE)}
              style={{ flexDirection: "row", alignItems: "center", padding: 14 }}
            >
              <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: "#FFF7ED", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name="time" size={17} color="#EA580C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>Due & Upcoming Service</Text>
                <Text style={{ fontSize: 12, color: "#64748B" }}>Auto-calculated interval forecast</Text>
              </View>
              {summary.overdueJobs > 0 && (
                <View style={{ backgroundColor: "#FEE2E2", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginRight: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#DC2626" }}>{summary.overdueJobs} Overdue</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          </View>

          {/* Section 3: Management & Directory */}
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>
            Management & Records
          </Text>

          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", overflow: "hidden", marginBottom: 20 }}>
            {/* Customers */}
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_CUSTOMER_LIST)}
              style={{ flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderColor: "#F1F5F9" }}
            >
              <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: "#F8FAFC", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name="people" size={17} color="#334155" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>Customers Directory</Text>
                <Text style={{ fontSize: 12, color: "#64748B" }}>Client accounts, fleets & contacts</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Vehicles */}
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_VEHICLE_LIST)}
              style={{ flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderColor: "#F1F5F9" }}
            >
              <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: "#F8FAFC", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name="car-sport" size={17} color="#334155" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>Registered Vehicles</Text>
                <Text style={{ fontSize: 12, color: "#64748B" }}>Trucks & Trailers registered</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Invoices */}
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_INVOICE_LIST)}
              style={{ flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderColor: "#F1F5F9" }}
            >
              <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: "#F8FAFC", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name="receipt" size={17} color="#334155" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>Invoices & Parts Expenses</Text>
                <Text style={{ fontSize: 12, color: "#64748B" }}>Billing, spare parts & expenses</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Schedule */}
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_SCHEDULE)}
              style={{ flexDirection: "row", alignItems: "center", padding: 14 }}
            >
              <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: "#F8FAFC", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name="calendar" size={17} color="#334155" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>Schedule Calendar</Text>
                <Text style={{ fontSize: 12, color: "#64748B" }}>Upcoming maintenance appointments</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          </View>

          {/* Section 4: Workshop Utilities */}
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>
            Team & Notes
          </Text>

          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", overflow: "hidden", marginBottom: 20 }}>
            {/* Contacts */}
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_CONTACTS)}
              style={{ flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderColor: "#F1F5F9" }}
            >
              <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: "#F8FAFC", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name="call" size={17} color="#334155" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>Mechanics & Suppliers</Text>
                <Text style={{ fontSize: 12, color: "#64748B" }}>Technicians & parts vendor directory</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Notes */}
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_NOTES)}
              style={{ flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderColor: "#F1F5F9" }}
            >
              <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: "#F8FAFC", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name="document-text" size={17} color="#334155" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>Workshop Notes</Text>
                <Text style={{ fontSize: 12, color: "#64748B" }}>Operational logs & vehicle remarks</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Reminders */}
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_REMINDERS)}
              style={{ flexDirection: "row", alignItems: "center", padding: 14 }}
            >
              <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: "#F8FAFC", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name="alarm" size={17} color="#334155" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>Action Reminders</Text>
                <Text style={{ fontSize: 12, color: "#64748B" }}>Follow-ups, part pickups & tasks</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
