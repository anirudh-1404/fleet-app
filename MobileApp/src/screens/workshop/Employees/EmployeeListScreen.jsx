import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopEmployeeService } from "../../../services/workshopEmployeeService";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

export default function EmployeeListScreen() {
  const navigation = useNavigation();

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    try {
      setError(null);
      const data = await workshopEmployeeService.getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError(err.response?.data?.message || "Failed to load employee list");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEmployees();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEmployees();
  };

  const filteredEmployees = employees.filter((emp) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      (emp.name && emp.name.toLowerCase().includes(q)) ||
      (emp.email && emp.email.toLowerCase().includes(q)) ||
      (emp.designation && emp.designation.toLowerCase().includes(q)) ||
      (emp.phone && emp.phone.includes(q))
    );
  });

  const renderEmployeeItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate(ROUTES.WORKSHOP_EMPLOYEE_DETAILS, { id: item._id })}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 2 }}>
            {item.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                backgroundColor: "#ECFDF5",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                alignSelf: "flex-start",
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#059669" }}>
                {item.designation || "Technician"}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            backgroundColor: item.status === "Active" ? "#DCFCE7" : "#F1F5F9",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: item.status === "Active" ? "#15803D" : "#64748B",
            }}
          >
            {item.status || "Active"}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, marginBottom: 12 }}>
        <Ionicons name="mail-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
        <Text style={{ fontSize: 13, color: "#64748B", flex: 1 }} numberOfLines={1}>
          {item.email}
        </Text>
        {item.phone ? (
          <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 12 }}>
            <Ionicons name="call-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 13, color: "#64748B" }}>{item.phone}</Text>
          </View>
        ) : null}
      </View>

      {/* Stats Bar */}
      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderTopColor: "#F1F5F9",
          paddingTop: 10,
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: (item.activeJobsCount || 0) > 0 ? "#F59E0B" : "#94A3B8",
              marginRight: 6,
            }}
          />
          <Text style={{ fontSize: 12, color: "#334155", fontWeight: "600" }}>
            {item.activeJobsCount || 0} Active Job{item.activeJobsCount === 1 ? "" : "s"}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="checkmark-circle-outline" size={14} color="#10B981" style={{ marginRight: 4 }} />
          <Text style={{ fontSize: 12, color: "#64748B" }}>
            {item.completedJobsCount || 0} Completed
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E2E8F0",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6, marginRight: 8 }}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F172A" }}>Employees & Techs</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate(ROUTES.ADD_WORKSHOP_EMPLOYEE)}
          style={{
            backgroundColor: "#059669",
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={{ padding: 16, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F1F5F9",
            borderRadius: 10,
            paddingHorizontal: 12,
            height: 42,
          }}
        >
          <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search by name, designation, email..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, fontSize: 14, color: "#0F172A" }}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Body List */}
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
        {loading && !refreshing ? (
          <WorkshopStateView type="loading" message="Loading employee roster..." />
        ) : error ? (
          <WorkshopStateView type="error" message={error} onRetry={fetchEmployees} />
        ) : filteredEmployees.length === 0 ? (
          <WorkshopStateView
            type="empty"
            title="No Employees Found"
            message={search ? "No mechanics match your search query." : "You haven't added any employees or mechanics to your workshop yet."}
            actionLabel="+ Add First Employee"
            onAction={() => navigation.navigate(ROUTES.ADD_WORKSHOP_EMPLOYEE)}
          />
        ) : (
          <FlatList
            data={filteredEmployees}
            keyExtractor={(item) => item._id}
            renderItem={renderEmployeeItem}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} />}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
