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
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopWorkOrderService } from "../../../services/workshopWorkOrderService";
import WorkshopStatusBadge from "../../../components/workshop/WorkshopStatusBadge";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

const STATUS_FILTERS = [
  "ALL",
  "OPEN",
  "IN_PROGRESS",
  "INSPECTION_PENDING",
  "WAITING_FOR_PARTS",
  "READY_FOR_COLLECTION",
  "COMPLETED",
];

const JOB_TYPE_FILTERS = ["ALL", "Basic Service", "Annual Service", "Lube Service", "Inspection", "Repair"];

export default function WorkOrderListScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const [workOrders, setWorkOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(route?.params?.status || "ALL");
  const [selectedJobType, setSelectedJobType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorkOrders = async () => {
    try {
      setError(null);
      const filters = {};
      if (selectedStatus !== "ALL") filters.status = selectedStatus;
      if (selectedJobType !== "ALL") filters.jobType = selectedJobType;
      if (search) filters.search = search;

      const data = await workshopWorkOrderService.getWorkOrders(filters);
      setWorkOrders(data);
    } catch (err) {
      console.error("Error fetching work orders:", err);
      setError(err.response?.data?.message || "Failed to load work orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWorkOrders();
    }, [selectedStatus, selectedJobType, search])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkOrders();
  };

  const renderWorkOrderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate(ROUTES.WORKSHOP_WORKORDER_DETAILS, { id: item._id })}
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
              {item.jobNumber}
            </Text>
            {item.priority && item.priority !== "Normal" && (
              <WorkshopStatusBadge status={item.priority} size="small" />
            )}
          </View>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#2563EB", marginTop: 2 }}>
            {item.jobType}
          </Text>
        </View>

        <WorkshopStatusBadge status={item.status} size="small" />
      </View>

      <View style={{ backgroundColor: "#F8FAFC", borderRadius: 8, padding: 10, marginTop: 6, marginBottom: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155" }}>
          {item.customer?.fullName || "Walk-in Customer"}
        </Text>
        <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
          {item.vehicle?.make} {item.vehicle?.model} ({item.vehicle?.registration}) • {item.vehicle?.vehicleType}
        </Text>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 8 }}>
        <Text style={{ fontSize: 12, color: "#64748B" }}>
          Mechanic: <Text style={{ fontWeight: "600", color: "#334155" }}>{item.assignedMechanic || "Unassigned"}</Text>
        </Text>
        <Text style={{ fontSize: 11, color: "#94A3B8" }}>
          {new Date(item.dateReceived || item.createdAt).toLocaleDateString()}
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
            Work Orders
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.CREATE_WORKSHOP_WORKORDER)}
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
          <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>New Job</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
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
            placeholder="Search job #, mechanic, description..."
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

      {/* Job Type Filter Chips */}
      <View style={{ paddingBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {JOB_TYPE_FILTERS.map((jt) => {
            const isSelected = selectedJobType === jt;
            return (
              <TouchableOpacity
                key={jt}
                onPress={() => setSelectedJobType(jt)}
                style={{
                  backgroundColor: isSelected ? "#2563EB" : "#F1F5F9",
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 16,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                  {jt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <WorkshopStateView loading={true} />
      ) : error && workOrders.length === 0 ? (
        <WorkshopStateView error={error} onRetry={fetchWorkOrders} />
      ) : workOrders.length === 0 ? (
        <WorkshopStateView
          empty={true}
          icon="clipboard-outline"
          emptyTitle="No Work Orders"
          emptySubtitle="Create a service job or work order when a vehicle arrives at the workshop."
          emptyActionLabel="Create Work Order"
          onEmptyAction={() => navigation.navigate(ROUTES.CREATE_WORKSHOP_WORKORDER)}
        />
      ) : (
        <FlatList
          data={workOrders}
          keyExtractor={(item) => item._id}
          renderItem={renderWorkOrderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}
