import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopCustomerService } from "../../../services/workshopCustomerService";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

export default function CustomerListScreen() {
  const navigation = useNavigation();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    try {
      setError(null);
      const data = await workshopCustomerService.getCustomers(search);
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(err.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCustomers();
    }, [search])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  const renderCustomerItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate(ROUTES.WORKSHOP_CUSTOMER_DETAILS, { id: item._id })}
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
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#0F172A" }}>
            {item.fullName}
          </Text>
          {item.companyName ? (
            <Text style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
              {item.companyName}
            </Text>
          ) : null}
        </View>

        <View style={{ flexDirection: "row", gap: 6 }}>
          <View style={{ backgroundColor: "#EFF6FF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#1D4ED8" }}>
              {item.vehiclesCount || 0} {item.vehiclesCount === 1 ? "Vehicle" : "Vehicles"}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 10, marginTop: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="call-outline" size={14} color="#64748B" />
          <Text style={{ fontSize: 13, color: "#475569", marginLeft: 6, fontWeight: "500" }}>
            {item.phone}
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: "#94A3B8" }}>
          {item.workOrdersCount || 0} {item.workOrdersCount === 1 ? "Work Order" : "Work Orders"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC", paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0 }} edges={["top"]}>
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
            Customers Directory
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.ADD_WORKSHOP_CUSTOMER)}
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
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 }}>
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
            placeholder="Search by name, company, phone..."
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
      ) : error && customers.length === 0 ? (
        <WorkshopStateView error={error} onRetry={fetchCustomers} />
      ) : customers.length === 0 ? (
        <WorkshopStateView
          empty={true}
          icon="people-outline"
          emptyTitle="No Customers Found"
          emptySubtitle={search ? "Try searching for a different customer name or phone." : "Add your first customer to begin servicing vehicles."}
          emptyActionLabel="Add Customer"
          onEmptyAction={() => navigation.navigate(ROUTES.ADD_WORKSHOP_CUSTOMER)}
        />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item._id}
          renderItem={renderCustomerItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}
