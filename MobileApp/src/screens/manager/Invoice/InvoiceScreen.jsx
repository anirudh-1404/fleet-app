import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ROUTES from "@constants/routes";
import SearchBar from "@components/fleet/SearchBar";
import FilterChip from "@components/fleet/FilterChip";
import StatusBadge from "@components/fleet/StatusBadge";
import EmptyState from "@components/fleet/EmptyState";
import { useFleetData } from "../../../context/FleetDataContext";

const CATEGORY_FILTERS = ["All", "Service", "Parts", "Insurance", "Other"];

export default function InvoiceScreen() {
  const navigation = useNavigation();
  const { invoices } = useFleetData();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredInvoices = useMemo(() => {
    return invoices.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.invoiceNumber.toLowerCase().includes(q) ||
        item.vehicleName.toLowerCase().includes(q) ||
        item.registration.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (activeCategory === "All") return true;
      return (item.category || "Service") === activeCategory;
    });
  }, [invoices, searchQuery, activeCategory]);

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 flex-row items-center justify-between mb-5">
        <View className="flex-row items-center flex-1 mr-3">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white border border-[#E8EDF3] items-center justify-center mr-3"
            style={{
              shadowColor: "#111827",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.015,
              shadowRadius: 10,
              elevation: 1,
            }}
          >
            <Ionicons name="arrow-back-outline" size={20} color="#111827" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-[#111827]">Invoices</Text>
            <Text className="text-sm text-[#6B7280] mt-0.5">Manage billing receipts and invoices</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate(ROUTES.ADD_INVOICE)}
          className="h-10 px-4 bg-[#2563EB] rounded-full items-center justify-center flex-row"
          style={{
            shadowColor: "#2563EB",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Ionicons name="add" size={18} color="white" />
          <Text className="text-white text-xs font-semibold ml-1">Add Invoice</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-6 mb-4">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search invoice #, vehicle, rego..."
        />
      </View>

      {/* Category Filters */}
      <View className="mb-5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          {CATEGORY_FILTERS.map((opt) => (
            <FilterChip
              key={opt}
              label={opt}
              isActive={activeCategory === opt}
              onPress={() => setActiveCategory(opt)}
            />
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filteredInvoices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
          flexGrow: 1,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate(ROUTES.INVOICE_DETAILS, { invoiceId: item.id })}
            className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 mb-4"
            style={{
              shadowColor: "#111827",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.015,
              shadowRadius: 10,
              elevation: 1,
            }}
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1 mr-2">
                <Text className="text-base font-bold text-[#111827]">{item.invoiceNumber}</Text>
                <Text className="text-xs font-semibold text-[#2563EB] mt-0.5">
                  {item.vehicleName} ({item.registration})
                </Text>
              </View>
              <StatusBadge status={item.status} />
            </View>
            <Text className="text-sm text-[#6B7280] mb-3 leading-5" numberOfLines={2}>
              {item.description}
            </Text>
            <View className="border-t border-[#E8EDF3] pt-3 flex-row justify-between items-center">
              <View>
                <Text className="text-[10px] text-[#6B7280] uppercase tracking-wider">Date Issued</Text>
                <Text className="text-xs font-semibold text-[#111827] mt-0.5">{item.date}</Text>
              </View>
              <View className="items-end">
                <Text className="text-[10px] text-[#6B7280] uppercase tracking-wider">Amount</Text>
                <Text className="text-sm font-bold text-[#111827] mt-0.5">{item.amount}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Invoices Found"
            subtitle="There are no billing receipts matching your search or category."
            icon="receipt-outline"
            actionText="Add New Invoice"
            onActionPress={() => navigation.navigate(ROUTES.ADD_INVOICE)}
          />
        }
      />
    </SafeAreaView>
  );
}
