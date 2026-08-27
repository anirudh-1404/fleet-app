import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ROUTES from "@constants/routes";
import InfoCard from "@components/common/InfoCard";
import DetailRow from "@components/common/DetailRow";
import StatusBadge from "@components/fleet/StatusBadge";
import { useFleetData } from "../../../context/FleetDataContext";

export default function ReminderDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { reminders, deleteReminder } = useFleetData();
  const { reminderId } = route.params || {};

  const reminder = reminders.find((r) => r.id === reminderId) || reminders[0];

  const handleDelete = () => {
    Alert.alert("Delete Reminder", "Are you sure you want to remove this reminder?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteReminder(reminder.id);
          navigation.goBack();
        },
      },
    ]);
  };

  if (!reminder) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F7FA] justify-center items-center">
        <Text className="text-base text-[#6B7280]">Reminder not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      {/* Header */}
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
            <Text className="text-xl font-bold text-[#111827]">{reminder.title}</Text>
            <Text className="text-xs text-[#6B7280] mt-0.5">{reminder.type || "Reminder"} Alert</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate(ROUTES.EDIT_REMINDER, { reminderId: reminder.id })}
          className="w-10 h-10 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] items-center justify-center mr-2"
        >
          <Ionicons name="create-outline" size={18} color="#2563EB" />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleDelete}
          className="w-10 h-10 rounded-full bg-[#FEF2F2] border border-[#FEE2E2] items-center justify-center"
        >
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
        }}
      >
        <InfoCard title="Reminder Summary" icon="notifications-outline">
          <DetailRow label="Title" value={reminder.title} />
          <DetailRow label="Alert Type" value={reminder.type || "Registration"} />
          <DetailRow label="Due Date" value={reminder.date} valueColor="text-[#2563EB]" />
          <DetailRow label="Repeat Interval" value={reminder.repeat || "Never"} />
          <DetailRow label="Linked Vehicle" value={reminder.linkedVehicle || "Volvo FH16 (ABC-123)"} />
          <DetailRow label="Priority Status" badge={<StatusBadge status={reminder.status} />} />
        </InfoCard>

        <InfoCard title="Description & Context" icon="information-circle-outline">
          <Text className="text-xs text-[#374151] leading-5">
            {reminder.description || "Ensure this fleet reminder is addressed prior to the due date."}
          </Text>
        </InfoCard>
      </ScrollView>
    </SafeAreaView>
  );
}
