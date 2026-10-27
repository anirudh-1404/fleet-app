import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopEmployeeService } from "../../../services/workshopEmployeeService";
import { useAuth } from "../../../context/AuthContext";
import WorkshopStatusBadge from "../../../components/workshop/WorkshopStatusBadge";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

const TABS = [
  { key: "ALL", label: "All" },
  { key: "OPEN", label: "Assigned" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "WAITING_FOR_PARTS", label: "Waiting Parts" },
  { key: "COMPLETED", label: "Done" },
];

export default function EmployeeHomeScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("ALL");
  const [jobs, setJobs] = useState([]);
  const [counts, setCounts] = useState({ all: 0, assigned: 0, inProgress: 0, waitingParts: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    try {
      setError(null);
      const res = await workshopEmployeeService.getMyJobs();
      setJobs(res.jobs || []);
      if (res.counts) setCounts(res.counts);
    } catch (err) {
      console.error("Error fetching mechanic jobs:", err);
      setError(err.response?.data?.message || "Failed to load assigned jobs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const handleLogout = () => {
    const doLogout = async () => {
      try {
        await logout();
      } catch (err) {
        console.error("Logout error:", err);
      }
      const rootNav = navigation.getParent() || navigation;
      rootNav.reset({ index: 0, routes: [{ name: ROUTES.LOGIN }] });
    };

    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        const confirmed = window.confirm("Are you sure you want to sign out?");
        if (confirmed) {
          doLogout();
        }
      } else {
        doLogout();
      }
    } else {
      Alert.alert("Logout", "Are you sure you want to sign out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: doLogout,
        },
      ]);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "OPEN") return job.status === "OPEN" || job.status === "INSPECTION_PENDING";
    return job.status === activeTab;
  });

  const renderJobItem = ({ item }) => {
    const isPriorityHigh = item.priority === "Urgent" || item.priority === "Critical";

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate(ROUTES.WORKSHOP_EMPLOYEE_JOB_DETAILS, { id: item._id })}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 14,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: isPriorityHigh ? "#FCA5A5" : "#E2E8F0",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        {/* Top Tag & Status */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#059669", marginRight: 8 }}>
              {item.jobNumber}
            </Text>
            {isPriorityHigh ? (
              <View style={{ backgroundColor: "#FEE2E2", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ fontSize: 10, fontWeight: "800", color: "#DC2626" }}>{item.priority}</Text>
              </View>
            ) : null}
          </View>
          <WorkshopStatusBadge status={item.status} />
        </View>

        {/* Vehicle Information */}
        <Text style={{ fontSize: 17, fontWeight: "800", color: "#0F172A", marginBottom: 4 }}>
          {item.vehicle ? `${item.vehicle.make} ${item.vehicle.model}` : "Vehicle N/A"}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <View style={{ backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginRight: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155" }}>
              {item.vehicle?.registration || "No Rego"}
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "600" }}>{item.jobType}</Text>
        </View>

        {/* Description */}
        {item.description ? (
          <Text style={{ fontSize: 13, color: "#475569", marginBottom: 12, lineHeight: 18 }} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {/* Action Footer */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderTopWidth: 1,
            borderTopColor: "#F1F5F9",
            paddingTop: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="clipboard-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, color: "#64748B" }}>
              Checklist: {item.checklist?.completedAt ? "Done" : "Pending"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#059669", marginRight: 2 }}>
              Open Job
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#059669" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 14,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E2E8F0",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#64748B" }}>Mechanic Portal</Text>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F172A" }}>
            {user?.name || "Technician"}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogout}
          style={{
            backgroundColor: "#FEE2E2",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="log-out-outline" size={16} color="#DC2626" style={{ marginRight: 4 }} />
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#DC2626" }}>Exit</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Action: Start Service / Add Truck */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, backgroundColor: "#FFFFFF" }}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate(ROUTES.WORKSHOP_EMPLOYEE_START_SERVICE)}
          style={{
            backgroundColor: "#059669",
            borderRadius: 14,
            paddingVertical: 13,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            shadowColor: "#059669",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.22,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Ionicons name="construct" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "800", color: "#FFFFFF" }}>
                Start Service / Add Truck
              </Text>
              <Text style={{ fontSize: 12, color: "#A7F3D0", fontWeight: "500", marginTop: 2 }}>
                Search truck #, see past history, or add new
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons name="add" size={16} color="#059669" style={{ marginRight: 2 }} />
            <Text style={{ fontSize: 12, fontWeight: "800", color: "#059669" }}>New</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={{ backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TABS}
          keyExtractor={(t) => t.key}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
          renderItem={({ item }) => {
            const active = activeTab === item.key;
            return (
              <TouchableOpacity
                onPress={() => setActiveTab(item.key)}
                style={{
                  backgroundColor: active ? "#059669" : "#F1F5F9",
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: active ? "700" : "600",
                    color: active ? "#FFFFFF" : "#475569",
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main List */}
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
        {loading && !refreshing ? (
          <WorkshopStateView type="loading" message="Loading assigned jobs..." />
        ) : error ? (
          <WorkshopStateView type="error" message={error} onRetry={fetchJobs} />
        ) : filteredJobs.length === 0 ? (
          <WorkshopStateView
            type="empty"
            title="No Jobs In This Tab"
            message={
              activeTab === "ALL"
                ? "You currently have no jobs assigned to you. Tap 'Start Service / Add Truck' above to search past history or add a new truck to begin work."
                : `No jobs currently matching "${TABS.find((t) => t.key === activeTab)?.label}".`
            }
          />
        ) : (
          <FlatList
            data={filteredJobs}
            keyExtractor={(item) => item._id}
            renderItem={renderJobItem}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} />}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
