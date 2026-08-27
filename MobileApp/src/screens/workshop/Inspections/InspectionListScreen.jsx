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
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopInspectionService } from "../../../services/workshopInspectionService";
import WorkshopStatusBadge from "../../../components/workshop/WorkshopStatusBadge";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

const STATUS_FILTERS = ["ALL", "PENDING", "IN_PROGRESS", "PASSED", "FAILED", "COMPLETED"];

export default function InspectionListScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const [inspectionType, setInspectionType] = useState("Truck"); // "Truck" | "Trailer"
  const [selectedStatus, setSelectedStatus] = useState(route?.params?.status || "ALL");
  const [search, setSearch] = useState("");
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchInspections = async () => {
    try {
      setError(null);
      const filters = {
        inspectionType,
      };
      if (selectedStatus !== "ALL") filters.status = selectedStatus;
      if (search) filters.search = search;

      const data = await workshopInspectionService.getInspections(filters);
      setInspections(data);
    } catch (err) {
      console.error("Error fetching inspections:", err);
      setError(err.response?.data?.message || "Failed to load inspections");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInspections();
    }, [inspectionType, selectedStatus, search])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchInspections();
  };

  const renderInspectionItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate(ROUTES.WORKSHOP_INSPECTION_DETAILS, { id: item._id })}
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
            {item.vehicle?.make} {item.vehicle?.model} ({item.vehicle?.registration})
          </Text>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#2563EB", marginTop: 2 }}>
            {item.inspectionType} Inspection {item.workOrder?.jobNumber ? `• ${item.workOrder.jobNumber}` : ""}
          </Text>
        </View>

        <WorkshopStatusBadge status={item.status} size="small" />
      </View>

      <View style={{ borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 10, marginTop: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="person-outline" size={14} color="#64748B" />
          <Text style={{ fontSize: 13, color: "#475569", marginLeft: 6 }}>
            Inspector: {item.inspectorName}
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: "#64748B" }}>
          {item.checklistItems?.length || 0} checks • {new Date(item.date || item.createdAt).toLocaleDateString()}
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
            Inspections
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.CREATE_WORKSHOP_INSPECTION, { defaultType: inspectionType })}
          style={{
            backgroundColor: "#7C3AED",
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>Inspect</Text>
        </TouchableOpacity>
      </View>

      {/* Inspection Sub-tabs (Truck vs Trailer) */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 }}>
        <View style={{ flexDirection: "row", backgroundColor: "#E2E8F0", borderRadius: 10, padding: 3 }}>
          <TouchableOpacity
            onPress={() => setInspectionType("Truck")}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: inspectionType === "Truck" ? "#FFFFFF" : "transparent",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: inspectionType === "Truck" ? "#0F172A" : "#64748B" }}>
              Truck Inspection
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setInspectionType("Trailer")}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: inspectionType === "Trailer" ? "#FFFFFF" : "transparent",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: inspectionType === "Trailer" ? "#0F172A" : "#64748B" }}>
              Trailer Inspection
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
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
            placeholder={`Search ${inspectionType.toLowerCase()} inspections, inspector...`}
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
      <View style={{ paddingBottom: 10 }}>
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
                  paddingVertical: 5,
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

      {loading && !refreshing ? (
        <WorkshopStateView loading={true} />
      ) : error && inspections.length === 0 ? (
        <WorkshopStateView error={error} onRetry={fetchInspections} />
      ) : inspections.length === 0 ? (
        <WorkshopStateView
          empty={true}
          icon="search-outline"
          emptyTitle={`No ${inspectionType} Inspections`}
          emptySubtitle={`Record a ${inspectionType.toLowerCase()} inspection with safety & mechanical checklist items.`}
          emptyActionLabel="Record Inspection"
          onEmptyAction={() => navigation.navigate(ROUTES.CREATE_WORKSHOP_INSPECTION, { defaultType: inspectionType })}
        />
      ) : (
        <FlatList
          data={inspections}
          keyExtractor={(item) => item._id}
          renderItem={renderInspectionItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}
