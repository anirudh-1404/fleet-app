import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopDueServiceService } from "../../../services/workshopDueServiceService";
import WorkshopStatusBadge from "../../../components/workshop/WorkshopStatusBadge";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

const STATUS_FILTERS = ["ALL", "OVERDUE", "DUE", "UPCOMING"];
const TYPE_FILTERS = ["ALL", "Truck", "Trailer"];

export default function DueServiceScreen() {
  const navigation = useNavigation();

  const [dueServices, setDueServices] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDueServices = async () => {
    try {
      setError(null);
      const filters = {};
      if (selectedStatus !== "ALL") filters.status = selectedStatus;
      if (selectedType !== "ALL") filters.vehicleType = selectedType;

      const data = await workshopDueServiceService.getDueServices(filters);
      setDueServices(data);
    } catch (err) {
      console.error("Error fetching due services:", err);
      setError(err.response?.data?.message || "Failed to load due services");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDueServices();
    }, [selectedStatus, selectedType])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDueServices();
  };

  const renderDueItem = ({ item }) => {
    const isOverdue = item.status === "OVERDUE";
    const isDue = item.status === "DUE";

    return (
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: isOverdue ? "#FECACA" : isDue ? "#FDE68A" : "#E2E8F0",
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
              {item.vehicle?.make} {item.vehicle?.model} ({item.vehicle?.registration})
            </Text>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#059669", marginTop: 2 }}>
              {item.serviceType} • {item.vehicle?.vehicleType}
            </Text>
          </View>

          <WorkshopStatusBadge status={item.status} size="small" />
        </View>

        <View style={{ backgroundColor: "#F8FAFC", borderRadius: 8, padding: 10, marginTop: 6, marginBottom: 10, gap: 4 }}>
          <Text style={{ fontSize: 12, color: "#475569" }}>
            Customer: <Text style={{ fontWeight: "600", color: "#0F172A" }}>{item.customer?.fullName || "Unassigned"}</Text>
          </Text>
          <Text style={{ fontSize: 12, color: "#475569" }}>
            Last Serviced: {new Date(item.lastServiceDate).toLocaleDateString()}
          </Text>
          <Text style={{ fontSize: 12, fontWeight: "700", color: isOverdue ? "#DC2626" : isDue ? "#D97706" : "#0F172A" }}>
            Next Due: {new Date(item.nextDueDate).toLocaleDateString()} {isOverdue ? `(${Math.abs(item.daysDifference)} days overdue)` : isDue ? `(in ${item.daysDifference} days)` : ""}
          </Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "flex-end", borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 10 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.ADD_WORKSHOP_SCHEDULE, {
              prefilledVehicleId: item.vehicle?._id,
              prefilledCustomerId: item.customer?._id,
              prefilledType: item.serviceType,
              prefilledDate: item.nextDueDate,
            })}
            style={{
              backgroundColor: "#059669",
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 6,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Ionicons name="calendar-outline" size={14} color="#FFFFFF" />
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>Schedule Service</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderColor: "#E2E8F0",
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 10 }}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>
          Due Services
        </Text>
      </View>

      {/* Status Filters */}
      <View style={{ paddingVertical: 8 }}>
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
                  borderRadius: 18,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#64748B" }}>
                  {st}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Type Filters */}
      <View style={{ paddingBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {TYPE_FILTERS.map((tp) => {
            const isSelected = selectedType === tp;
            return (
              <TouchableOpacity
                key={tp}
                onPress={() => setSelectedType(tp)}
                style={{
                  backgroundColor: isSelected ? "#059669" : "#F1F5F9",
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
      ) : error && dueServices.length === 0 ? (
        <WorkshopStateView error={error} onRetry={fetchDueServices} />
      ) : dueServices.length === 0 ? (
        <WorkshopStateView
          empty={true}
          icon="checkmark-circle-outline"
          emptyTitle="All Services Up to Date"
          emptySubtitle="No overdue or upcoming maintenance required for registered customer vehicles."
        />
      ) : (
        <FlatList
          data={dueServices}
          keyExtractor={(item) => item._id}
          renderItem={renderDueItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}
