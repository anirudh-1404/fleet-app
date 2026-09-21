import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { workshopEmployeeService } from "../../../services/workshopEmployeeService";

const CHECKLIST_TEMPLATES = {
  LUBE_SERVICE: [
    { title: "Engine Oil & Filter Change", category: "Engine", measurementUnit: "Liters" },
    { title: "Transmission Fluid Level & Condition", category: "Transmission", measurementUnit: "" },
    { title: "Brake Fluid Level & Moisture Content", category: "Brakes", measurementUnit: "% moisture" },
    { title: "Power Steering Fluid Level", category: "Steering", measurementUnit: "" },
    { title: "Engine Coolant Level & Freeze Protection", category: "Cooling", measurementUnit: "°C" },
    { title: "Engine Air Filter & Cabin Filter", category: "Filters", measurementUnit: "" },
    { title: "Chassis & Suspension Grease Points", category: "Chassis", measurementUnit: "" },
    { title: "Tire Pressures & Tread Depths", category: "Tires", measurementUnit: "PSI / mm" },
    { title: "Battery Health & Terminal Voltage", category: "Electrical", measurementUnit: "Volts" },
    { title: "Underbody Visual Inspection for Leaks", category: "Underbody", measurementUnit: "" },
  ],
  BASIC_INSPECTION: [
    { title: "Headlights, Tail Lights & Indicators", category: "Lighting", measurementUnit: "" },
    { title: "Horn, Wipers & Washer Jets", category: "Visibility", measurementUnit: "" },
    { title: "Windscreen & Mirrors Condition", category: "Visibility", measurementUnit: "" },
    { title: "Front & Rear Brake Pads / Discs", category: "Brakes", measurementUnit: "mm remaining" },
    { title: "Suspension Components & Bushings", category: "Suspension", measurementUnit: "" },
    { title: "Steering Linkages & Ball Joints", category: "Steering", measurementUnit: "" },
    { title: "Exhaust System & Mounts", category: "Exhaust", measurementUnit: "" },
    { title: "Seatbelts & Airbag Warning Lights", category: "Safety", measurementUnit: "" },
    { title: "Parking Brake Operation & Holding", category: "Brakes", measurementUnit: "clicks" },
    { title: "Road Test & Brake Performance", category: "Road Test", measurementUnit: "" },
  ],
  ANNUAL_INSPECTION: [
    { title: "OBD Diagnostic System Health Scan", category: "Diagnostics", measurementUnit: "DTC Count" },
    { title: "Engine Compression & Fuel System Check", category: "Engine", measurementUnit: "PSI" },
    { title: "Transmission & Drivetrain Operations", category: "Transmission", measurementUnit: "" },
    { title: "Brake Lines, Flexible Hoses & Calipers", category: "Brakes", measurementUnit: "" },
    { title: "Wheel Bearings, Hubs & Axle Seals", category: "Drivetrain", measurementUnit: "" },
    { title: "Cooling System Pressure Leak Test", category: "Cooling", measurementUnit: "Bar" },
    { title: "Drive Belts, Pulleys & Tensioners", category: "Engine", measurementUnit: "" },
    { title: "Emissions & Exhaust Leak Check", category: "Exhaust", measurementUnit: "" },
    { title: "Chassis Frame, Subframe & Rust Check", category: "Structure", measurementUnit: "" },
    { title: "Steering Geometry & Alignment Check", category: "Steering", measurementUnit: "deg" },
    { title: "Full Vehicle Road Test", category: "Road Test", measurementUnit: "" },
  ],
};

