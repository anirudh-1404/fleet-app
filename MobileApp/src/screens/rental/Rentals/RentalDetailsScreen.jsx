import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { rentalService } from "../../../services/rentalService";
import ROUTES from "../../../constants/routes";
import RentalStatusBadge from "../../../components/rental/RentalStatusBadge";
import RentalStateView from "../../../components/rental/RentalStateView";

export default function RentalDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const rentalId = route.params?.rentalId;

  const [rental, setRental] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    if (!rentalId) return;
    try {
      setError(null);
      const res = await rentalService.getRentalById(rentalId);
      setRental(res);
    } catch (err) {
      console.error("Error fetching rental details:", err);
      setError(err.response?.data?.message || "Failed to load rental details");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [rentalId])
  );

  const handleCancel = () => {
    Alert.alert(
      "Cancel Rental Agreement",
      "Are you sure you want to cancel this rental booking? The vehicle will become available immediately.",
      [
        { text: "No, Keep", style: "cancel" },
        {
          text: "Yes, Cancel Rental",
          style: "destructive",
          onPress: async () => {
            try {
              await rentalService.cancelRental(rentalId);
              Alert.alert("Cancelled", "Rental cancelled successfully", [
                { text: "OK", onPress: () => fetchDetails() },
              ]);
            } catch (err) {
              Alert.alert("Error", err.response?.data?.message || "Could not cancel rental");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
        <RentalStateView type="loading" message="Loading rental details..." />
      </SafeAreaView>
    );
  }

  if (error || !rental) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
        <RentalStateView type="error" message={error || "Rental not found"} onRetry={fetchDetails} />
      </SafeAreaView>
    );
  }

  const { customer, vehicle } = rental;
  const isReturnable = rental.status === "ACTIVE" || rental.status === "OVERDUE";
  const isCancellable = rental.status === "UPCOMING";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
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
          Rental Agreement
        </Text>

        <RentalStatusBadge status={rental.status} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* OVERDUE ALERT BANNER */}
        {rental.status === "OVERDUE" && (
          <View
            style={{
              backgroundColor: "#FEF2F2",
              borderWidth: 1,
              borderColor: "#FECACA",
              borderRadius: 12,
              padding: 14,
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Ionicons name="warning" size={24} color="#DC2626" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#991B1B" }}>
                Vehicle Return Overdue!
              </Text>
              <Text style={{ fontSize: 12, color: "#B91C1C", marginTop: 2 }}>
                This rental was expected back on {rental.returnDate}. Please contact renter or process return.
              </Text>
            </View>
          </View>
        )}

        {/* Section 1: Customer Details */}
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
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>
              Customer / Renter Details
            </Text>
            <Ionicons name="person-circle-outline" size={20} color="#64748B" />
          </View>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Full Name</Text>
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}>
                {customer?.fullName || "N/A"}
              </Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Phone Number</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#059669" }}>
                {customer?.phone || "N/A"}
              </Text>
            </View>

            {customer?.email ? (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Email</Text>
                <Text style={{ fontSize: 13, color: "#0F172A" }}>{customer.email}</Text>
              </View>
            ) : null}

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Licence Number</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#0F172A" }}>
                {customer?.licenceNumber || "N/A"}
              </Text>
            </View>

            {customer?.licenceExpiry ? (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Licence Expiry</Text>
                <Text style={{ fontSize: 13, color: "#0F172A" }}>{customer.licenceExpiry}</Text>
              </View>
            ) : null}

            {customer?.address ? (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Address</Text>
                <Text style={{ fontSize: 13, color: "#0F172A", flex: 1, textAlign: "right", marginLeft: 12 }}>
                  {customer.address}
                </Text>
              </View>
            ) : null}

            {customer?.emergencyContact ? (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Emergency Contact</Text>
                <Text style={{ fontSize: 13, color: "#0F172A" }}>{customer.emergencyContact}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Section 2: Vehicle Details */}
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
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>
              Rented Vehicle
            </Text>
            <Ionicons name="car-outline" size={20} color="#64748B" />
          </View>

          {vehicle ? (
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Vehicle</Text>
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Registration / Plate</Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#0F172A" }}>
                  {vehicle.registration}
                </Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Vehicle Type</Text>
                <Text style={{ fontSize: 13, color: "#0F172A" }}>{vehicle.vehicleType}</Text>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.RENTAL_VEHICLE_DETAILS, { vehicleId: vehicle._id })}
                style={{ marginTop: 4, alignSelf: "flex-start" }}
              >
                <Text style={{ fontSize: 12, color: "#059669", fontWeight: "700" }}>View Full Vehicle Profile →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={{ fontSize: 13, color: "#64748B" }}>Vehicle details unavailable</Text>
          )}
        </View>

        {/* Section 3: Period & Schedule */}
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
            Rental Schedule & Dates
          </Text>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Start Date & Time</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#0F172A" }}>
                {rental.startDate} at {rental.startTime || "09:00"}
              </Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Expected Return Date</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#059669" }}>
                {rental.returnDate} at {rental.returnTime || "17:00"}
              </Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Duration</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#0F172A" }}>
                {rental.durationDays} {rental.durationDays === 1 ? "Day" : "Days"}
              </Text>
            </View>
          </View>
        </View>

        {/* Section 4: Financial Summary */}
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
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>
              Financial Summary
            </Text>
            <RentalStatusBadge status={rental.paymentStatus} size="sm" />
          </View>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Daily Rate</Text>
              <Text style={{ fontSize: 13, color: "#0F172A" }}>${rental.dailyRate} / day</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Rental Total ({rental.durationDays} days)</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#0F172A" }}>${rental.rentalAmount}</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Security Deposit</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#0F172A" }}>${rental.securityDeposit || 0}</Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingTop: 10,
                marginTop: 4,
                borderTopWidth: 1,
                borderColor: "#F1F5F9",
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>Total Amount</Text>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#059669" }}>${rental.totalAmount}</Text>
            </View>
          </View>
        </View>

        {/* Section 5: Return Details (If RETURNED) */}
        {rental.status === "RETURNED" && (
          <View
            style={{
              backgroundColor: "#F0FDF4",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#BBF7D0",
              padding: 16,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#065F46" }}>
                Vehicle Return Log
              </Text>
              <Ionicons name="checkmark-done-circle" size={22} color="#059669" />
            </View>

            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#047857" }}>Actual Return Date</Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#065F46" }}>
                  {rental.actualReturnDate} at {rental.actualReturnTime || "17:00"}
                </Text>
              </View>

              {rental.returnOdometer ? (
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 13, color: "#047857" }}>Odometer at Return</Text>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#065F46" }}>{rental.returnOdometer} km</Text>
                </View>
              ) : null}

              {rental.returnFuelLevel ? (
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 13, color: "#047857" }}>Fuel Level at Return</Text>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#065F46" }}>{rental.returnFuelLevel}</Text>
                </View>
              ) : null}

              {rental.additionalCharges ? (
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 13, color: "#047857" }}>Additional Charges</Text>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#DC2626" }}>+${rental.additionalCharges}</Text>
                </View>
              ) : null}

              {rental.damageNotes ? (
                <View style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 12, color: "#047857" }}>Damage Inspection Notes:</Text>
                  <Text style={{ fontSize: 13, color: "#065F46", marginTop: 2 }}>{rental.damageNotes}</Text>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {isReturnable && (
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.RETURN_RENTAL, { rental })}
            style={{
              backgroundColor: "#059669",
              height: 52,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
            <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 16 }}>Process Vehicle Return</Text>
          </TouchableOpacity>
        )}

        {isCancellable && (
          <TouchableOpacity
            onPress={handleCancel}
            style={{
              backgroundColor: "#FEF2F2",
              borderWidth: 1,
              borderColor: "#FECACA",
              height: 50,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#DC2626", fontWeight: "700", fontSize: 15 }}>Cancel Rental Booking</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
