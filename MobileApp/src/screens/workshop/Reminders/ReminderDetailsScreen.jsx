import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopReminderService } from "../../../services/workshopReminderService";
import WorkshopStatusBadge from "../../../components/workshop/WorkshopStatusBadge";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

export default function ReminderDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [reminder, setReminder] = useState(null);

  const fetchReminder = async () => {
    try {
      setError(null);
      const res = await workshopReminderService.getReminderById(id);
      setReminder(res);
    } catch (err) {
      console.error("Error loading reminder:", err);
      setError(err.response?.data?.message || "Failed to load reminder");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReminder();
    }, [id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReminder();
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = reminder?.status === "COMPLETED" ? "PENDING" : "COMPLETED";
      await workshopReminderService.updateReminder(id, { status: newStatus });
      fetchReminder();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to update reminder");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Reminder", "Are you sure you want to delete this reminder?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await workshopReminderService.deleteReminder(id);
            Alert.alert("Deleted", "Reminder deleted successfully");
            navigation.goBack();
          } catch (err) {
            Alert.alert("Error", err.response?.data?.message || "Could not delete reminder");
          }
        },
      },
    ]);
  };

  const vehicle = reminder?.vehicle;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC", paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0 }} edges={["top"]}>
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
            Reminder Details
          </Text>
        </View>

        <TouchableOpacity onPress={handleDelete} style={{ padding: 6, backgroundColor: "#FEE2E2", borderRadius: 8 }}>
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <WorkshopStateView loading={true} />
      ) : error && !reminder ? (
        <WorkshopStateView error={error} onRetry={fetchReminder} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, borderWidth: 1, borderColor: "#E2E8F0" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A", flex: 1, marginRight: 8 }}>
                {reminder?.title}
              </Text>
              <WorkshopStatusBadge status={reminder?.status} />
            </View>

            <View style={{ borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 14, gap: 8 }}>
              <Text style={{ fontSize: 13, color: "#475569" }}>
                Due Date: <Text style={{ fontWeight: "700", color: "#DC2626" }}>{new Date(reminder?.dueDate).toLocaleDateString()}</Text>
              </Text>
              <Text style={{ fontSize: 13, color: "#475569" }}>
                Repeat: <Text style={{ fontWeight: "600", color: "#0F172A" }}>{reminder?.repeat || "None"}</Text>
              </Text>
              {vehicle?.registration ? (
                <Text style={{ fontSize: 13, color: "#475569" }}>
                  Vehicle: <Text style={{ fontWeight: "600", color: "#2563EB" }}>{vehicle.make} {vehicle.model} ({vehicle.registration})</Text>
                </Text>
              ) : null}
            </View>

            {reminder?.notes ? (
              <View style={{ backgroundColor: "#F8FAFC", borderRadius: 8, padding: 12, marginTop: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 2 }}>NOTES</Text>
                <Text style={{ fontSize: 13, color: "#334155" }}>{reminder.notes}</Text>
              </View>
            ) : null}

            {/* Toggle Button */}
            <TouchableOpacity
              onPress={handleToggleStatus}
              style={{
                marginTop: 16,
                backgroundColor: reminder?.status === "COMPLETED" ? "#64748B" : "#16A34A",
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>
                {reminder?.status === "COMPLETED" ? "Mark as Pending" : "Mark as Completed"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