export default function DigitalChecklistScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id, existingChecklist } = route.params;

  const [selectedType, setSelectedType] = useState("LUBE_SERVICE");
  const [items, setItems] = useState([]);
  const [customItemTitle, setCustomItemTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Initialize checklist
  useEffect(() => {
    if (existingChecklist && existingChecklist.items && existingChecklist.items.length > 0) {
      setSelectedType(existingChecklist.checklistType || "LUBE_SERVICE");
      setItems(
        existingChecklist.items.map((i) => ({
          title: i.title,
          category: i.category || "General",
          status: i.status || "PASS",
          notes: i.notes || "",
          measurement: i.measurement || "",
        }))
      );
    } else {
      loadTemplate("LUBE_SERVICE");
    }
  }, [existingChecklist]);

  const loadTemplate = (templateKey) => {
    setSelectedType(templateKey);
    const template = CHECKLIST_TEMPLATES[templateKey] || [];
    setItems(
      template.map((tmpl) => ({
        title: tmpl.title,
        category: tmpl.category,
        status: "PASS",
        notes: "",
        measurement: "",
      }))
    );
  };

  const setItemStatus = (index, status) => {
    const updated = [...items];
    updated[index].status = status;
    setItems(updated);
  };

  const setItemMeasurement = (index, val) => {
    const updated = [...items];
    updated[index].measurement = val;
    setItems(updated);
  };

  const setItemNotes = (index, val) => {
    const updated = [...items];
    updated[index].notes = val;
    setItems(updated);
  };

  const handleAddCustomItem = () => {
    if (!customItemTitle.trim()) return;
    setItems([
      ...items,
      {
        title: customItemTitle.trim(),
        category: "Custom",
        status: "PASS",
        notes: "",
        measurement: "",
      },
    ]);
    setCustomItemTitle("");
  };

  const handleSave = async (isCompleted = false) => {
    if (items.length === 0) {
      Alert.alert("Empty Checklist", "Please add or load items into the checklist.");
      return;
    }

    setSubmitting(true);
    try {
      await workshopEmployeeService.submitChecklist(id, {
        checklistType: selectedType,
        items,
        isCompleted,
      });

      Alert.alert(
        "Saved",
        isCompleted
          ? "Checklist has been completed and verified!"
          : "Checklist progress saved as draft.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error("Checklist submit error:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to save checklist");
    } finally {
      setSubmitting(false);
    }
  };

  const passedCount = items.filter((i) => i.status === "PASS").length;
  const failedCount = items.filter((i) => i.status === "FAIL").length;
  const naCount = items.filter((i) => i.status === "NA").length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E2E8F0",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: "#F1F5F9",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 17, fontWeight: "800", color: "#0F172A" }}>
            Digital Checklist
          </Text>
          <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "500" }}>
            Vehicle Inspection & Service
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Template Selectors */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 8 }}>
          Select Checklist Type:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {[
            { key: "LUBE_SERVICE", label: "Lube Service" },
            { key: "BASIC_INSPECTION", label: "Basic Inspection" },
            { key: "ANNUAL_INSPECTION", label: "Annual Inspection" },
          ].map((tmpl) => {
            const isSelected = selectedType === tmpl.key;
            return (
              <TouchableOpacity
                key={tmpl.key}
                onPress={() => {
                  if (items.length > 0) {
                    Alert.alert(
                      "Switch Checklist?",
                      "Switching templates will reload the default items for this type.",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Load", onPress: () => loadTemplate(tmpl.key) },
                      ]
                    );
                  } else {
                    loadTemplate(tmpl.key);
                  }
                }}
                style={{
                  backgroundColor: isSelected ? "#2563EB" : "#FFFFFF",
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                  borderRadius: 10,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: isSelected ? "#2563EB" : "#E2E8F0",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: isSelected ? "#FFFFFF" : "#334155",
                  }}
                >
                  {tmpl.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Summary Counter */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            justifyContent: "space-around",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#10B981" }}>{passedCount}</Text>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B" }}>PASSED</Text>
          </View>
          <View style={{ width: 1, height: "100%", backgroundColor: "#E2E8F0" }} />
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#EF4444" }}>{failedCount}</Text>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B" }}>FAILED</Text>
          </View>
          <View style={{ width: 1, height: "100%", backgroundColor: "#E2E8F0" }} />
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#64748B" }}>{naCount}</Text>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B" }}>N/A</Text>
          </View>
        </View>

        {/* Checklist Items List */}
        {items.map((item, idx) => (
          <View
            key={idx}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              padding: 14,
              marginBottom: 12,
              borderWidth: 1,
              borderColor:
                item.status === "FAIL" ? "#FCA5A5" : item.status === "PASS" ? "#BBF7D0" : "#E2E8F0",
            }}
          >
            {/* Title & Category */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}>
                  {idx + 1}. {item.title}
                </Text>
                {item.category && (
                  <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600", marginTop: 2 }}>
                    Category: {item.category}
                  </Text>
                )}
              </View>

              {/* Status Pill Toggle */}
              <View style={{ flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 8, padding: 2 }}>
                {[
                  { key: "PASS", label: "Pass", color: "#10B981" },
                  { key: "FAIL", label: "Fail", color: "#EF4444" },
                  { key: "NA", label: "N/A", color: "#64748B" },
                ].map((st) => {
                  const isActive = item.status === st.key;
                  return (
                    <TouchableOpacity
                      key={st.key}
                      onPress={() => setItemStatus(idx, st.key)}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor: isActive ? st.color : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: isActive ? "#FFFFFF" : "#64748B",
                        }}
                      >
                        {st.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Measurement Input */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Ionicons name="speedometer-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                  fontSize: 12,
                  color: "#0F172A",
                }}
                placeholder="Reading / Measurement (e.g. 5.2 mm, 12.8V)"
                placeholderTextColor="#94A3B8"
                value={item.measurement}
                onChangeText={(val) => setItemMeasurement(idx, val)}
              />
            </View>

            {/* Notes / Observation input */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="create-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                  fontSize: 12,
                  color: "#0F172A",
                }}
                placeholder="Observation or defect remarks..."
                placeholderTextColor="#94A3B8"
                value={item.notes}
                onChangeText={(val) => setItemNotes(idx, val)}
              />
            </View>
          </View>
        ))}

        {/* Add custom item section */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 14,
            padding: 14,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#0F172A", marginBottom: 8 }}>
            Add Custom Check Item
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              style={{
                flex: 1,
                backgroundColor: "#F8FAFC",
                borderWidth: 1,
                borderColor: "#CBD5E1",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                fontSize: 13,
                color: "#0F172A",
              }}
              placeholder="e.g. Inspect Auxiliary Belt tension"
              placeholderTextColor="#94A3B8"
              value={customItemTitle}
              onChangeText={setCustomItemTitle}
            />
            <TouchableOpacity
              onPress={handleAddCustomItem}
              style={{
                backgroundColor: "#2563EB",
                borderRadius: 8,
                paddingHorizontal: 14,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            disabled={submitting}
            onPress={() => handleSave(false)}
            style={{
              flex: 1,
              backgroundColor: "#F1F5F9",
              borderRadius: 10,
              paddingVertical: 14,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#CBD5E1",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#334155" }}>
              Save Draft
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={submitting}
            onPress={() => handleSave(true)}
            style={{
              flex: 2,
              backgroundColor: "#10B981",
              borderRadius: 10,
              paddingVertical: 14,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>
                  Complete Checklist
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
