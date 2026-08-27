import React, { useState, useMemo, useEffect } from "react";
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
import { useNavigation } from "@react-navigation/native";
import ROUTES from "@constants/routes";

// Import custom reusable components
import InspectionVehicleCard from "@components/fleet/InspectionVehicleCard";
import InspectionProgress from "@components/fleet/InspectionProgress";
import InspectionSection from "@components/fleet/InspectionSection";
import InspectionItem from "@components/fleet/InspectionItem";

// Import checklist structure from data layer
import { INSPECTION_DATA } from "@data/inspection";
import { useInspection } from "../../../context/InspectionContext";
import { useAuth } from "../../../context/AuthContext";
import { vehicleService } from "../../../services/vehicleService";

export default function DriverPreCheckScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Use shared context state
  const {
    answers,
    setAnswers,
    notes,
    setNotes,
    odometer,
    setOdometer,
    selectedVehicle,
    setSelectedVehicle
  } = useInspection();

  const [expandedSection, setExpandedSection] = useState(0);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [registrationInput, setRegistrationInput] = useState("ABC-123");

  useEffect(() => {
    fetchFleetVehicles();
  }, []);

  const fetchFleetVehicles = async () => {
    try {
      const data = await vehicleService.getVehicles();
      if (Array.isArray(data) && data.length > 0) {
        setVehicles(data);
        // Pre-select driver's assigned vehicle if available, or first unassigned vehicle
        const assignedToMe = data.find(
          (v) =>
            v.assignedDriver &&
            (typeof v.assignedDriver === "object"
              ? v.assignedDriver._id === user?.id || v.assignedDriver._id === user?._id
              : v.assignedDriver === user?.id || v.assignedDriver === user?._id)
        );

        const initial = assignedToMe || data[0];
        if (initial) {
          setSelectedVehicleId(initial._id || initial.id);
          setRegistrationInput(initial.registration);
          setSelectedVehicle(initial);
        }
      }
    } catch (e) {
      console.warn("Could not fetch fleet vehicles for inspection:", e.message);
    }
  };

  const handleSelectVehicleFromDropdown = (val) => {
    setSelectedVehicleId(val);
    const target = vehicles.find((v) => (v._id || v.id) === val);
    if (target) {
      setRegistrationInput(target.registration);
      setSelectedVehicle(target);
    }
  };

  const handleRegistrationInputChange = (text) => {
    const formatted = text.toUpperCase().trim();
    setRegistrationInput(formatted);
    const target = vehicles.find(
      (v) => v.registration.toUpperCase() === formatted || (v.fleetNumber && v.fleetNumber.toUpperCase() === formatted)
    );
    if (target) {
      setSelectedVehicleId(target._id || target.id);
      setSelectedVehicle(target);
    } else {
      setSelectedVehicleId("");
      setSelectedVehicle(null);
    }
  };

  // Real-time Vehicle Validation Logic
  const activeVehicle = useMemo(() => {
    if (selectedVehicleId) {
      return vehicles.find((v) => (v._id || v.id) === selectedVehicleId) || null;
    }
    return (
      vehicles.find((v) => v.registration.toUpperCase() === registrationInput.toUpperCase().trim()) || null
    );
  }, [selectedVehicleId, registrationInput, vehicles]);

  const { validationStatus, assignedDriverName } = useMemo(() => {
    if (!registrationInput.trim()) {
      return { validationStatus: "INVALID", assignedDriverName: "" };
    }

    if (!activeVehicle) {
      return { validationStatus: "INVALID", assignedDriverName: "" };
    }

    const assignedDriverObj = activeVehicle.assignedDriver;
    if (assignedDriverObj) {
      const driverId = typeof assignedDriverObj === "object" ? assignedDriverObj._id : assignedDriverObj;
      const driverName = typeof assignedDriverObj === "object" ? assignedDriverObj.name : "another driver";
      const myId = user?.id || user?._id;

      if (driverId === myId) {
        return { validationStatus: "ASSIGNED_SELF", assignedDriverName: driverName };
      } else {
        return { validationStatus: "ASSIGNED_OTHER", assignedDriverName: driverName };
      }
    }

    return { validationStatus: "VALID", assignedDriverName: "" };
  }, [activeVehicle, registrationInput, user]);

  const isVehicleValidForStart = validationStatus === "VALID" || validationStatus === "ASSIGNED_SELF";

  // Calculate totals
  const totalItems = useMemo(() => {
    return INSPECTION_DATA.reduce((sum, section) => sum + section.items.length, 0);
  }, []);

  const completedCount = useMemo(() => {
    return Object.keys(answers || {}).length;
  }, [answers]);

  const isAllAnswered = completedCount === totalItems;
  const canCompleteInspection = isAllAnswered && isVehicleValidForStart;

  // Helper to check if a specific section is fully completed
  const isSectionCompleted = (sectionIndex, currentAnswers) => {
    const section = INSPECTION_DATA[sectionIndex];
    const safeCurr = currentAnswers || {};
    return section.items.every((_, itemIdx) => {
      const key = `${sectionIndex}_${itemIdx}`;
      return safeCurr[key] !== undefined;
    });
  };

  const handleValueChange = (sectionIndex, itemIndex, value) => {
    const key = `${sectionIndex}_${itemIndex}`;
    const newAnswers = {
      ...answers,
      [key]: value
    };
    setAnswers(newAnswers);

    const currentSectionCompleted = isSectionCompleted(sectionIndex, newAnswers);
    if (currentSectionCompleted && expandedSection === sectionIndex) {
      if (sectionIndex < INSPECTION_DATA.length - 1) {
        setTimeout(() => {
          setExpandedSection(sectionIndex + 1);
        }, 300);
      }
    }
  };

  const handleNoteChange = (sectionIndex, itemIndex, text) => {
    const key = `${sectionIndex}_${itemIndex}`;
    setNotes((prev) => ({
      ...prev,
      [key]: text
    }));
  };

  const toggleSection = (sectionIndex) => {
    setExpandedSection((prev) => (prev === sectionIndex ? -1 : sectionIndex));
  };

  const handleSubmit = () => {
    if (!canCompleteInspection) {
      if (!isVehicleValidForStart) {
        Alert.alert(
          "Invalid Vehicle",
          validationStatus === "INVALID"
            ? "Vehicle with this registration number does not exist in the fleet."
            : `Vehicle is already assigned to ${assignedDriverName}.`
        );
      } else {
        Alert.alert("Incomplete Inspection", "Please complete all inspection checklist items.");
      }
      return;
    }
    navigation.navigate(ROUTES.INSPECTION_REVIEW);
  };

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
          <Text className="text-2xl font-bold text-[#111827]">Driver Pre Check</Text>
          <Text className="text-sm text-[#6B7280] mt-0.5">Complete today's inspection</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
        }}
      >
        {/* ========================= */}
        {/* 2. Vehicle Selection & Info Card */}
        {/* ========================= */}
        <View className="px-6 mb-5">
          <InspectionVehicleCard
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={handleSelectVehicleFromDropdown}
            registrationInput={registrationInput}
            onRegistrationInputChange={handleRegistrationInputChange}
            fleetNumber={activeVehicle ? activeVehicle.fleetNumber : "N/A"}
            trailerNumber="TR-11"
            odometer={odometer}
            onOdometerChange={setOdometer}
            validationStatus={validationStatus}
            assignedDriverName={assignedDriverName}
          />
        </View>

        {/* ========================= */}
        {/* 3. Progress Bar */}
        {/* ========================= */}
        <View className="px-6 mb-6">
          <InspectionProgress completed={completedCount} total={totalItems} />
        </View>

        {/* ========================= */}
        {/* 4. Checklist Accordions */}
        {/* ========================= */}
        <View className="px-6">
          {INSPECTION_DATA.map((section, sIdx) => {
            const isCompleted = isSectionCompleted(sIdx, answers);
            return (
              <InspectionSection
                key={section.id}
                title={section.title}
                isExpanded={expandedSection === sIdx}
                isCompleted={isCompleted}
                onToggle={() => toggleSection(sIdx)}
              >
                {section.items.map((item, iIdx) => {
                  const key = `${sIdx}_${iIdx}`;
                  return (
                    <InspectionItem
                      key={key}
                      title={item}
                      selectedValue={answers[key]}
                      onValueChange={(val) => handleValueChange(sIdx, iIdx, val)}
                      noteValue={notes[key] || ""}
                      onNoteChange={(text) => handleNoteChange(sIdx, iIdx, text)}
                    />
                  );
                })}
              </InspectionSection>
            );
          })}
        </View>
      </ScrollView>

      {/* ========================= */}
      {/* 5. Sticky Bottom Action */}
      {/* ========================= */}
      <View
        className="bg-white border-t border-[#E8EDF3] px-6 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={!canCompleteInspection}
          onPress={handleSubmit}
          className={`h-12 rounded-[24px] items-center justify-center ${
            canCompleteInspection ? "bg-[#2563EB]" : "bg-[#CBD5E1]"
          }`}
          style={{
            shadowColor: canCompleteInspection ? "#2563EB" : "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: canCompleteInspection ? 0.15 : 0,
            shadowRadius: 8,
            elevation: canCompleteInspection ? 3 : 0,
          }}
        >
          <Text className="text-white text-sm font-semibold">Complete Inspection</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
