import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { inspectionService } from "../../../services/inspectionService";
import { DUMMY_INSPECTION_SUBMISSIONS } from "@data/inspection";

export default function HistoryScreen() {
  const navigation = useNavigation();
  const [historyItems, setHistoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await inspectionService.getMyInspections();
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map((item) => ({
          id: item._id,
          vehicleName: item.vehicle ? `${item.vehicle.make || ""} ${item.vehicle.model || ""}` : item.vehicleRegistration || "Vehicle",
          registration: item.vehicleRegistration || (item.vehicle ? item.vehicle.registration : "N/A"),
          status: item.overallStatus === "Failed" ? "FAIL" : "PASS",
          details: `Pass: ${item.passCount || 0} | Fail: ${item.failCount || 0} | Odometer: ${item.odometer || "N/A"} KM`,
          driverName: "You",
          date: item.date || (item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : "Today"),
        }));
        setHistoryItems(formatted);
      } else {
        setHistoryItems(DUMMY_INSPECTION_SUBMISSIONS);
      }
    } catch (e) {
      console.warn("Error fetching driver inspection history, fallback to mock:", e.message);
      setHistoryItems(DUMMY_INSPECTION_SUBMISSIONS);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 flex-row items-center mb-5">
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
          <Text className="text-2xl font-bold text-[#111827]">Inspection History</Text>
          <Text className="text-sm text-[#6B7280] mt-0.5">Logs of all previous pre-checks</Text>
        </View>
      </View>

      {/* List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={historyItems}
          keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
        }}
        renderItem={({ item }) => (
          <View
            className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 mb-4"
            style={{
              shadowColor: "#111827",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.015,
              shadowRadius: 10,
              elevation: 1,
            }}
          >
            <View className="flex-row justify-between items-start mb-3">
              <View>
                <Text className="text-base font-bold text-[#111827]">{item.vehicleName}</Text>
                <Text className="text-xs text-[#6B7280] mt-0.5">Registration: {item.registration}</Text>
              </View>
              <View className={`rounded-full px-3 py-1 ${item.status === "PASS" ? "bg-[#ECFDF5]" : "bg-[#FEF2F2]"}`}>
                <Text className={`text-[10px] font-bold ${item.status === "PASS" ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                  {item.status}
                </Text>
              </View>
            </View>
            <Text className="text-sm text-[#6B7280] mb-3 leading-5">{item.details}</Text>
            <View className="border-t border-[#E8EDF3] pt-3 flex-row justify-between">
              <Text className="text-[10px] text-[#6B7280]">Submitted By: {item.driverName}</Text>
              <Text className="text-[10px] text-[#6B7280]">{item.date}</Text>
            </View>
          </View>
        )}
      />
      )}
    </SafeAreaView>
  );
}
