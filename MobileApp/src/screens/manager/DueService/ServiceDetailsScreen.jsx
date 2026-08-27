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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import InfoCard from "@components/common/InfoCard";
import DetailRow from "@components/common/DetailRow";
import StatusBadge from "@components/fleet/StatusBadge";
import { useFleetData } from "../../../context/FleetDataContext";

export default function ServiceDetailsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { services, updateServiceStatus } = useFleetData();
  const { serviceId } = route.params || {};

  const service = services.find((s) => s.id === serviceId) || services[0];

  const handleMarkCompleted = () => {
    Alert.alert("Mark Service Complete", "Confirm that this scheduled service has been performed.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete Service",
        onPress: () => {
          updateServiceStatus(service.id, "Completed");
          Alert.alert("Service Updated", "The service status has been set to Completed.");
        },
      },
    ]);
  };

  if (!service) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F7FA] justify-center items-center">
        <Text className="text-base text-[#6B7280]">Service record not found.</Text>
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
            <Text className="text-xl font-bold text-[#111827]">Service Details</Text>
            <Text className="text-xs text-[#6B7280] mt-0.5">{service.vehicleName}</Text>
          </View>
        </View>

        <StatusBadge status={service.status} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
        }}
      >
        {/* Vehicle Service Summary */}
        <InfoCard title="Service Schedule" icon="construct-outline">
          <DetailRow label="Vehicle" value={service.vehicleName} />
          <DetailRow label="Registration" value={service.registration} />
          <DetailRow label="Fleet Number" value={service.fleetNumber} />
          <DetailRow label="Last Service Date" value={service.lastService} />
          <DetailRow label="Next Service Due" value={service.nextService} valueColor="text-[#2563EB]" />
          <DetailRow
            label="Days Remaining"
            value={service.daysRemaining <= 0 ? "Overdue" : `${service.daysRemaining} Days`}
            valueColor={service.daysRemaining <= 3 ? "text-[#DC2626]" : "text-[#16A34A]"}
          />
          <DetailRow label="Current Odometer" value={service.odometer} />
        </InfoCard>

        {/* Maintenance Scope */}
        <InfoCard title="Maintenance Details" icon="clipboard-outline">
          <DetailRow label="Service Type" value={service.serviceType} />
          <DetailRow label="Provider / Workshop" value={service.provider} />
          <DetailRow
            label="Health Condition"
            value={service.healthStatus}
            valueColor={service.healthStatus === "Good" ? "text-[#16A34A]" : "text-[#D97706]"}
          />
        </InfoCard>

        {/* Action Tasks */}
        {service.tasks && service.tasks.length > 0 && (
          <InfoCard title="Service Checklist Tasks" icon="checkmark-done-outline">
            {service.tasks.map((task) => (
              <View key={task.id} className="flex-row items-center py-2.5 border-b border-[#F8FAFC]">
                <Ionicons
                  name={task.completed ? "checkmark-circle" : "ellipse-outline"}
                  size={18}
                  color={task.completed ? "#16A34A" : "#94A3B8"}
                  style={{ marginRight: 10 }}
                />
                <Text className={`text-xs font-semibold ${task.completed ? "text-[#111827] line-through" : "text-[#4B5563]"}`}>
                  {task.title}
                </Text>
              </View>
            ))}
          </InfoCard>
        )}

        {/* Notes */}
        <InfoCard title="Service Notes" icon="document-text-outline">
          <Text className="text-xs text-[#4B5563] leading-5">{service.notes || "No service notes."}</Text>
        </InfoCard>
      </ScrollView>

      {service.status !== "Completed" && (
        <View
          className="bg-white border-t border-[#E8EDF3] px-6 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleMarkCompleted}
            className="h-12 bg-[#16A34A] rounded-[24px] items-center justify-center flex-row"
            style={{
              shadowColor: "#16A34A",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="white" />
            <Text className="text-white text-sm font-semibold ml-2">Mark Service Completed</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
