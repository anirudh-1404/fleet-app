import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopServiceService } from "../../../services/workshopServiceService";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

const SERVICE_TABS = ["ALL", "Lube Service", "Basic Service", "Annual Service", "Repair"];

export default function TruckServicesScreen() {
  const navigation = useNavigation();

  const [selectedTab, setSelectedTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchServices = async () => {
    try {
      setError(null);
      const filters = { vehicleCategory: "Truck" };
      if (selectedTab !== "ALL") filters.serviceType = selectedTab;
      if (search) filters.search = search;

      const data = await workshopServiceService.getServices(filters);
      setServices(data);
    } catch (err) {
      console.error("Error fetching truck services:", err);
      setError(err.response?.data?.message || "Failed to load truck services");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchServices();
    }, [selectedTab, search])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate(ROUTES.WORKSHOP_TRUCK_SERVICE_DETAILS, { id: item._id })}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
            {item.serviceType}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#2563EB", marginTop: 2 }}>
            {item.vehicle?.make} {item.vehicle?.model} ({item.vehicle?.registration})
          </Text>
        </View>

        <Text style={{ fontSize: 17, fontWeight: "800", color: "#15803D" }}>
          ${item.cost || 0}
        </Text>
      </View>

      <View style={{ borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 10, marginTop: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 12, color: "#64748B" }}>
          Odometer: <Text style={{ fontWeight: "600", color: "#334155" }}>{item.odometer?.toLocaleString() || 0} km</Text>
        </Text>
        <Text style={{ fontSize: 11, color: "#94A3B8" }}>
          {new Date(item.date || item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
            Truck Services
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.ADD_WORKSHOP_TRUCK_SERVICE)}
          style={{
            backgroundColor: "#15803D",
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>Record</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs (Lube Service / Basic Service / Annual Service) */}
      <View style={{ paddingVertical: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {SERVICE_TABS.map((tab) => {
            const isSelected = selectedTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedTab(tab)}
                style={{
                  backgroundColor: isSelected ? "#15803D" : "#FFFFFF",
                  borderWidth: 1,
                  borderColor: isSelected ? "#15803D" : "#E2E8F0",
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Search Input */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
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
            placeholder="Search vendor, notes..."
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

      {loading && !refreshing ? (
        <WorkshopStateView loading={true} />
      ) : error && services.length === 0 ? (
        <WorkshopStateView error={error} onRetry={fetchServices} />
      ) : services.length === 0 ? (
        <WorkshopStateView
          empty={true}
          icon="construct-outline"
          emptyTitle="No Truck Services Found"
          emptySubtitle="Record oil changes, basic servicing, or annual truck maintenance."
          emptyActionLabel="Record Truck Service"
          onEmptyAction={() => navigation.navigate(ROUTES.ADD_WORKSHOP_TRUCK_SERVICE)}
        />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item._id}
          renderItem={renderServiceItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}
