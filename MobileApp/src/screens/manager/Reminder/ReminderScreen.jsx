import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ROUTES from "@constants/routes";
import SearchBar from "@components/fleet/SearchBar";
import StatusBadge from "@components/fleet/StatusBadge";
import EmptyState from "@components/fleet/EmptyState";
import { useFleetData } from "../../../context/FleetDataContext";

export default function ReminderScreen() {
  const navigation = useNavigation();
  const { reminders } = useFleetData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReminders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return reminders;
    return reminders.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.type && item.type.toLowerCase().includes(q)) ||
        (item.linkedVehicle && item.linkedVehicle.toLowerCase().includes(q))
    );
  }, [reminders, searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 flex-row items-center justify-between mb-5">
        <View className="flex-row items-center flex-1 mr-3">
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
            <Text className="text-2xl font-bold text-[#111827]">Reminders</Text>
            <Text className="text-sm text-[#6B7280] mt-0.5">Track registration & service alerts</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate(ROUTES.ADD_REMINDER)}
          className="h-10 px-4 bg-[#2563EB] rounded-full items-center justify-center flex-row"
          style={{
            shadowColor: "#2563EB",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Ionicons name="add" size={18} color="white" />
          <Text className="text-white text-xs font-semibold ml-1">Add Reminder</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-6 mb-5">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search title, vehicle, or reminder type..."
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredReminders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
          flexGrow: 1,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate(ROUTES.REMINDER_DETAILS, { reminderId: item.id })}
            className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 mb-4 flex-row items-center justify-between"
            style={{
              shadowColor: "#111827",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.015,
              shadowRadius: 10,
              elevation: 1,
            }}
          >
            <View className="flex-row items-center flex-1 mr-4">
              <View className="w-11 h-11 rounded-full bg-[#EEF4FF] items-center justify-center mr-3">
                <Ionicons name="notifications-outline" size={18} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-[#111827]">{item.title}</Text>
                <Text className="text-xs text-[#6B7280] mt-0.5">
                  Due: {item.date} | Type: {item.type || "General"}
                </Text>
              </View>
            </View>
            <StatusBadge status={item.status} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Reminders Found"
            subtitle="There are no active reminders matching your search query."
            icon="notifications-outline"
            actionText="Add New Reminder"
            onActionPress={() => navigation.navigate(ROUTES.ADD_REMINDER)}
          />
        }
      />
    </SafeAreaView>
  );
}
