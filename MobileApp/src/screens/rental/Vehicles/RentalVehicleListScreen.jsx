import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { rentalVehicleService } from "../../../services/rentalVehicleService";
import ROUTES from "../../../constants/routes";
import RentalStatusBadge from "../../../components/rental/RentalStatusBadge";
import RentalStateView from "../../../components/rental/RentalStateView";

const STATUS_TABS = ["ALL", "AVAILABLE", "RENTED", "MAINTENANCE", "INACTIVE"];

export default function RentalVehicleListScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const [selectedTab, setSelectedTab] = useState(route?.params?.filterStatus || "ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchVehicles = async () => {
    try {
      setError(null);
      const params = {};
      if (selectedTab !== "ALL") params.status = selectedTab;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await rentalVehicleService.getVehicles(params);
      setVehicles(res);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError(err.response?.data?.message || "Failed to load rental vehicles");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchVehicles();
    }, [selectedTab, searchQuery])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchVehicles();
  };

  const renderVehicleItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate(ROUTES.RENTAL_VEHICLE_DETAILS, { vehicleId: item._id })}
        activeOpacity={0.7}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#E2E8F0",
          padding: 14,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", gap: 12 }}>
          {/* Photo or Placeholder */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 10,
              backgroundColor: "#F1F5F9",
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {item.photo ? (
              <Image source={{ uri: item.photo }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            ) : (
              <Ionicons name="car-outline" size={36} color="#94A3B8" />
            )}
          </View>

          {/* Details */}
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            <View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#0F172A", flex: 1, marginRight: 6 }}>
                  {item.make} {item.model}
                </Text>
                <RentalStatusBadge status={item.status} size="sm" />
              </View>
              <Text style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                {item.registration} • {item.year} • {item.vehicleType}
              </Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: "800", color: "#2563EB" }}>
                ${item.dailyRate}
                <Text style={{ fontSize: 12, fontWeight: "500", color: "#64748B" }}>/day</Text>
              </Text>

              {item.status === "AVAILABLE" && (
                <TouchableOpacity
                  onPress={() => navigation.navigate(ROUTES.CREATE_RENTAL, { preSelectedVehicleId: item._id })}
                  style={{
                    backgroundColor: "#2563EB",
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>Rent</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{  flex: 1, backgroundColor: "#F8FAFC"  }} edges={["top"]}>
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
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F172A" }}>Rental Vehicles</Text>
          <Text style={{ fontSize: 12, color: "#64748B" }}>Manage your fleet & rates</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.ADD_RENTAL_VEHICLE)}
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
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>Add Vehicle</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
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
            placeholder="Search make, model, registration..."
            placeholderTextColor="#94A3B8"
            style={{ flex: 1, marginLeft: 8, fontSize: 14, color: "#0F172A" }}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Status Filter Tabs */}
      <View style={{ paddingBottom: 10 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_TABS}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => {
            const isSelected = selectedTab === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedTab(item)}
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
                  {item === "ALL" ? "All Vehicles" : item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Content */}
      {isLoading ? (
        <RentalStateView type="loading" message="Loading vehicles..." />
      ) : error ? (
        <RentalStateView type="error" message={error} onRetry={fetchVehicles} />
      ) : vehicles.length === 0 ? (
        <RentalStateView
          type="empty"
          title="No vehicles found"
          message={
            searchQuery || selectedTab !== "ALL"
              ? "Try adjusting your filters or search term."
              : "Register your first rental vehicle to start renting."
          }
          icon="car-sport-outline"
          onRetry={
            searchQuery || selectedTab !== "ALL"
              ? () => {
                  setSelectedTab("ALL");
                  setSearchQuery("");
                }
              : () => navigation.navigate(ROUTES.ADD_RENTAL_VEHICLE)
          }
          actionText={searchQuery || selectedTab !== "ALL" ? "Clear Filters" : "Add Vehicle"}
        />
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item._id}
          renderItem={renderVehicleItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#2563EB"]} />}
        />
      )}
    </SafeAreaView>
  );
}
