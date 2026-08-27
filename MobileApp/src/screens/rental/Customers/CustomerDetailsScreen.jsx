import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { customerService } from "../../../services/customerService";
import ROUTES from "../../../constants/routes";
import RentalStatusBadge from "../../../components/rental/RentalStatusBadge";
import RentalStateView from "../../../components/rental/RentalStateView";

export default function CustomerDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const customerId = route.params?.customerId;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    if (!customerId) return;
    try {
      setError(null);
      const res = await customerService.getCustomerById(customerId);
      setData(res);
    } catch (err) {
      console.error("Error fetching customer details:", err);
      setError(err.response?.data?.message || "Failed to load customer details");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [customerId])
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC", paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0 }} edges={["top"]}>
        <RentalStateView type="loading" message="Loading customer profile..." />
      </SafeAreaView>
    );
  }

  if (error || !data?.customer) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC", paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0 }} edges={["top"]}>
        <RentalStateView type="error" message={error || "Customer not found"} onRetry={fetchDetails} />
      </SafeAreaView>
    );
  }

  const { customer, rentals = [] } = data;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC", paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0 }} edges={["top"]}>
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
          Customer Profile
        </Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Profile Card */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            padding: 18,
            marginBottom: 16,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "#EFF6FF",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            <Ionicons name="person" size={32} color="#2563EB" />
          </View>

          <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F172A" }}>
            {customer.fullName}
          </Text>
          <Text style={{ fontSize: 14, color: "#2563EB", fontWeight: "600", marginTop: 2 }}>
            {customer.phone}
          </Text>
          {customer.email ? (
            <Text style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
              {customer.email}
            </Text>
          ) : null}

          {/* Quick Action: New Rental */}
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.CREATE_RENTAL, { customerPrefill: customer })}
            style={{
              backgroundColor: "#2563EB",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginTop: 14,
            }}
          >
            <Ionicons name="key" size={16} color="#FFFFFF" />
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>Create New Rental</Text>
          </TouchableOpacity>
        </View>

        {/* Identity & Licence Info */}
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
            Identification & Verification
          </Text>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Licence Number</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>{customer.licenceNumber}</Text>
            </View>

            {customer.licenceClass ? (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Licence Class</Text>
                <Text style={{ fontSize: 13, color: "#0F172A" }}>{customer.licenceClass}</Text>
              </View>
            ) : null}

            {customer.licenceExpiry ? (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Licence Expiry</Text>
                <Text style={{ fontSize: 13, color: "#0F172A" }}>{customer.licenceExpiry}</Text>
              </View>
            ) : null}

            {customer.address ? (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Address</Text>
                <Text style={{ fontSize: 13, color: "#0F172A", flex: 1, textAlign: "right", marginLeft: 12 }}>
                  {customer.address}
                </Text>
              </View>
            ) : null}

            {customer.emergencyContact ? (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Emergency Contact</Text>
                <Text style={{ fontSize: 13, color: "#0F172A" }}>{customer.emergencyContact}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Customer Rental History */}
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
            Rental History ({rentals.length})
          </Text>

          {rentals.length === 0 ? (
            <Text style={{ fontSize: 13, color: "#64748B", textAlign: "center", paddingVertical: 12 }}>
              No rental records for this customer yet.
            </Text>
          ) : (
            rentals.map((item, index) => (
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
                    {item.vehicle ? `${item.vehicle.make} ${item.vehicle.model}` : "Vehicle"}
                  </Text>
                  <RentalStatusBadge status={item.status} size="sm" />
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                  <Text style={{ fontSize: 12, color: "#64748B" }}>
                    {item.startDate} → {item.returnDate}
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
