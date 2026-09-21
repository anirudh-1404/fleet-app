import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopEmployeeService } from "../../../services/workshopEmployeeService";
import WorkshopStatusBadge from "../../../components/workshop/WorkshopStatusBadge";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

export default function EmployeeDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    try {
      setError(null);
      const data = await workshopEmployeeService.getEmployeeById(id);
      setEmployee(data);
    } catch (err) {
      console.error("Error loading employee details:", err);
      setError(err.response?.data?.message || "Failed to load employee details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDetails();
  };

  const handleToggleStatus = async () => {
    const nextStatus = employee.status === "Active" ? "Inactive" : "Active";
    try {
      setUpdatingStatus(true);
      await workshopEmployeeService.updateEmployee(id, { status: nextStatus });
      setEmployee({ ...employee, status: nextStatus });
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Employee",
      `Are you sure you want to delete ${employee.name}? Their active work orders will be unassigned.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await workshopEmployeeService.deleteEmployee(id);
              Alert.alert("Deleted", "Employee removed successfully.");
              navigation.goBack();
            } catch (err) {
              Alert.alert("Error", err.response?.data?.message || "Failed to delete employee");
            }
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <WorkshopStateView type="loading" message="Loading employee profile..." />
      </SafeAreaView>
    );
  }

  if (error || !employee) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <WorkshopStateView type="error" message={error || "Employee not found"} onRetry={fetchDetails} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
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
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A" }}>Employee Profile</Text>
        </View>

        <TouchableOpacity onPress={handleDelete} style={{ padding: 6 }}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />}
      >
        {/* Profile Card */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 14,
            padding: 18,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: "#2563EB",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#FFFFFF" }}>
                {employee.name ? employee.name[0].toUpperCase() : "M"}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A" }}>{employee.name}</Text>
              <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "600", marginTop: 2 }}>
                {employee.designation || "Technician"}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={updatingStatus}
              onPress={handleToggleStatus}
              style={{
                backgroundColor: employee.status === "Active" ? "#DCFCE7" : "#F1F5F9",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
              }}
            >
              {updatingStatus ? (
                <ActivityIndicator size="small" color="#15803D" />
              ) : (
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: employee.status === "Active" ? "#15803D" : "#64748B",
                  }}
                >
                  {employee.status} (Tap to Toggle)
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Contact Details */}
          <View style={{ borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Ionicons name="mail-outline" size={16} color="#64748B" style={{ width: 24 }} />
              <Text style={{ fontSize: 14, color: "#334155" }}>{employee.email}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Ionicons name="call-outline" size={16} color="#64748B" style={{ width: 24 }} />
              <Text style={{ fontSize: 14, color: "#334155" }}>{employee.phone || "No phone provided"}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#64748B" style={{ width: 24 }} />
              <Text style={{ fontSize: 14, color: "#334155" }}>Role: Workshop Employee (Mechanic)</Text>
            </View>
          </View>

          {/* Specializations */}
          {employee.specialization && employee.specialization.length > 0 ? (
            <View style={{ borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 12, marginTop: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 6 }}>
                SPECIALIZATIONS
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {employee.specialization.map((s) => (
                  <View
                    key={s}
                    style={{
                      backgroundColor: "#EFF6FF",
                      borderRadius: 12,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      marginRight: 6,
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "600", color: "#2563EB" }}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        {/* Assigned Jobs Heading */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
            Assigned Work Orders ({employee.assignedJobs?.length || 0})
          </Text>
        </View>

        {/* Assigned Jobs List */}
        {!employee.assignedJobs || employee.assignedJobs.length === 0 ? (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 24,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
          >
            <Ionicons name="construct-outline" size={36} color="#94A3B8" style={{ marginBottom: 8 }} />
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#475569" }}>No Active Jobs Assigned</Text>
            <Text style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", marginTop: 4 }}>
              When you assign work orders to this mechanic, they will appear here.
            </Text>
          </View>
        ) : (
          employee.assignedJobs.map((job) => (
            <TouchableOpacity
              key={job._id}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(ROUTES.WORKSHOP_WORKORDER_DETAILS, { id: job._id })}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: "#E2E8F0",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A" }}>{job.jobNumber}</Text>
                <WorkshopStatusBadge status={job.status} />
              </View>
              <Text style={{ fontSize: 13, color: "#334155", fontWeight: "600", marginBottom: 4 }}>
                {job.vehicle ? `${job.vehicle.make} ${job.vehicle.model} (${job.vehicle.registration})` : "Vehicle N/A"}
              </Text>
              <Text style={{ fontSize: 12, color: "#64748B" }}>
                Job Type: <Text style={{ fontWeight: "600" }}>{job.jobType}</Text> • Priority: <Text style={{ fontWeight: "600" }}>{job.priority}</Text>
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
