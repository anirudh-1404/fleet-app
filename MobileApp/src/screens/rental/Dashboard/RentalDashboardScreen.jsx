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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { rentalService } from "../../../services/rentalService";
import { useAuth } from "../../../context/AuthContext";
import ROUTES from "../../../constants/routes";
import RentalStatusBadge from "../../../components/rental/RentalStatusBadge";
import RentalStateView from "../../../components/rental/RentalStateView";

export default function RentalDashboardScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const res = await rentalService.getDashboardData();
      setData(res);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  const summary = data?.summary || {
    totalVehicles: 0,
    available: 0,
    currentlyRented: 0,
    returningToday: 0,
    overdueReturns: 0,
  };

  const todaysRentals = data?.todaysRentals || [];
  const upcomingReturns = data?.upcomingReturns || [];

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of your rental workspace?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: ROUTES.LOGIN }],
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{  flex: 1, backgroundColor: "#F8FAFC"  }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 16,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderColor: "#E2E8F0",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
            {formattedDate}
          </Text>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#0F172A", marginTop: 2 }}>
            {getGreeting()}, {user?.name || "Rental Manager"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: "#F1F5F9",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <RentalStateView type="loading" message="Loading rental operations..." />
      ) : error ? (
        <RentalStateView
          type="error"
          title="Could not load dashboard"
          message={error}
          onRetry={fetchDashboardData}
        />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#2563EB"]} />}
        >
          {/* Quick Operational Summary Section */}
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>
            Operational Summary
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4, marginBottom: 20 }}>
            {/* Total Vehicles */}
            <View style={{ width: "50%", padding: 4 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.RENTAL_VEHICLE_LIST)}
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "600" }}>Total Fleet</Text>
                  <Ionicons name="car" size={18} color="#64748B" />
                </View>
                <Text style={{ fontSize: 24, fontWeight: "800", color: "#0F172A" }}>{summary.totalVehicles}</Text>
              </TouchableOpacity>
            </View>

            {/* Available */}
            <View style={{ width: "50%", padding: 4 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.RENTAL_VEHICLE_LIST, { filterStatus: "AVAILABLE" })}
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#A7F3D0",
                  backgroundColor: "#F0FDF4",
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, color: "#059669", fontWeight: "700" }}>Available</Text>
                  <Ionicons name="checkmark-circle" size={18} color="#059669" />
                </View>
                <Text style={{ fontSize: 24, fontWeight: "800", color: "#059669" }}>{summary.available}</Text>
              </TouchableOpacity>
            </View>

            {/* Currently Rented */}
            <View style={{ width: "33.33%", padding: 4 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.RENTAL_LIST, { filterStatus: "ACTIVE" })}
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600", marginBottom: 4 }}>Rented</Text>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#2563EB" }}>{summary.currentlyRented}</Text>
              </TouchableOpacity>
            </View>

            {/* Returning Today */}
            <View style={{ width: "33.33%", padding: 4 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.RENTAL_LIST, { filterStatus: "RETURNING_TODAY" })}
                style={{
                  backgroundColor: summary.returningToday > 0 ? "#FFF7ED" : "#FFFFFF",
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: summary.returningToday > 0 ? "#FFEDD5" : "#E2E8F0",
                }}
              >
                <Text style={{ fontSize: 11, color: summary.returningToday > 0 ? "#EA580C" : "#64748B", fontWeight: "600", marginBottom: 4 }}>
                  Due Today
                </Text>
                <Text style={{ fontSize: 20, fontWeight: "800", color: summary.returningToday > 0 ? "#EA580C" : "#0F172A" }}>
                  {summary.returningToday}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Overdue */}
            <View style={{ width: "33.33%", padding: 4 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.RENTAL_LIST, { filterStatus: "OVERDUE" })}
                style={{
                  backgroundColor: summary.overdueReturns > 0 ? "#FEF2F2" : "#FFFFFF",
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: summary.overdueReturns > 0 ? "#FECACA" : "#E2E8F0",
                }}
              >
                <Text style={{ fontSize: 11, color: summary.overdueReturns > 0 ? "#DC2626" : "#64748B", fontWeight: "600", marginBottom: 4 }}>
                  Overdue
                </Text>
                <Text style={{ fontSize: 20, fontWeight: "800", color: summary.overdueReturns > 0 ? "#DC2626" : "#0F172A" }}>
                  {summary.overdueReturns}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions Bar */}
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>
            Quick Actions
          </Text>
          <View style={{ flexDirection: "row", marginBottom: 24, gap: 10 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.CREATE_RENTAL)}
              style={{
                flex: 1,
                backgroundColor: "#2563EB",
                paddingVertical: 14,
                paddingHorizontal: 12,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Ionicons name="key" size={18} color="#FFFFFF" />
              <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 14 }}>New Rental</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.ADD_RENTAL_VEHICLE)}
              style={{
                flex: 1,
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#CBD5E1",
                paddingVertical: 14,
                paddingHorizontal: 12,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Ionicons name="add-circle-outline" size={18} color="#0F172A" />
              <Text style={{ color: "#0F172A", fontWeight: "700", fontSize: 14 }}>Add Vehicle</Text>
            </TouchableOpacity>
          </View>

          {/* Today's Rentals Section */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: 0.6 }}>
              Today's Rentals ({todaysRentals.length})
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.RENTAL_LIST)}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#2563EB" }}>View All</Text>
            </TouchableOpacity>
          </View>

          {todaysRentals.length === 0 ? (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                padding: 24,
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Ionicons name="calendar-outline" size={28} color="#94A3B8" style={{ marginBottom: 8 }} />
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#334155" }}>No active rentals today</Text>
              <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Create a new rental to get started</Text>
            </View>
          ) : (
            <View style={{ marginBottom: 20 }}>
              {todaysRentals.slice(0, 4).map((rental) => (
                <TouchableOpacity
                  key={rental._id}
                  onPress={() => navigation.navigate(ROUTES.RENTAL_DETAILS, { rentalId: rental._id })}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    padding: 14,
                    marginBottom: 10,
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: "700", color: "#0F172A" }}>
                        {rental.customer?.fullName || "Unnamed Customer"}
                      </Text>
                      <Text style={{ fontSize: 13, color: "#475569", marginTop: 2, fontWeight: "500" }}>
                        {rental.vehicle ? `${rental.vehicle.make} ${rental.vehicle.model} (${rental.vehicle.registration})` : "Vehicle Details"}
                      </Text>
                    </View>
                    <RentalStatusBadge status={rental.status} size="sm" />
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTopWidth: 1,
                      borderColor: "#F1F5F9",
                      paddingTop: 10,
                      marginTop: 4,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Ionicons name="calendar-outline" size={14} color="#64748B" />
                      <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "500" }}>
                        {rental.startDate} → {rental.returnDate}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}>
                      ${rental.totalAmount || rental.rentalAmount}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Upcoming Returns Section */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: 0.6 }}>
              Upcoming Returns ({upcomingReturns.length})
            </Text>
          </View>

          {upcomingReturns.length === 0 ? (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                padding: 20,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 13, color: "#64748B" }}>No expected returns in the next few days.</Text>
            </View>
          ) : (
            upcomingReturns.map((rental) => (
              <TouchableOpacity
                key={rental._id}
                onPress={() => navigation.navigate(ROUTES.RENTAL_DETAILS, { rentalId: rental._id })}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  padding: 14,
                  marginBottom: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A" }}>
                    {rental.customer?.fullName}
                  </Text>
                  <Text style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                    {rental.vehicle?.make} {rental.vehicle?.model} • {rental.vehicle?.registration}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#2563EB", fontWeight: "600", marginTop: 4 }}>
                    Return: {rental.returnDate} at {rental.returnTime || "17:00"}
                  </Text>
                </View>
                <RentalStatusBadge status={rental.status} size="sm" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
