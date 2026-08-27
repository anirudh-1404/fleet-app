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
import { workshopReminderService } from "../../../services/workshopReminderService";
import WorkshopStatusBadge from "../../../components/workshop/WorkshopStatusBadge";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

const STATUS_FILTERS = ["ALL", "PENDING", "COMPLETED"];

export default function WorkshopRemindersScreen() {
  const navigation = useNavigation();

  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchReminders = async () => {
    try {
      setError(null);
      const filters = {};
      if (selectedStatus !== "ALL") filters.status = selectedStatus;
      if (search) filters.search = search;

      const data = await workshopReminderService.getReminders(filters);
      setReminders(data);
    } catch (err) {
      console.error("Error fetching reminders:", err);
      setError(err.response?.data?.message || "Failed to load reminders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReminders();
    }, [selectedStatus, search])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReminders();
  };

  const handleToggleComplete = async (item) => {
    try {
      const newStatus = item.status === "COMPLETED" ? "PENDING" : "COMPLETED";
      await workshopReminderService.updateReminder(item._id, { status: newStatus });
      fetchReminders();
    } catch (err) {
      console.error("Error toggling reminder:", err);
    }
  };

  const renderReminderItem = ({ item }) => {
    const isDone = item.status === "COMPLETED";

    return (
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: "#E2E8F0",
          opacity: isDone ? 0.7 : 1,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <TouchableOpacity
            onPress={() => handleToggleComplete(item)}
            style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 }}
          >
            <Ionicons
              name={isDone ? "checkbox" : "square-outline"}
              size={22}
              color={isDone ? "#16A34A" : "#64748B"}
              style={{ marginRight: 10 }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#0F172A",
                  textDecorationLine: isDone ? "line-through" : "none",
                }}
              >
                {item.title}
              </Text>
              {item.notes ? (
                <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }} numberOfLines={2}>
                  {item.notes}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>

          <WorkshopStatusBadge status={item.status} size="small" />
        </View>

        <View style={{ borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 10, marginTop: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 12, color: "#DC2626", fontWeight: "600" }}>
            Due: {new Date(item.dueDate).toLocaleDateString()}
          </Text>
          {item.repeat && item.repeat !== "None" ? (
            <Text style={{ fontSize: 11, color: "#64748B" }}>
              Repeats: {item.repeat}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

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
            Workshop Reminders
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.ADD_WORKSHOP_REMINDER)}
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
          <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Status Filters */}
      <View style={{ paddingVertical: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {STATUS_FILTERS.map((st) => {
            const isSelected = selectedStatus === st;
            return (
              <TouchableOpacity
                key={st}
                onPress={() => setSelectedStatus(st)}
                style={{
                  backgroundColor: isSelected ? "#7C3AED" : "#FFFFFF",
                  borderWidth: 1,
                  borderColor: isSelected ? "#7C3AED" : "#E2E8F0",
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                  {st}
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
            placeholder="Search reminders..."
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
      ) : error && reminders.length === 0 ? (
        <WorkshopStateView error={error} onRetry={fetchReminders} />
      ) : reminders.length === 0 ? (
        <WorkshopStateView
          empty={true}
          icon="alarm-outline"
          emptyTitle="No Reminders Found"
          emptySubtitle="Set reminders for customer call-backs, supplier parts arrival, or vehicle pickup."
          emptyActionLabel="Add Reminder"
          onEmptyAction={() => navigation.navigate(ROUTES.ADD_WORKSHOP_REMINDER)}
        />
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item._id}
          renderItem={renderReminderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}
