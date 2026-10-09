import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Alert,
  Platform,
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
    Alert.alert("Log Out", "Are you sure you want to log out of Workshop?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: ROUTES.LOGIN }] });
        },
      },
    ]);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatDisplayName = (rawName) => {
    if (!rawName) return "Workshop Manager";
    return rawName
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getInitials = (rawName) => {
    if (!rawName) return "WM";
    const parts = rawName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 20,
          paddingVertical: 14,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomWidth: 1,
          borderColor: "#E2E8F0",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#64748B" }}>
            {getGreeting()},
          </Text>
          <Text style={{ fontSize: 21, fontWeight: "800", color: "#0F172A", marginTop: 2 }}>
            {formatDisplayName(user?.name)}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogout}
          style={{
            padding: 8,
            backgroundColor: "#F1F5F9",
            borderRadius: 8,
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#64748B" />
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
          {/* Main Operational Overview */}
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A", marginBottom: 12 }}>
            Operational Overview
          </Text>

          {/* Primary KPI Grid */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
            {/* Today's Jobs */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_WORKORDER_LIST)}
              style={{
                width: "48%",
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: "#E2E8F0",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B" }}>Today's Jobs</Text>
                <Ionicons name="calendar-outline" size={16} color="#2563EB" />
              </View>
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#0F172A", marginTop: 8 }}>
                {summary.todaysJobs}
              </Text>
            </TouchableOpacity>

            {/* Open Work Orders */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_WORKORDER_LIST)}
              style={{
                width: "48%",
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: "#E2E8F0",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B" }}>Open Orders</Text>
                <Ionicons name="clipboard-outline" size={16} color="#0284C7" />
              </View>
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#0F172A", marginTop: 8 }}>
                {summary.openWorkOrders}
              </Text>
            </TouchableOpacity>

            {/* Vehicles In Workshop */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_VEHICLE_LIST, { status: "IN_WORKSHOP" })}
              style={{
                width: "48%",
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: "#E2E8F0",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B" }}>In Workshop</Text>
                <Ionicons name="car-outline" size={16} color="#D97706" />
              </View>
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#0F172A", marginTop: 8 }}>
                {summary.vehiclesInWorkshop}
              </Text>
            </TouchableOpacity>

            {/* Ready for Collection */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_WORKORDER_LIST, { status: "READY_FOR_COLLECTION" })}
              style={{
                width: "48%",
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: "#E2E8F0",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B" }}>Ready Collection</Text>
                <Ionicons name="checkmark-done-circle-outline" size={16} color="#7C3AED" />
              </View>
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#0F172A", marginTop: 8 }}>
                {summary.readyForCollection}
              </Text>
            </TouchableOpacity>

            {/* Services In Progress */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_WORKORDER_LIST, { status: "IN_PROGRESS" })}
              style={{
                width: "48%",
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: "#E2E8F0",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B" }}>In Progress</Text>
                <Ionicons name="build-outline" size={16} color="#059669" />
              </View>
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#0F172A", marginTop: 8 }}>
                {summary.servicesInProgress}
              </Text>
            </TouchableOpacity>

            {/* Inspections Pending */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_INSPECTION_LIST, { status: "PENDING" })}
              style={{
                width: "48%",
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: "#E2E8F0",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B" }}>Pending Inspect</Text>
                <Ionicons name="search-outline" size={16} color="#EA580C" />
              </View>
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#0F172A", marginTop: 8 }}>
                {summary.inspectionsPending}
              </Text>
            </TouchableOpacity>

            {/* Overdue Jobs */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_WORKORDER_LIST)}
              style={{
                width: "48%",
                backgroundColor: summary.overdueJobs > 0 ? "#FEF2F2" : "#FFFFFF",
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: summary.overdueJobs > 0 ? "#FECACA" : "#E2E8F0",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: summary.overdueJobs > 0 ? "#B91C1C" : "#64748B" }}>
                  Overdue Jobs
                </Text>
                <Ionicons name="alert-circle-outline" size={16} color={summary.overdueJobs > 0 ? "#DC2626" : "#64748B"} />
              </View>
              <Text style={{ fontSize: 24, fontWeight: "800", color: summary.overdueJobs > 0 ? "#B91C1C" : "#0F172A", marginTop: 8 }}>
                {summary.overdueJobs}
              </Text>
            </TouchableOpacity>

            {/* Today's Revenue */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_INVOICE_LIST)}
              style={{
                width: "48%",
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: "#E2E8F0",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B" }}>Today's Revenue</Text>
                <Ionicons name="cash-outline" size={16} color="#16A34A" />
              </View>
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#16A34A", marginTop: 8 }}>
                ${summary.todayRevenue.toLocaleString()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Workshop Navigation Hub Grid */}
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A", marginBottom: 12 }}>
            Management Hub
          </Text>

          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#E2E8F0", padding: 12, marginBottom: 20 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
              {/* Customers */}
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.WORKSHOP_CUSTOMER_LIST)}
                style={{ width: "24%", alignItems: "center", paddingVertical: 10 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                  <Ionicons name="people-outline" size={22} color="#2563EB" />
                </View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#334155", textAlign: "center" }}>Customers</Text>
              </TouchableOpacity>

              {/* Vehicles */}
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.WORKSHOP_VEHICLE_LIST)}
                style={{ width: "24%", alignItems: "center", paddingVertical: 10 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                  <Ionicons name="car-outline" size={22} color="#D97706" />
                </View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#334155", textAlign: "center" }}>Vehicles</Text>
              </TouchableOpacity>

              {/* Work Orders */}
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.WORKSHOP_WORKORDER_LIST)}
                style={{ width: "24%", alignItems: "center", paddingVertical: 10 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#E0F2FE", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                  <Ionicons name="clipboard-outline" size={22} color="#0284C7" />
                </View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#334155", textAlign: "center" }}>Work Orders</Text>
              </TouchableOpacity>

              {/* Inspections */}
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.WORKSHOP_INSPECTION_LIST)}
                style={{ width: "24%", alignItems: "center", paddingVertical: 10 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#F3E8FF", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                  <Ionicons name="search-outline" size={22} color="#7C3AED" />
                </View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#334155", textAlign: "center" }}>Inspection</Text>
              </TouchableOpacity>

              {/* Truck Services */}
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.WORKSHOP_TRUCK_SERVICES)}
                style={{ width: "24%", alignItems: "center", paddingVertical: 10 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                  <Ionicons name="build-outline" size={22} color="#15803D" />
                </View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#334155", textAlign: "center" }}>Truck Serv</Text>
              </TouchableOpacity>

              {/* Trailer Services */}
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.WORKSHOP_TRAILER_SERVICES)}
                style={{ width: "24%", alignItems: "center", paddingVertical: 10 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                  <Ionicons name="bus-outline" size={22} color="#DC2626" />
                </View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#334155", textAlign: "center" }}>Trailer Serv</Text>
              </TouchableOpacity>

              {/* Due Service */}
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.WORKSHOP_DUE_SERVICE)}
                style={{ width: "24%", alignItems: "center", paddingVertical: 10 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#FFEDD5", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                  <Ionicons name="time-outline" size={22} color="#C2410C" />
                </View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#334155", textAlign: "center" }}>Due Serv</Text>
              </TouchableOpacity>

              {/* Schedule */}
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.WORKSHOP_SCHEDULE)}
                style={{ width: "24%", alignItems: "center", paddingVertical: 10 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                  <Ionicons name="calendar-outline" size={22} color="#475569" />
                </View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#334155", textAlign: "center" }}>Schedule</Text>
              </TouchableOpacity>

              {/* Invoices */}
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.WORKSHOP_INVOICE_LIST)}
                style={{ width: "24%", alignItems: "center", paddingVertical: 10 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                  <Ionicons name="receipt-outline" size={22} color="#16A34A" />
                </View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#334155", textAlign: "center" }}>Invoices</Text>
              </TouchableOpacity>

              {/* Contacts */}
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.WORKSHOP_CONTACTS)}
                style={{ width: "24%", alignItems: "center", paddingVertical: 10 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                  <Ionicons name="call-outline" size={22} color="#2563EB" />
                </View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#334155", textAlign: "center" }}>Contacts</Text>
              </TouchableOpacity>

              {/* Notes */}
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.WORKSHOP_NOTES)}
                style={{ width: "24%", alignItems: "center", paddingVertical: 10 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#FEF9C3", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                  <Ionicons name="document-text-outline" size={22} color="#CA8A04" />
                </View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#334155", textAlign: "center" }}>Notes</Text>
              </TouchableOpacity>

              {/* Reminders */}
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.WORKSHOP_REMINDERS)}
                style={{ width: "24%", alignItems: "center", paddingVertical: 10 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#F3E8FF", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                  <Ionicons name="notifications-outline" size={22} color="#7C3AED" />
                </View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#334155", textAlign: "center" }}>Reminders</Text>
              </TouchableOpacity>

              {/* Employees */}
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.WORKSHOP_EMPLOYEE_LIST)}
                style={{ width: "24%", alignItems: "center", paddingVertical: 10 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#E0E7FF", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                  <Ionicons name="people-outline" size={22} color="#4338CA" />
                </View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#334155", textAlign: "center" }}>Employees</Text>
              </TouchableOpacity>

              {/* Team Chat */}
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.WORKSHOP_EMPLOYEE_CHAT)}
                style={{ width: "24%", alignItems: "center", paddingVertical: 10 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                  <Ionicons name="chatbubbles-outline" size={22} color="#2563EB" />
                </View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#334155", textAlign: "center" }}>Team Chat</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Workshop Activity */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
              Recent Workshop Activity
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.WORKSHOP_WORKORDER_LIST)}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#2563EB" }}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentActivity.length === 0 ? (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 24,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#E2E8F0",
              }}
            >
              <Ionicons name="clipboard-outline" size={32} color="#94A3B8" />
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#475569", marginTop: 8 }}>
                No Activity Yet
              </Text>
              <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 4, textAlign: "center" }}>
                Create a work order to begin tracking live workshop operations.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.CREATE_WORKSHOP_WORKORDER)}
                style={{
                  marginTop: 14,
                  backgroundColor: "#2563EB",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>+ New Work Order</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {recentActivity.map((item) => (
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
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A" }}>
                        {item.customer?.fullName || "Walk-in Customer"}
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: "#2563EB", marginTop: 2 }}>
                        {item.vehicle?.make} {item.vehicle?.model} ({item.vehicle?.registration})
                      </Text>
                    </View>
                    <WorkshopStatusBadge status={item.status} size="small" />
                  </View>

                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 8, marginTop: 4 }}>
                    <Text style={{ fontSize: 12, color: "#64748B" }}>
                      Job: <Text style={{ fontWeight: "600", color: "#334155" }}>{item.jobType}</Text> ({item.jobNumber})
                    </Text>
                    <Text style={{ fontSize: 11, color: "#94A3B8" }}>
                      {new Date(item.dateReceived || item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
