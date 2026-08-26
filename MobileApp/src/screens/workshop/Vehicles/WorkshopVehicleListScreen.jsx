import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopVehicleService } from "../../../services/workshopVehicleService";
import WorkshopStatusBadge from "../../../components/workshop/WorkshopStatusBadge";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

const STATUS_FILTERS = ["ALL", "IN_WORKSHOP", "READY_FOR_COLLECTION", "OUTSIDE_WORKSHOP", "AVAILABLE"];
const TYPE_FILTERS = ["ALL", "Truck", "Trailer", "Van", "Ute"];

export default function WorkshopVehicleListScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(route?.params?.status || "ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchVehicles = async () => {
    try {
      setError(null);
      const filters = {};
      if (selectedStatus !== "ALL") filters.status = selectedStatus;
      if (selectedType !== "ALL") filters.vehicleType = selectedType;
      if (search) filters.search = search;

      const data = await workshopVehicleService.getVehicles(filters);
      setVehicles(data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError(err.response?.data?.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchVehicles();
    }, [selectedStatus, selectedType, search])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchVehicles();
  };

  const renderVehicleItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate(ROUTES.WORKSHOP_VEHICLE_DETAILS, { id: item._id })}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={{ fontSize: 17, fontWeight: "800", color: "#0F172A" }}>
            {item.make} {item.model} {item.year ? `(${item.year})` : ""}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#2563EB", marginTop: 2 }}>
            {item.registration} • {item.vehicleType}
          </Text>
        </View>

        <WorkshopStatusBadge status={item.status} size="small" />
      </View>

      <View style={{ borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 10, marginTop: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="person-outline" size={14} color="#64748B" />
          <Text style={{ fontSize: 13, color: "#475569", marginLeft: 6 }}>
            {item.customer?.fullName || "No Customer"}
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "500" }}>
          {item.odometer?.toLocaleString() || 0} km
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
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
            Customer Vehicles
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.ADD_WORKSHOP_VEHICLE)}
          style={{
            backgroundColor: "#2563EB",
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 }}>
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#CBD5E1",
            borderRadius: 10,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            height: 44,
          }}
        >
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search registration, make, model, VIN..."
            placeholderTextColor="#94A3B8"
            style={{
              flex: 1,
              marginLeft: 8,
              fontSize: 14,
              color: "#0F172A",
            }}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Status Filter Chips */}
      <View style={{ paddingVertical: 6 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {STATUS_FILTERS.map((st) => {
            const isSelected = selectedStatus === st;
            return (
              <TouchableOpacity
                key={st}
                onPress={() => setSelectedStatus(st)}
                style={{
                  backgroundColor: isSelected ? "#0F172A" : "#FFFFFF",
                  borderWidth: 1,
                  borderColor: isSelected ? "#0F172A" : "#E2E8F0",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#64748B" }}>
                  {st.replace(/_/g, " ")}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Vehicle Type Filter Chips */}
      <View style={{ paddingBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {TYPE_FILTERS.map((tp) => {
            const isSelected = selectedType === tp;
            return (
              <TouchableOpacity
                key={tp}
                onPress={() => setSelectedType(tp)}
                style={{
                  backgroundColor: isSelected ? "#2563EB" : "#F1F5F9",
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 16,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                  {tp}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <WorkshopStateView loading={true} />
      ) : error && vehicles.length === 0 ? (
        <WorkshopStateView error={error} onRetry={fetchVehicles} />
      ) : vehicles.length === 0 ? (
        <WorkshopStateView
          empty={true}
          icon="car-outline"
          emptyTitle="No Vehicles Found"
          emptySubtitle="Add a customer vehicle to start servicing and scheduling jobs."
          emptyActionLabel="Add Vehicle"
          onEmptyAction={() => navigation.navigate(ROUTES.ADD_WORKSHOP_VEHICLE)}
        />
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item._id}
          renderItem={renderVehicleItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}
