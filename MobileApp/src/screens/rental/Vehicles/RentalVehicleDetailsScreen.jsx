import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { rentalVehicleService } from "../../../services/rentalVehicleService";
import ROUTES from "../../../constants/routes";
import RentalStatusBadge from "../../../components/rental/RentalStatusBadge";
import RentalStateView from "../../../components/rental/RentalStateView";

export default function RentalVehicleDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const vehicleId = route.params?.vehicleId;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    if (!vehicleId) return;
    try {
      setError(null);
      const res = await rentalVehicleService.getVehicleById(vehicleId);
      setData(res);
    } catch (err) {
      console.error("Error fetching vehicle details:", err);
      setError(err.response?.data?.message || "Failed to load vehicle details");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [vehicleId])
  );

  const handleDelete = () => {
    Alert.alert(
      "Delete Vehicle",
      "Are you sure you want to remove this vehicle from your rental fleet? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await rentalVehicleService.deleteVehicle(vehicleId);
              Alert.alert("Deleted", "Vehicle deleted successfully", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (err) {
              Alert.alert("Delete Failed", err.response?.data?.message || "Could not delete vehicle.");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
        <RentalStateView type="loading" message="Loading vehicle specifications..." />
      </SafeAreaView>
    );
  }

  if (error || !data?.vehicle) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
        <RentalStateView type="error" message={error || "Vehicle not found"} onRetry={fetchDetails} />
      </SafeAreaView>
    );
  }

  const { vehicle, currentRental, rentalHistory = [] } = data;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Navigation Bar */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderColor: "#E2E8F0",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <Text style={{ fontSize: 17, fontWeight: "800", color: "#0F172A" }}>
          {vehicle.make} {vehicle.model}
        </Text>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.EDIT_RENTAL_VEHICLE, { vehicle })}
            style={{ padding: 4 }}
          >
            <Ionicons name="create-outline" size={22} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={{ padding: 4 }}>
            <Ionicons name="trash-outline" size={22} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Vehicle Card Header */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          {/* Photo */}
          <View
            style={{
              height: 180,
              backgroundColor: "#F1F5F9",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {vehicle.photo ? (
              <Image source={{ uri: vehicle.photo }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            ) : (
              <Ionicons name="car-sport" size={64} color="#94A3B8" />
            )}
          </View>

          {/* Core Info */}
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F172A" }}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </Text>
                <Text style={{ fontSize: 14, color: "#64748B", marginTop: 2, fontWeight: "500" }}>
                  {vehicle.vehicleType} • Plate: {vehicle.registration}
                </Text>
              </View>
              <RentalStatusBadge status={vehicle.status} />
            </View>

            {/* Rates strip */}
            <View
              style={{
                flexDirection: "row",
                marginTop: 16,
                paddingTop: 14,
                borderTopWidth: 1,
                borderColor: "#F1F5F9",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600", textTransform: "uppercase" }}>
                  Daily Rental Rate
                </Text>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#2563EB", marginTop: 2 }}>
                  ${vehicle.dailyRate}
                  <Text style={{ fontSize: 12, fontWeight: "500", color: "#64748B" }}> / day</Text>
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600", textTransform: "uppercase" }}>
                  Security Deposit
                </Text>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F172A", marginTop: 2 }}>
                  ${vehicle.securityDeposit || 0}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Button: Rent this vehicle if AVAILABLE */}
        {vehicle.status === "AVAILABLE" && (
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.CREATE_RENTAL, { preSelectedVehicleId: vehicle._id })}
            style={{
              backgroundColor: "#2563EB",
              paddingVertical: 14,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <Ionicons name="key" size={18} color="#FFFFFF" />
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}>Create Rental for this Vehicle</Text>
          </TouchableOpacity>
        )}

        {/* Current Active Rental Card (if currently rented) */}
        {currentRental && (
          <View
            style={{
              backgroundColor: "#EFF6FF",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#BFDBFE",
              padding: 16,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E40AF", textTransform: "uppercase" }}>
                Current Active Rental
              </Text>
              <RentalStatusBadge status={currentRental.status} size="sm" />
            </View>

            <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
              {currentRental.customer?.fullName || "Customer"}
            </Text>
            <Text style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>
              Phone: {currentRental.customer?.phone || "N/A"}
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: "#DBEAFE" }}>
              <Text style={{ fontSize: 12, color: "#1E40AF", fontWeight: "600" }}>
                Period: {currentRental.startDate} → {currentRental.returnDate}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.RENTAL_DETAILS, { rentalId: currentRental._id })}
              >
                <Text style={{ fontSize: 12, color: "#2563EB", fontWeight: "700" }}>View Rental →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Vehicle Specifications Table */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A", marginBottom: 12 }}>
            Vehicle Specifications
          </Text>

          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Registration / Plate</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#0F172A" }}>{vehicle.registration}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Vehicle Type</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#0F172A" }}>{vehicle.vehicleType}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Model Year</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#0F172A" }}>{vehicle.year}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>VIN / Chassis</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#0F172A" }}>{vehicle.vin || "Not recorded"}</Text>
            </View>
            {vehicle.notes ? (
              <View style={{ marginTop: 4, paddingTop: 10, borderTopWidth: 1, borderColor: "#F1F5F9" }}>
                <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 2 }}>Notes</Text>
                <Text style={{ fontSize: 13, color: "#334155" }}>{vehicle.notes}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Complete Rental History Section */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A", marginBottom: 12 }}>
            Rental History ({rentalHistory.length})
          </Text>

          {rentalHistory.length === 0 ? (
            <Text style={{ fontSize: 13, color: "#64748B", textAlign: "center", paddingVertical: 12 }}>
              No rental history recorded for this vehicle yet.
            </Text>
          ) : (
            rentalHistory.map((item, index) => (
              <TouchableOpacity
                key={item._id}
                onPress={() => navigation.navigate(ROUTES.RENTAL_DETAILS, { rentalId: item._id })}
                style={{
                  paddingVertical: 10,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderColor: "#F1F5F9",
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>
                    {item.customer?.fullName || "Customer"}
                  </Text>
                  <RentalStatusBadge status={item.status} size="sm" />
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                  <Text style={{ fontSize: 12, color: "#64748B" }}>
                    {item.startDate} → {item.returnDate} ({item.durationDays} days)
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#0F172A" }}>
                    ${item.totalAmount || item.rentalAmount}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
