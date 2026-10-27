import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

// Import reusable components
import StatusBadge from "@components/fleet/StatusBadge";

import { useEffect } from "react";
import { inspectionService } from "../../../services/inspectionService";

// Import mock data fallback
import { getInspectionById as getMockInspectionById } from "@data/managerInspections";

export default function InspectionDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { inspectionId } = route.params || {};

  const [inspection, setInspection] = useState(() => getMockInspectionById(inspectionId || "insp-001"));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (inspectionId) {
      loadInspectionDetails();
    }
  }, [inspectionId]);

  const loadInspectionDetails = async () => {
    setIsLoading(true);
    try {
      const data = await inspectionService.getInspectionById(inspectionId);
      if (data && data._id) {
        setInspection({
          id: data._id,
          driver: {
            name: data.driver ? data.driver.name : "Driver",
            email: data.driver ? data.driver.email : "driver@fleet.com",
            phone: data.driver ? data.driver.phone : "+61 400 000 000",
            photo: data.driver ? data.driver.photo : "",
          },
          vehicle: {
            name: data.vehicle ? `${data.vehicle.make || ""} ${data.vehicle.model || ""}` : data.vehicleRegistration || "Vehicle",
            registration: data.vehicleRegistration || (data.vehicle ? data.vehicle.registration : "N/A"),
            fleetNumber: data.fleetNumber || (data.vehicle ? data.vehicle.fleetNumber : "N/A"),
            type: data.vehicle ? data.vehicle.vehicleType : "Truck",
          },
          trailerNumber: data.trailerNumber || "N/A",
          odometer: data.odometer || "245,860 KM",
          date: data.date || "Today",
          time: data.submittedAt ? new Date(data.submittedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "Today",
          status: data.overallStatus || "Completed",
          summary: {
            pass: data.passCount || 0,
            fail: data.failCount || 0,
            na: data.naCount || 0,
            notes: data.notesCount || 0,
          },
          sections: data.sections && data.sections.length > 0 ? data.sections.map((sec, idx) => ({
            id: `sec_${idx}`,
            title: sec.sectionName,
            items: sec.items ? sec.items.map((it) => ({
              label: it.label,
              status: it.status,
              note: it.note,
            })) : [],
          })) : getMockInspectionById("insp-001").sections,
        });
      }
    } catch (e) {
      console.warn("Error fetching inspection details, using mock fallback:", e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const [expandedSections, setExpandedSections] = useState({
    driver_checks: true,
    walk_around: true,
    under_bonnet: false,
    inside_vehicle: false,
    coupling_trailer: false
  });

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const isPending = inspection.status === "Pending";

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      {/* ========================= */}
      {/* 1. Header App Bar */}
      {/* ========================= */}
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
          <Text className="text-xl font-bold text-[#111827]">Inspection Report</Text>
          <Text className="text-xs text-[#6B7280] mt-0.5">
            Submitted by {inspection.driver.name}
          </Text>
        </View>
        <StatusBadge status={inspection.status} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: Platform.OS === "ios" ? 40 : 24
        }}
      >
        {/* ========================= */}
        {/* 2. Metadata Cards */}
        {/* ========================= */}
        <View className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 mb-5"
          style={{
            shadowColor: "#111827",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.015,
            shadowRadius: 10,
            elevation: 1,
          }}
        >
          <Text className="text-sm font-bold text-[#111827] mb-4">Inspection Info</Text>
          
          <View className="flex-row justify-between items-center py-2 border-b border-[#F8FAFC]">
            <Text className="text-xs font-semibold text-[#6B7280]">Date</Text>
            <Text className="text-xs font-bold text-[#111827]">{inspection.date}</Text>
          </View>
          
          <View className="flex-row justify-between items-center py-2 border-b border-[#F8FAFC]">
            <Text className="text-xs font-semibold text-[#6B7280]">Time</Text>
            <Text className="text-xs font-bold text-[#111827]">{inspection.time}</Text>
          </View>

          <View className="flex-row justify-between items-center py-2">
            <Text className="text-xs font-semibold text-[#6B7280]">Duration</Text>
            <Text className="text-xs font-bold text-[#111827]">{inspection.duration}</Text>
          </View>
        </View>

        {/* Driver Information */}
        <View className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 mb-5"
          style={{
            shadowColor: "#111827",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.015,
            shadowRadius: 10,
            elevation: 1,
          }}
        >
          <Text className="text-sm font-bold text-[#111827] mb-4">Driver Information</Text>
          
          <View className="flex-row justify-between items-center py-2 border-b border-[#F8FAFC]">
            <Text className="text-xs font-semibold text-[#6B7280]">Name</Text>
            <Text className="text-xs font-bold text-[#111827]">{inspection.driver.name}</Text>
          </View>

          <View className="flex-row justify-between items-center py-2 border-b border-[#F8FAFC]">
            <Text className="text-xs font-semibold text-[#6B7280]">Licence</Text>
            <Text className="text-xs font-bold text-[#111827]">{inspection.driver.licence}</Text>
          </View>

          <View className="flex-row justify-between items-center py-2 border-b border-[#F8FAFC]">
            <Text className="text-xs font-semibold text-[#6B7280]">Phone</Text>
            <Text className="text-xs font-semibold text-[#059669]">{inspection.driver.phone}</Text>
          </View>

          <View className="flex-row justify-between items-center py-2">
            <Text className="text-xs font-semibold text-[#6B7280]">Email</Text>
            <Text className="text-xs font-semibold text-[#111827]">{inspection.driver.email}</Text>
          </View>
        </View>

        {/* Vehicle Information */}
        <View className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 mb-5"
          style={{
            shadowColor: "#111827",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.015,
            shadowRadius: 10,
            elevation: 1,
          }}
        >
          <Text className="text-sm font-bold text-[#111827] mb-4">Vehicle Information</Text>
          
          <View className="flex-row justify-between items-center py-2 border-b border-[#F8FAFC]">
            <Text className="text-xs font-semibold text-[#6B7280]">Name</Text>
            <Text className="text-xs font-bold text-[#111827]">{inspection.vehicle.name}</Text>
          </View>

          <View className="flex-row justify-between items-center py-2 border-b border-[#F8FAFC]">
            <Text className="text-xs font-semibold text-[#6B7280]">Registration</Text>
            <Text className="text-xs font-bold text-[#111827]">{inspection.vehicle.registration}</Text>
          </View>

          <View className="flex-row justify-between items-center py-2 border-b border-[#F8FAFC]">
            <Text className="text-xs font-semibold text-[#6B7280]">Fleet Number</Text>
            <Text className="text-xs font-bold text-[#111827]">{inspection.vehicle.fleetNumber}</Text>
          </View>

          <View className="flex-row justify-between items-center py-2">
            <Text className="text-xs font-semibold text-[#6B7280]">Trailer Number</Text>
            <Text className="text-xs font-semibold text-[#111827]">{inspection.vehicle.trailerNumber}</Text>
          </View>
        </View>

        {/* ========================= */}
        {/* 3. Section Content / Accordions */}
        {/* ========================= */}
        {isPending ? (
          <View className="bg-white border border-[#E8EDF3] rounded-[24px] p-6 items-center justify-center my-4"
            style={{
              shadowColor: "#111827",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.015,
              shadowRadius: 10,
              elevation: 1,
            }}
          >
            <View className="w-16 h-16 rounded-full bg-[#FFFBEB] items-center justify-center mb-4">
              <Ionicons name="hourglass-outline" size={32} color="#D97706" />
            </View>
            <Text className="text-base font-bold text-[#111827] text-center">Inspection Pending</Text>
            <Text className="text-sm text-[#6B7280] text-center mt-2 max-w-[280px] leading-5">
              The driver has not submitted the inspection checklist for today yet.
            </Text>
          </View>
        ) : (
          <View className="mt-2">
            <Text className="text-sm font-bold text-[#6B7280] uppercase tracking-wider mb-3">
              Inspection Checklist Items
            </Text>

            {inspection.sections.map((section, sIdx) => {
              const secId = section.id || section._id || `sec_${sIdx}`;
              const isExpanded = expandedSections[secId] ?? true;
              return (
                <View key={secId} className="bg-white border border-[#E8EDF3] rounded-[24px] mb-4 overflow-hidden"
                  style={{
                    shadowColor: "#111827",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.015,
                    shadowRadius: 10,
                    elevation: 1,
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleSection(secId)}
                    className="px-5 py-4 flex-row justify-between items-center bg-[#F8FAFC] border-b border-[#E8EDF3]"
                  >
                    <Text className="text-sm font-bold text-[#111827]">{section.title || section.sectionName}</Text>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                  {isExpanded && (
                    <View className="px-5 pb-2">
                      {section.items.map((item, index) => (
                        <View key={index} className={`py-4 ${index !== section.items.length - 1 ? "border-b border-[#E8EDF3]" : ""}`}>
                          <View className="flex-row justify-between items-start">
                            <Text className="text-sm font-semibold text-[#4B5563] flex-1 mr-4">
                              {item.name || item.label}
                            </Text>
                            <View className={`px-3 py-1 rounded-full ${
                              item.status === "PASS"
                                ? "bg-[#ECFDF5]"
                                : item.status === "FAIL"
                                ? "bg-[#FEF2F2]"
                                : item.status === "NOTE"
                                ? "bg-[#ECFDF5]"
                                : "bg-[#F1F5F9]"
                            }`}>
                              <Text className={`text-[10px] font-bold ${
                                item.status === "PASS"
                                  ? "text-[#16A34A]"
                                  : item.status === "FAIL"
                                  ? "text-[#DC2626]"
                                  : item.status === "NOTE"
                                  ? "text-[#059669]"
                                  : "text-[#6B7280]"
                              }`}>
                                {item.status}
                              </Text>
                            </View>
                          </View>
                          {(item.status === "NOTE" || item.note) && (
                            <View className={`border rounded-[12px] px-4 py-3 mt-2 flex-row items-start ${
                              item.status === "NOTE"
                                ? "bg-[#ECFDF5] border-[#A7F3D0]"
                                : "bg-[#FEF2F2] border-[#FEE2E2]"
                            }`}>
                              <Ionicons
                                name={item.status === "NOTE" ? "document-text-outline" : "warning-outline"}
                                size={14}
                                color={item.status === "NOTE" ? "#059669" : "#DC2626"}
                                style={{ marginRight: 8, marginTop: 2 }}
                              />
                              <Text className={`text-xs font-medium flex-1 ${
                                item.status === "NOTE" ? "text-[#059669]" : "text-[#DC2626]"
                              }`}>
                                Note: {item.note || "No details provided."}
                              </Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ========================= */}
        {/* 4. Bottom Summary Card */}
        {/* ========================= */}
        {!isPending && (
          <View className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 mt-4 mb-8"
            style={{
              shadowColor: "#111827",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.015,
              shadowRadius: 10,
              elevation: 1,
            }}
          >
            <Text className="text-sm font-bold text-[#111827] mb-4">Inspection Result Summary</Text>
            
            <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-[#E8EDF3]">
              <Text className="text-xs font-semibold text-[#6B7280]">Overall Status</Text>
              <StatusBadge status={inspection.status} />
            </View>

            <View className="flex-row gap-3 justify-between">
              <View className="flex-1 bg-[#ECFDF5] border border-[#D1FAE5] rounded-[16px] py-3 items-center">
                <Text className="text-[10px] font-bold text-[#065F46] uppercase">Pass</Text>
                <Text className="text-lg font-bold text-[#047857] mt-1">{inspection.summary.pass}</Text>
              </View>
              <View className="flex-1 bg-[#FEF2F2] border border-[#FEE2E2] rounded-[16px] py-3 items-center">
                <Text className="text-[10px] font-bold text-[#991B1B] uppercase">Fail</Text>
                <Text className="text-lg font-bold text-[#B91C1C] mt-1">{inspection.summary.fail}</Text>
              </View>
              <View className="flex-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-[16px] py-3 items-center">
                <Text className="text-[10px] font-bold text-[#475569] uppercase">N/A</Text>
                <Text className="text-lg font-bold text-[#475569] mt-1">{inspection.summary.na}</Text>
              </View>
              <View className="flex-1 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[16px] py-3 items-center">
                <Text className="text-[10px] font-bold text-[#065F46] uppercase">Notes</Text>
                <Text className="text-lg font-bold text-[#047857] mt-1">{inspection.summary.notes}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
