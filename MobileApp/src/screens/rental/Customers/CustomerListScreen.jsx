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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { customerService } from "../../../services/customerService";
import ROUTES from "../../../constants/routes";
import RentalStateView from "../../../components/rental/RentalStateView";

export default function CustomerListScreen() {
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    try {
      setError(null);
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await customerService.getCustomers(params);
      setCustomers(res);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(err.response?.data?.message || "Failed to load customer roster");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCustomers();
    }, [searchQuery])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchCustomers();
  };

  const renderCustomerItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate(ROUTES.RENTAL_CUSTOMER_DETAILS, { customerId: item._id })}
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
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>{item.fullName}</Text>
            <Text style={{ fontSize: 13, color: "#2563EB", marginTop: 2, fontWeight: "600" }}>{item.phone}</Text>
          </View>
          <View
            style={{
              backgroundColor: "#F1F5F9",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569" }}>
              {item.totalRentals} {item.totalRentals === 1 ? "Rental" : "Rentals"}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderColor: "#F1F5F9",
          }}
        >
          <Text style={{ fontSize: 12, color: "#64748B" }}>
            Licence: <Text style={{ fontWeight: "700", color: "#334155" }}>{item.licenceNumber}</Text>
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.CREATE_RENTAL, { customerPrefill: item })}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Ionicons name="key-outline" size={14} color="#2563EB" />
            <Text style={{ fontSize: 12, color: "#2563EB", fontWeight: "700" }}>Rent Vehicle</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
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
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F172A" }}>Customers</Text>
          <Text style={{ fontSize: 12, color: "#64748B" }}>Renter records & history</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 }}>
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
            placeholder="Search by name, phone, licence..."
            placeholderTextColor="#94A3B8"
            style={{ flex: 1, marginLeft: 8, fontSize: 14, color: "#0F172A" }}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Main List */}
      {isLoading ? (
        <RentalStateView type="loading" message="Loading customers..." />
      ) : error ? (
        <RentalStateView type="error" message={error} onRetry={fetchCustomers} />
      ) : customers.length === 0 ? (
        <RentalStateView
          type="empty"
          title="No customers recorded"
          message={
            searchQuery
              ? "No customer matches your search."
              : "Customers are automatically saved when you create rental agreements."
          }
          icon="people-outline"
          onRetry={searchQuery ? () => setSearchQuery("") : undefined}
          actionText="Clear Search"
        />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item._id}
          renderItem={renderCustomerItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#2563EB"]} />}
        />
      )}
    </SafeAreaView>
  );
}
