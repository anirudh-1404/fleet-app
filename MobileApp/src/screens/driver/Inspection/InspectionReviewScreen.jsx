import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ROUTES from "@constants/routes";

// Import custom reusable components
import SummaryCard from "@components/fleet/SummaryCard";
import ReviewSection from "@components/fleet/ReviewSection";
import ReviewItem from "@components/fleet/ReviewItem";
import { INSPECTION_DATA } from "@data/inspection";
import { useInspection } from "../../../context/InspectionContext";
import { useAuth } from "../../../context/AuthContext";
import { vehicleService } from "../../../services/vehicleService";

export default function InspectionReviewScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Shared context state
  const { answers, notes, selectedVehicle, odometer, submitInspectionToBackend } = useInspection();

  const [expandedSection, setExpandedSection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [assignedVehicle, setAssignedVehicle] = useState(null);

  useEffect(() => {
    if (selectedVehicle) {
      setAssignedVehicle(selectedVehicle);
    } else {
      fetchAssignedVehicle();
    }
  }, [selectedVehicle]);

  const fetchAssignedVehicle = async () => {
    try {
      const v = await vehicleService.getMyVehicle();
      setAssignedVehicle(v);
    } catch (e) {
      console.error("Error fetching driver vehicle in review:", e);
    }
  };

  const vehicleName = assignedVehicle
    ? `${assignedVehicle.make || ""} ${assignedVehicle.model || assignedVehicle.vehicleType}`.trim()
    : "Assigned Vehicle";
  const registration = assignedVehicle ? assignedVehicle.registration : "--";
  const fleetNumber = assignedVehicle ? assignedVehicle.fleetNumber : "--";
  const driverName = user ? user.name : "Driver";

  // Dynamic Today's Date formatted (e.g. Wednesday, 5 August 2026)
  const formattedDate = useMemo(() => {
    const today = new Date();
    const options = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
    return today.toLocaleDateString("en-AU", options);
  }, []);

  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Calculate totals and counts from context answers and notes
  const { passCount, failCount, naCount, notesCount } = useMemo(() => {
    const safeAnswers = answers || {};
    const safeNotes = notes || {};
    const values = Object.values(safeAnswers);
    const pass = values.filter((v) => v === "PASS").length;
    const fail = values.filter((v) => v === "FAIL").length;
    const na = values.filter((v) => v === "N/A").length;
    const validNotesCount = Object.values(safeNotes).filter((n) => n && typeof n === "string" && n.trim() !== "").length;

    return {
      passCount: pass,
      failCount: fail,
      naCount: na,
      notesCount: validNotesCount
    };
  }, [answers, notes]);

  const toggleSection = (sectionIndex) => {
    setExpandedSection((prev) => (prev === sectionIndex ? -1 : sectionIndex));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const vehicleId = assignedVehicle ? assignedVehicle._id || assignedVehicle.id : null;
      await submitInspectionToBackend(registration, fleetNumber, vehicleId, odometer);
      navigation.navigate(ROUTES.INSPECTION_SUBMITTED);
    } catch (error) {
      const msg =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Failed to submit inspection. Please try again.";
      Alert.alert("Submission Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      {/* 1. Header App Bar */}
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
          <Text className="text-2xl font-bold text-[#111827]">Review Inspection</Text>
          <Text className="text-sm text-[#6B7280] mt-0.5">Review today's inspection before submitting</Text>
        </View>
      </View>

      {/* Main Content Scroll View */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
        }}
      >
        {/* 2. SECTION 1: Vehicle Information */}
        <View className="px-6 mb-5">
          <View
            className="bg-white border border-[#E8EDF3] rounded-[24px] p-5"
            style={{
              shadowColor: "#111827",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.015,
              shadowRadius: 10,
              elevation: 1,
            }}
          >
            <View className="flex-row justify-between mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Vehicle</Text>
                <Text className="text-sm font-semibold text-[#111827] mt-1">{vehicleName}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Registration</Text>
                <Text className="text-sm font-semibold text-[#111827] mt-1">{registration}</Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Fleet Number</Text>
                <Text className="text-sm font-semibold text-[#111827] mt-1">{fleetNumber}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Trailer</Text>
                <Text className="text-sm font-semibold text-[#111827] mt-1">TR-11</Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Driver</Text>
                <Text className="text-sm font-semibold text-[#111827] mt-1">{driverName}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Inspection Date</Text>
                <Text className="text-sm font-semibold text-[#111827] mt-1">{formattedDate}</Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <View className="flex-1 mr-2">
                <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Inspection Time</Text>
                <Text className="text-sm font-semibold text-[#111827] mt-1">{formattedTime}</Text>
              </View>
              <View className="flex-1" />
            </View>
          </View>
        </View>

        {/* 3. SECTION 2: Inspection Summary Card */}
        <View className="px-6 mb-5">
          <SummaryCard
            passCount={passCount}
            failCount={failCount}
            naCount={naCount}
            notesCount={notesCount}
          />
        </View>

        {/* 4. SECTION 3: Inspection Review Accordions */}
        <View className="px-6">
          {INSPECTION_DATA.map((section, sIdx) => {
            return (
              <ReviewSection
                key={section.id}
                title={section.title}
                isExpanded={expandedSection === sIdx}
                onToggle={() => toggleSection(sIdx)}
              >
                {section.items.map((item, iIdx) => {
                  const key = `${sIdx}_${iIdx}`;
                  const value = (answers && answers[key]) || "PASS";
                  const note = notes && notes[key];
                  return (
                    <ReviewItem
                      key={key}
                      title={item}
                      value={value}
                      note={note}
                    />
                  );
                })}
              </ReviewSection>
            );
          })}
        </View>
      </ScrollView>

      {/* 5. BOTTOM ACTIONS */}
      <View
        className="bg-white border-t border-[#E8EDF3] px-6 pt-4 flex-row gap-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        {/* Back to Inspection Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={isLoading}
          onPress={() => navigation.goBack()}
          className="flex-1 h-12 border border-[#E8EDF3] bg-white rounded-[24px] items-center justify-center"
        >
          <Text className="text-[#6B7280] text-sm font-semibold">Back to Inspection</Text>
        </TouchableOpacity>

        {/* Submit Inspection Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={isLoading}
          onPress={handleSubmit}
          className="flex-1 h-12 bg-[#2563EB] rounded-[24px] items-center justify-center"
          style={{
            shadowColor: "#2563EB",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white text-sm font-semibold">Submit Inspection</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
