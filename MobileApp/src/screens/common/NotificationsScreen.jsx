import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import FilterChip from "@components/fleet/FilterChip";
import EmptyState from "@components/fleet/EmptyState";
import { useFleetData } from "../../context/FleetDataContext";

const FILTER_OPTIONS = ["All", "Unread", "Urgent", "System"];

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
  } = useFleetData();

  const [activeFilter, setActiveFilter] = useState("All");

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeFilter === "Unread") return !item.isRead;
      if (activeFilter === "Urgent") return item.isUrgent;
      if (activeFilter === "System") return item.category === "System" || item.category === "Journey";
      return true;
    });
  }, [notifications, activeFilter]);

  const handleNotificationPress = (item) => {
    markNotificationAsRead(item.id);
    if (item.targetRoute) {
      navigation.navigate(item.targetRoute, item.targetParams || {});
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Inspection":
        return "checkbox-outline";
      case "Service":
        return "construct-outline";
      case "Journey":
        return "navigate-outline";
      case "Rego":
        return "calendar-outline";
      case "Notes":
        return "document-text-outline";
      default:
        return "notifications-outline";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      {/* Header Bar */}
      <View className="px-6 pt-4 flex-row items-center justify-between mb-5">
        <View className="flex-row items-center flex-1 mr-2">
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
            <View className="flex-row items-center">
              <Text className="text-2xl font-bold text-[#111827]">Notifications</Text>
              {unreadCount > 0 && (
                <View className="ml-2 px-2 py-0.5 rounded-full bg-[#EF4444]">
                  <Text className="text-[10px] font-bold text-white">{unreadCount}</Text>
                </View>
              )}
            </View>
            <Text className="text-sm text-[#6B7280] mt-0.5">Fleet alerts & operational updates</Text>
          </View>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={markAllNotificationsAsRead}
            className="px-3 py-1.5 rounded-full bg-[#EFF6FF]"
          >
            <Text className="text-xs font-semibold text-[#2563EB]">Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View className="mb-5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          {FILTER_OPTIONS.map((opt) => (
            <FilterChip
              key={opt}
              label={opt}
              isActive={activeFilter === opt}
              onPress={() => setActiveFilter(opt)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
          flexGrow: 1,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleNotificationPress(item)}
            className={`border rounded-[24px] p-5 mb-4 relative ${
              item.isRead
                ? "bg-white border-[#E8EDF3]"
                : "bg-[#EFF6FF] border-[#BFDBFE]"
            }`}
            style={{
              shadowColor: "#111827",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.015,
              shadowRadius: 10,
              elevation: 1,
            }}
          >
            {/* Top Row: Icon, Title, Urgent Badge, Time */}
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-row items-center flex-1 mr-2">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                    item.isUrgent
                      ? "bg-[#FEF2F2] border border-[#FEE2E2]"
                      : "bg-white border border-[#E8EDF3]"
                  }`}
                >
                  <Ionicons
                    name={getCategoryIcon(item.category)}
                    size={20}
                    color={item.isUrgent ? "#DC2626" : "#2563EB"}
                  />
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-sm font-bold text-[#111827] mr-2 flex-1" numberOfLines={1}>
                      {item.title}
                    </Text>
                    {!item.isRead && (
                      <View className="w-2 h-2 rounded-full bg-[#EF4444] mr-2" />
                    )}
                  </View>
                  <Text className="text-[11px] text-[#6B7280] mt-0.5">{item.time}</Text>
                </View>
              </View>

              {item.isUrgent && (
                <View className="px-2 py-0.5 rounded-full bg-[#FEF2F2]">
                  <Text className="text-[9px] font-bold text-[#DC2626]">URGENT</Text>
                </View>
              )}
            </View>

            {/* Message Body */}
            <Text className="text-xs text-[#4B5563] leading-5 ml-13">
              {item.message}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Notifications"
            subtitle="You're all caught up! There are no alerts matching your filter."
            icon="notifications-off-outline"
            actionText="Clear Filters"
            onActionPress={() => setActiveFilter("All")}
          />
        }
      />
    </SafeAreaView>
  );
}
