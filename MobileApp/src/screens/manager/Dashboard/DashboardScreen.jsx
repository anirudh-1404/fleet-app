import React from "react";
import {
  View,
  Text,
  ScrollView,
  Platform,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ROUTES from "@constants/routes";

// Import custom components
import NotificationButton from "@components/fleet/NotificationButton";
import SearchBar from "@components/fleet/SearchBar";
import SectionHeader from "@components/fleet/SectionHeader";
import FleetActionCard from "@components/fleet/FleetActionCard";
import FleetSummaryCard from "@components/fleet/FleetSummaryCard";
import RecentActivityCard from "@components/fleet/RecentActivityCard";
import TodaysOperationsCard from "@components/fleet/TodaysOperationsCard";
import { useFleetData } from "../../../context/FleetDataContext";

import { useAuth } from "../../../context/AuthContext";

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { driverActivities, notifications } = useFleetData();
  const { user, logout } = useAuth();

  const unreadNotifCount = React.useMemo(() => {
    return (notifications || []).filter((n) => !n.isRead).length;
  }, [notifications]);

  const todayStr = React.useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const todayActivities = React.useMemo(() => {
    return (driverActivities || []).filter((a) => a.date === todayStr || driverActivities.length > 0);
  }, [driverActivities, todayStr]);

  const totalDrivers = todayActivities.length;
  const inspectionsCompleted = todayActivities.filter((a) => a.inspectionStatus === "Completed").length;
  const inspectionsPending = todayActivities.filter((a) => a.inspectionStatus === "Pending").length;
  const failedInspections = todayActivities.filter((a) => a.inspectionStatus === "Failed").length;
  const journeysStarted = todayActivities.filter((a) => a.journeyStatus === "Started").length;
  const journeysNotStarted = todayActivities.filter((a) => a.journeyStatus === "Not Started").length;

  const handleAction = (routeName) => {
    if (routeName) {
      navigation.navigate(routeName);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: ROUTES.LOGIN }]
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
        }}
      >
        {/* ========================= */}
        {/* 1. Header Section */}
        {/* ========================= */}
        <View className="px-6 pt-4 flex-row justify-between items-start">
          <View>
            <Text className="text-sm font-semibold text-[#6B7280]">Good Morning,</Text>
            <Text className="text-2xl font-bold text-[#111827] mt-0.5">Michael Johnson</Text>
            <Text className="text-[15px] font-normal text-[#6B7280] mt-1">Fleet Overview</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <NotificationButton
              hasUnread={unreadNotifCount > 0}
              onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLogout}
              className="w-10 h-10 rounded-full bg-white border border-[#E8EDF3] items-center justify-center"
              style={{
                shadowColor: "#111827",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.015,
                shadowRadius: 10,
                elevation: 1,
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================= */}
        {/* 2. Search Bar Section */}
        {/* ========================= */}
        <View className="px-6 mt-6">
          <SearchBar />
        </View>

        {/* ========================= */}
        {/* Today's Operations Section */}
        {/* ========================= */}
        <View className="px-6 mt-6">
          <TodaysOperationsCard
            totalDrivers={totalDrivers}
            inspectionsCompleted={inspectionsCompleted}
            inspectionsPending={inspectionsPending}
            failedInspections={failedInspections}
            journeysStarted={journeysStarted}
            journeysNotStarted={journeysNotStarted}
            onPress={() => handleAction(ROUTES.TODAYS_OPERATIONS)}
          />
        </View>

        {/* ========================= */}
        {/* 3. Operational Grid */}
        {/* ========================= */}
        <View className="px-6 mt-6">
          <SectionHeader title="Quick Actions" />
          
          {/* Featured Card - Fleet List */}
          <FleetActionCard
            title="Fleet List"
            subtitle="Manage all vehicles"
            icon="car-sport-outline"
            isFeatured={true}
            onPress={() => handleAction(ROUTES.FLEET_LIST)}
          />
          
          <View className="flex-col gap-4 mt-4">
            {/* Row 1: Driver List & Pre Checks */}
            <View className="flex-row gap-4">
              <FleetActionCard
                title="Driver List"
                subtitle="Manage drivers"
                icon="people-outline"
                onPress={() => handleAction(ROUTES.DRIVER_LIST)}
              />
              <FleetActionCard
                title="Driver Inspections"
                subtitle="Review daily inspection reports"
                icon="checkbox-outline"
                onPress={() => handleAction(ROUTES.DRIVER_INSPECTIONS)}
              />
            </View>

            {/* Row 2: Due Service & Invoices */}
            <View className="flex-row gap-4">
              <FleetActionCard
                title="Due Service"
                subtitle="Track maintenance"
                icon="construct-outline"
                onPress={() => handleAction(ROUTES.DUE_SERVICE)}
              />
              <FleetActionCard
                title="Invoices"
                subtitle="Billing & receipts"
                icon="receipt-outline"
                onPress={() => handleAction(ROUTES.INVOICES)}
              />
            </View>

            {/* Row 3: Fuel Data & Contacts */}
            <View className="flex-row gap-4">
              <FleetActionCard
                title="Fuel Data"
                subtitle="Fuel logs & entries"
                icon="flash-outline"
                onPress={() => handleAction(ROUTES.FUEL_DATA)}
              />
              <FleetActionCard
                title="Contacts"
                subtitle="Directory"
                icon="call-outline"
                onPress={() => handleAction(ROUTES.CONTACTS)}
              />
            </View>

            {/* Row 4: Notes & Reminders */}
            <View className="flex-row gap-4">
              <FleetActionCard
                title="Notes"
                subtitle="Schedules & notes"
                icon="document-text-outline"
                onPress={() => handleAction(ROUTES.NOTES)}
              />
              <FleetActionCard
                title="Reminders"
                subtitle="Alert notifications"
                icon="notifications-outline"
                onPress={() => handleAction(ROUTES.REMINDERS)}
              />
            </View>
          </View>
        </View>

        {/* ========================= */}
        {/* 4. Fleet Summary Section */}
        {/* ========================= */}
        <View className="mt-6">
          <SectionHeader title="Fleet Summary" className="px-6" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            <FleetSummaryCard label="Total Vehicles" value="42" icon="car-sport-outline" />
            <FleetSummaryCard label="Active Drivers" value="38" icon="people-outline" />
            <FleetSummaryCard label="Due Services" value="3" icon="construct-outline" />
            <FleetSummaryCard label="Upcoming Rego" value="5" icon="calendar-outline" />
          </ScrollView>
        </View>

        {/* ========================= */}
        {/* 5. Recent Activity Section */}
        {/* ========================= */}
        <View className="px-6 mt-6">
          <SectionHeader title="Recent Activity" />
          <View className="bg-white border border-[#E8EDF3] rounded-[24px] px-5">
            <RecentActivityCard
              title="Truck #24 serviced"
              subtitle="Completed • 2 hours ago"
              icon="construct-outline"
            />
            <RecentActivityCard
              title="Fuel entry added"
              subtitle="Completed • Today"
              icon="flash-outline"
            />
            <RecentActivityCard
              title="Driver assigned"
              subtitle="Completed • Yesterday"
              icon="people-outline"
            />
            <RecentActivityCard
              title="Inspection scheduled"
              subtitle="Tomorrow"
              icon="calendar-outline"
              isLast={true}
              statusColorClass="text-[#0284C7]"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
