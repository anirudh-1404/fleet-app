import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import ROUTES from "@constants/routes";

// Import custom components
import GreetingHeader from "@components/fleet/GreetingHeader";
import AssignedVehicleCard from "@components/fleet/AssignedVehicleCard";
import JourneyProgressCard from "@components/fleet/JourneyProgressCard";
import TaskChecklistCard from "@components/fleet/TaskChecklistCard";
import RecentActivityCard from "@components/fleet/RecentActivityCard";
import SupportCard from "@components/fleet/SupportCard";
import SectionHeader from "@components/fleet/SectionHeader";
import ConfirmationModal from "@components/common/ConfirmationModal";
import LogFuelModal from "@components/fleet/LogFuelModal";
import EndJourneyModal from "@components/fleet/EndJourneyModal";

import { useInspection } from "../../../context/InspectionContext";
import { useAuth } from "../../../context/AuthContext";
import { vehicleService } from "../../../services/vehicleService";
import { fuelService } from "../../../services/fuelService";

export default function DriverHomeScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { user, logout } = useAuth();

  const {
    isInspectionCompleted,
    journeyStatus,
    journeyStartTime: startTime,
    todayInspectionRecord,
    todayJourneyRecord,
    startJourneyOnBackend,
    endJourneyOnBackend,
    refreshTodayState,
    isLoading: isInspectionLoading,
  } = useInspection();

  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [isVehicleLoading, setIsVehicleLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [fuelModalVisible, setFuelModalVisible] = useState(false);
  const [endJourneyModalVisible, setEndJourneyModalVisible] = useState(false);
  const [isStartingJourney, setIsStartingJourney] = useState(false);
  const [myFuelLogs, setMyFuelLogs] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // Fetch driver assigned vehicle and fuel logs when screen is focused
  useEffect(() => {
    if (isFocused) {
      fetchAssignedVehicle();
      fetchMyFuelLogs();
      refreshTodayState();
    }
  }, [isFocused]);

  const fetchAssignedVehicle = async () => {
    setIsVehicleLoading(true);
    try {
      const v = await vehicleService.getMyVehicle();
      setAssignedVehicle(v);
    } catch (error) {
      console.error("Error fetching driver vehicle:", error);
    } finally {
      setIsVehicleLoading(false);
    }
  };

  const fetchMyFuelLogs = async () => {
    try {
      const logs = await fuelService.getMyFuelLogs();
      setMyFuelLogs(logs || []);
    } catch (e) {
      console.warn("Could not fetch driver fuel logs:", e.message);
    }
  };

  const isInspectionDone = isInspectionCompleted || !!todayInspectionRecord;
  const isJourneyStarted = journeyStatus === "Started" || (todayJourneyRecord && todayJourneyRecord.status === "started");

  // Formatted date (e.g., Saturday, 9 August 2026)
  const formattedDate = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const driverName = user ? user.name.split(" ")[0] : "Driver";
  const vehicleName = assignedVehicle
    ? `${assignedVehicle.make || ""} ${assignedVehicle.model || assignedVehicle.vehicleType}`.trim()
    : null;
  const registration = assignedVehicle ? assignedVehicle.registration : null;
  const fleetNumber = assignedVehicle ? assignedVehicle.fleetNumber : null;

  const handleStartInspection = () => {
    navigation.navigate(ROUTES.DRIVER_PRECHECK);
  };

  const handleStartJourneyPress = () => {
    if (journeyStatus === "Completed" || todayJourneyRecord?.status === "completed") {
      Alert.alert("Journey Completed", "Today's journey has already been finished.");
      return;
    }
    if (isJourneyStarted) {
      setEndJourneyModalVisible(true);
      return;
    }
    if (!isInspectionDone) {
      Alert.alert(
        "Inspection Required",
        "Complete today's vehicle inspection before starting your journey."
      );
      return;
    }
    setModalVisible(true);
  };

  const handleConfirmJourney = async () => {
    setModalVisible(false);
    setIsStartingJourney(true);
    try {
      await startJourneyOnBackend();
      Alert.alert("Journey Started", "Your journey log is active. Have a safe drive!");
    } catch (error) {
      const msg =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Complete today's vehicle inspection before starting your journey.";
      Alert.alert("Cannot Start Journey", msg);
    } finally {
      setIsStartingJourney(false);
    }
  };

  const handleConfirmEndJourney = async (endOdometer) => {
    try {
      const res = await endJourneyOnBackend(endOdometer);
      await fetchAssignedVehicle();

      const finishTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const distanceText = res.distanceTraveled ? ` • Distance: +${res.distanceTraveled} KM` : "";
      const vehicleText = res.vehicle ? ` (${res.vehicle.registration || ""})` : "";

      const newActivity = {
        id: Date.now().toString(),
        title: `Journey Completed${vehicleText}`,
        subtitle: `Today • ${finishTime}${distanceText}`,
        icon: "flag-outline",
        statusColorClass: "text-[#10B981]",
      };

      setRecentActivities((prev) => [newActivity, ...prev]);

      Alert.alert(
        "Journey Completed",
        `Journey completed successfully! Vehicle unassigned and ready for your next inspection.`
      );
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: ROUTES.LOGIN }],
    });
  };

  const handleNotificationPress = () => {
    navigation.navigate(ROUTES.NOTIFICATIONS);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      {/* 1. Header & Greeting */}
      <GreetingHeader
        name={driverName}
        date={formattedDate}
        onLogout={handleLogout}
        onNotificationPress={handleNotificationPress}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
        }}
      >
        {/* 2. Today's Assigned Vehicle */}
        <View className="px-6 mb-6">
          <SectionHeader title="Today's Assigned Vehicle" />
          {isVehicleLoading ? (
            <View className="bg-white border border-[#E8EDF3] rounded-[24px] p-6 items-center">
              <ActivityIndicator color="#2563EB" />
            </View>
          ) : (
            <AssignedVehicleCard
              name={vehicleName}
              registration={registration}
              fleetNumber={fleetNumber}
              trailerNumber={assignedVehicle ? "TR-11" : null}
              isDriverView={true}
              isUnassigned={!assignedVehicle}
            />
          )}
        </View>

        {/* 3. Today's Journey Status */}
        <View className="px-6 mb-6">
          <SectionHeader title="Today's Journey" />
          <JourneyProgressCard
            inspectionStatus={isInspectionDone ? "Completed" : "Pending"}
            journeyStatus={isJourneyStarted ? "Started" : "Not Started"}
            startTime={startTime || (todayJourneyRecord && todayJourneyRecord.startedAt ? new Date(todayJourneyRecord.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null)}
          />
        </View>

        {/* 4. Today's Tasks */}
        <View className="px-6 mb-6">
          <SectionHeader title="Today's Tasks" />
          <TaskChecklistCard
            isInspectionCompleted={isInspectionDone}
            isJourneyStarted={isJourneyStarted}
          />
        </View>

        {/* 5. Action Buttons & Helpers */}
        <View className="px-6 mb-6 flex-col gap-3">
          {/* Start Inspection / Completed */}
          {isInspectionDone ? (
            <View
              className="h-14 rounded-[24px] bg-[#ECFDF5] border border-[#A7F3D0] items-center justify-center flex-row"
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 1,
              }}
            >
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text className="text-[#065F46] text-base font-bold ml-2">
                Inspection Completed
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleStartInspection}
              className="h-14 rounded-[24px] bg-[#2563EB] items-center justify-center flex-row"
              style={{
                shadowColor: "#2563EB",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <Ionicons name="clipboard-outline" size={20} color="white" />
              <Text className="text-white text-base font-bold ml-2">
                Start Inspection
              </Text>
            </TouchableOpacity>
          )}

          {/* Start / End / Completed Journey */}
          {journeyStatus === "Completed" || todayJourneyRecord?.status === "completed" ? (
            <View
              className="h-14 rounded-[24px] bg-[#ECFDF5] border border-[#A7F3D0] items-center justify-center flex-row"
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 1,
              }}
            >
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text className="text-[#065F46] text-base font-bold ml-2">
                Journey Completed
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={isStartingJourney}
              onPress={handleStartJourneyPress}
              className={`h-14 rounded-[24px] items-center justify-center flex-row ${
                isJourneyStarted
                  ? "bg-[#DC2626]"
                  : isInspectionDone
                  ? "bg-[#16A34A]"
                  : "bg-[#CBD5E1]"
              }`}
              style={{
                shadowColor: isJourneyStarted ? "#DC2626" : isInspectionDone ? "#16A34A" : "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isInspectionDone || isJourneyStarted ? 0.15 : 0,
                shadowRadius: 12,
                elevation: isInspectionDone || isJourneyStarted ? 3 : 0,
              }}
            >
              {isStartingJourney ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons
                    name={isJourneyStarted ? "stop-circle-outline" : "play-outline"}
                    size={20}
                    color="white"
                  />
                  <Text className="text-white text-base font-bold ml-2">
                    {isJourneyStarted ? "End Journey" : "Start Journey"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Log Fuel Entry Action Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFuelModalVisible(true)}
            className="h-14 rounded-[24px] bg-white border border-[#2563EB] items-center justify-center flex-row"
            style={{
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 1,
            }}
          >
            <Ionicons name="water-outline" size={20} color="#2563EB" />
            <Text className="text-[#2563EB] text-base font-bold ml-2">
              Log Fuel Entry
            </Text>
          </TouchableOpacity>

          {/* Helper Captions */}
          {!isInspectionDone && (
            <Text className="text-xs text-[#DC2626] font-medium text-center mt-1">
              Complete today's inspection to enable journey.
            </Text>
          )}
        </View>

        {/* 6. Driver Fuel Logs */}
        {myFuelLogs.length > 0 && (
          <View className="px-6 mb-6">
            <SectionHeader title="Your Fuel Logs" />
            <View className="bg-white border border-[#E8EDF3] rounded-[24px] p-4 flex-col gap-3">
              {myFuelLogs.slice(0, 3).map((item) => (
                <View
                  key={item._id || item.id}
                  className="flex-row justify-between items-center border-b border-[#F1F5F9] pb-3 last:border-b-0 last:pb-0"
                >
                  <View className="flex-row items-center flex-1 mr-2">
                    <View className="w-10 h-10 rounded-full bg-[#EEF4FF] items-center justify-center mr-3">
                      <Ionicons name="water-outline" size={18} color="#2563EB" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-[#111827]">
                        {item.vehicle ? `${item.vehicle.make || ""} ${item.vehicle.model || ""}` : registration}
                      </Text>
                      <Text className="text-xs text-[#6B7280]">
                        {item.date} • {item.time || "12:00 PM"}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-bold text-[#16A34A]">${item.cost}</Text>
                    {item.litres > 0 && <Text className="text-[10px] text-[#6B7280]">{item.litres} Liters</Text>}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 7. Recent Activity Timeline */}
        <View className="px-6 mb-6">
          <SectionHeader title="Recent Activity" />
          <View className="bg-white border border-[#E8EDF3] rounded-[24px] px-5">
            {recentActivities.map((act, idx) => (
              <RecentActivityCard
                key={act.id || idx}
                title={act.title}
                subtitle={act.subtitle}
                icon={act.icon || "flag-outline"}
                statusColorClass={act.statusColorClass || "text-[#10B981]"}
                isLast={idx === recentActivities.length - 1 && !isJourneyStarted && !isInspectionDone}
              />
            ))}
            {isJourneyStarted && (
              <RecentActivityCard
                title="Journey Started"
                subtitle={`Today • ${startTime || "Just now"}`}
                icon="navigate-outline"
                statusColorClass="text-[#0284C7]"
                isLast={!isInspectionDone}
              />
            )}
            {isInspectionDone ? (
              <RecentActivityCard
                title="Inspection Submitted"
                subtitle={`Today • ${todayInspectionRecord ? new Date(todayInspectionRecord.submittedAt || todayInspectionRecord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "08:15 AM"}`}
                icon="checkmark-circle-outline"
                isLast={recentActivities.length === 0}
              />
            ) : (
              !isJourneyStarted && recentActivities.length === 0 && (
                <View className="py-6 items-center justify-center">
                  <Ionicons name="time-outline" size={24} color="#94A3B8" />
                  <Text className="text-xs text-[#94A3B8] font-semibold text-center mt-2">
                    No activity logged yet today.
                  </Text>
                </View>
              )
            )}
          </View>
        </View>

        {/* 8. Support Card */}
        <View className="px-6">
          <SupportCard />
        </View>
      </ScrollView>

      {/* Confirmation dialog Modal */}
      <ConfirmationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmJourney}
        title="Start Journey"
        message="Are you sure you want to begin today's journey?"
        confirmText="Start Journey"
        cancelText="Cancel"
        icon="play"
        iconBgColor="bg-[#EFF6FF]"
        iconColor="#2563EB"
        confirmButtonBg="bg-[#16A34A]"
      />

      {/* Log Fuel Modal */}
      <LogFuelModal
        visible={fuelModalVisible}
        onClose={() => setFuelModalVisible(false)}
        onSuccess={fetchMyFuelLogs}
      />

      {/* End Journey Odometer Modal */}
      <EndJourneyModal
        visible={endJourneyModalVisible}
        onClose={() => setEndJourneyModalVisible(false)}
        onConfirm={handleConfirmEndJourney}
        startOdometer={todayJourneyRecord?.startOdometer || todayInspectionRecord?.odometer || 0}
      />
    </SafeAreaView>
  );
}
