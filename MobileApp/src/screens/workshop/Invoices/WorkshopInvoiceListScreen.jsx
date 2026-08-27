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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopInvoiceService } from "../../../services/workshopInvoiceService";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

const CATEGORY_TABS = ["ALL", "Parts", "Insurances", "Other Expenses"];

export default function WorkshopInvoiceListScreen() {
  const navigation = useNavigation();

  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchInvoices = async () => {
    try {
      setError(null);
      const filters = {};
      if (selectedCategory !== "ALL") filters.category = selectedCategory;
      if (search) filters.search = search;

      const data = await workshopInvoiceService.getInvoices(filters);
      setInvoices(data);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError(err.response?.data?.message || "Failed to load invoices");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInvoices();
    }, [selectedCategory, search])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchInvoices();
  };

  const renderInvoiceItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate(ROUTES.WORKSHOP_INVOICE_DETAILS, { id: item._id })}
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
            {item.invoiceNumber}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#2563EB", marginTop: 2 }}>
            {item.category} {item.vendor ? `• ${item.vendor}` : ""}
          </Text>
        </View>

        <Text style={{ fontSize: 18, fontWeight: "800", color: "#16A34A" }}>
          ${item.amount?.toLocaleString() || 0}
        </Text>
      </View>

      <View style={{ borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 10, marginTop: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 12, color: "#64748B" }}>
          {item.vehicle?.registration ? `Vehicle: ${item.vehicle.registration}` : item.customer?.fullName ? `Customer: ${item.customer.fullName}` : "General Expense"}
        </Text>
        <Text style={{ fontSize: 11, color: "#94A3B8" }}>
          {new Date(item.date || item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{  flex: 1, backgroundColor: "#F8FAFC"  }} edges={["top"]}>
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
            Invoices & Expenses
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.ADD_WORKSHOP_INVOICE)}
          style={{
            backgroundColor: "#16A34A",
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

      {/* Category Tabs (Parts / Insurances / Other Expenses) */}
      <View style={{ paddingVertical: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {CATEGORY_TABS.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: isSelected ? "#16A34A" : "#FFFFFF",
                  borderWidth: 1,
                  borderColor: isSelected ? "#16A34A" : "#E2E8F0",
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Search Bar */}
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
            placeholder="Search invoice number, vendor..."
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
      ) : error && invoices.length === 0 ? (
        <WorkshopStateView error={error} onRetry={fetchInvoices} />
      ) : invoices.length === 0 ? (
        <WorkshopStateView
          empty={true}
          icon="receipt-outline"
          emptyTitle="No Invoices Recorded"
          emptySubtitle="Record parts purchases, insurances, or workshop operational expenses."
          emptyActionLabel="Add Invoice"
          onEmptyAction={() => navigation.navigate(ROUTES.ADD_WORKSHOP_INVOICE)}
        />
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item._id}
          renderItem={renderInvoiceItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}
