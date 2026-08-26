import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopScheduleService } from "../../../services/workshopScheduleService";
import WorkshopStatusBadge from "../../../components/workshop/WorkshopStatusBadge";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

const TYPE_FILTERS = ["ALL", "Service", "Inspection"];
const STATUS_FILTERS = ["ALL", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function WorkshopScheduleScreen() {
  const navigation = useNavigation();

  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchedules = async () => {
    try {
      setError(null);
      const filters = {};
      if (selectedType !== "ALL") filters.type = selectedType;
      if (selectedStatus !== "ALL") filters.status = selectedStatus;

      const data = await workshopScheduleService.getSchedules(filters);
      setSchedules(data);
    } catch (err) {
      console.error("Error fetching schedules:", err);
      setError(err.response?.data?.message || "Failed to load schedules");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSchedules();
    }, [selectedType, selectedStatus])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchedules();
  };

  const renderScheduleItem = ({ item }) => (
    <View
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
            {item.serviceOrInspectionType}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#2563EB", marginTop: 2 }}>
            {item.vehicle?.make} {item.vehicle?.model} ({item.vehicle?.registration})
          </Text>
        </View>

        <WorkshopStatusBadge status={item.status} size="small" />
      </View>

      <View style={{ backgroundColor: "#F8FAFC", borderRadius: 8, padding: 10, marginTop: 6, gap: 4 }}>
        <Text style={{ fontSize: 12, color: "#475569" }}>
          Scheduled: <Text style={{ fontWeight: "700", color: "#0F172A" }}>{new Date(item.scheduledDate).toLocaleDateString()}</Text>
        </Text>
        <Text style={{ fontSize: 12, color: "#475569" }}>
          Customer: <Text style={{ fontWeight: "600", color: "#334155" }}>{item.customer?.fullName || "Unassigned"}</Text>
        </Text>
        {item.assignedPerson ? (
          <Text style={{ fontSize: 12, color: "#475569" }}>
            Technician: <Text style={{ fontWeight: "600", color: "#334155" }}>{item.assignedPerson}</Text>
          </Text>
        ) : null}
        {item.notes ? (
          <Text style={{ fontSize: 12, color: "#64748B", fontStyle: "italic", marginTop: 2 }}>
            {item.notes}
          </Text>
        ) : null}
      </View>
    </View>
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
            Schedule Calendar
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.ADD_WORKSHOP_SCHEDULE)}
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
          <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>Schedule</Text>
        </TouchableOpacity>
      </View>

      {/* Type Filters */}
      <View style={{ paddingVertical: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {TYPE_FILTERS.map((tf) => {
            const isSelected = selectedType === tf;
            return (
              <TouchableOpacity
                key={tf}
                onPress={() => setSelectedType(tf)}
                style={{
                  backgroundColor: isSelected ? "#0F172A" : "#FFFFFF",
                  borderWidth: 1,
                  borderColor: isSelected ? "#0F172A" : "#E2E8F0",
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 18,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#64748B" }}>
                  {tf}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Status Filters */}
      <View style={{ paddingBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {STATUS_FILTERS.map((st) => {
            const isSelected = selectedStatus === st;
            return (
              <TouchableOpacity
                key={st}
                onPress={() => setSelectedStatus(st)}
                style={{
                  backgroundColor: isSelected ? "#2563EB" : "#F1F5F9",
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 16,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                  {st}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <WorkshopStateView loading={true} />
      ) : error && schedules.length === 0 ? (
        <WorkshopStateView error={error} onRetry={fetchSchedules} />
      ) : schedules.length === 0 ? (
        <WorkshopStateView
          empty={true}
          icon="calendar-outline"
          emptyTitle="No Scheduled Events"
          emptySubtitle="Schedule upcoming inspections or servicing jobs in advance."
          emptyActionLabel="Schedule Service"
          onEmptyAction={() => navigation.navigate(ROUTES.ADD_WORKSHOP_SCHEDULE)}
        />
      ) : (
        <FlatList
          data={schedules}
          keyExtractor={(item) => item._id}
          renderItem={renderScheduleItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}
