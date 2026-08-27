import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { rentalService } from "../../../services/rentalService";
import ROUTES from "../../../constants/routes";
import RentalStatusBadge from "../../../components/rental/RentalStatusBadge";
import RentalStateView from "../../../components/rental/RentalStateView";

const FILTER_TABS = [
  { id: "ALL", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "UPCOMING", label: "Upcoming" },
  { id: "RETURNING_TODAY", label: "Due Today" },
  { id: "OVERDUE", label: "Overdue" },
  { id: "RETURNED", label: "Returned" },
  { id: "CANCELLED", label: "Cancelled" },
];

export default function RentalListScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const [selectedTab, setSelectedTab] = useState(route?.params?.filterStatus || "ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [rentals, setRentals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchRentals = async () => {
    try {
      setError(null);
      const params = {};
      if (selectedTab !== "ALL") params.status = selectedTab;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await rentalService.getRentals(params);
      setRentals(res);
    } catch (err) {
      console.error("Error fetching rentals:", err);
      setError(err.response?.data?.message || "Failed to load rentals");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRentals();
    }, [selectedTab, searchQuery])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchRentals();
  };

  const renderRentalItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate(ROUTES.RENTAL_DETAILS, { rentalId: item._id })}
        activeOpacity={0.7}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: item.status === "OVERDUE" ? "#FECACA" : "#E2E8F0",
          padding: 14,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
              {item.customer?.fullName || "Customer"}
            </Text>
            <Text style={{ fontSize: 13, color: "#64748B", marginTop: 2, fontWeight: "500" }}>
              {item.vehicle ? `${item.vehicle.make} ${item.vehicle.model} (${item.vehicle.registration})` : "Vehicle Details"}
            </Text>
          </View>
          <RentalStatusBadge status={item.status} size="sm" />
        </View>

        {/* Date line */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 4,
            marginBottom: 10,
          }}
        >
          <Ionicons name="calendar-outline" size={14} color="#64748B" />
          <Text style={{ fontSize: 13, color: "#475569", fontWeight: "600" }}>
            {item.startDate} → {item.returnDate} ({item.durationDays}d)
          </Text>
        </View>

        {/* Bottom strip: Price & Payment */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            borderTopWidth: 1,
            borderColor: "#F1F5F9",
            paddingTop: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 12, color: "#64748B" }}>Payment:</Text>
            <RentalStatusBadge status={item.paymentStatus} size="sm" />
          </View>

          <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
            ${item.totalAmount || item.rentalAmount}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC", paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0 }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 12,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderColor: "#E2E8F0",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F172A" }}>Rentals</Text>
          <Text style={{ fontSize: 12, color: "#64748B" }}>Bookings & active agreements</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.CREATE_RENTAL)}
          style={{
            backgroundColor: "#2563EB",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 10,
            gap: 6,
          }}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>New Rental</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#CBD5E1",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            height: 42,
          }}
        >
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search customer, phone, plate..."
            placeholderTextColor="#94A3B8"
            style={{ flex: 1, marginLeft: 8, fontSize: 14, color: "#0F172A" }}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={{ paddingBottom: 10 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_TABS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => {
            const isSelected = selectedTab === item.id;
            return (
              <TouchableOpacity
                onPress={() => setSelectedTab(item.id)}
                style={{
                  backgroundColor: isSelected ? "#0F172A" : "#FFFFFF",
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: isSelected ? "#0F172A" : "#E2E8F0",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: isSelected ? "#FFFFFF" : "#64748B",
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main Content */}
      {isLoading ? (
        <RentalStateView type="loading" message="Loading rentals..." />
      ) : error ? (
        <RentalStateView type="error" message={error} onRetry={fetchRentals} />
      ) : rentals.length === 0 ? (
        <RentalStateView
          type="empty"
          title="No rentals found"
          message={
            searchQuery || selectedTab !== "ALL"
              ? "Try adjusting your filters or search term."
              : "No rental bookings found. Create a new rental to start."
          }
          icon="document-text-outline"
          onRetry={
            searchQuery || selectedTab !== "ALL"
              ? () => {
                  setSelectedTab("ALL");
                  setSearchQuery("");
                }
              : () => navigation.navigate(ROUTES.CREATE_RENTAL)
          }
          actionText={searchQuery || selectedTab !== "ALL" ? "Clear Filters" : "New Rental"}
        />
      ) : (
        <FlatList
          data={rentals}
          keyExtractor={(item) => item._id}
          renderItem={renderRentalItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#2563EB"]} />}
        />
      )}
    </SafeAreaView>
  );
}
