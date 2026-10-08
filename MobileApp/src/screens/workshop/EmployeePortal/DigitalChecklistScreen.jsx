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
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { workshopEmployeeService } from "../../../services/workshopEmployeeService";

const CHECKLIST_CATEGORIES = [
  "Engine",
  "Transmission",
  "Brakes",
  "Steering",
  "Suspension",
  "Electrical",
  "Cooling",
  "Exhaust",
  "Chassis",
  "Visibility",
  "Safety",
  "Custom",
];

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
  CUSTOM: [],
};

export default function DigitalChecklistScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id, existingChecklist } = route.params;

  const [selectedType, setSelectedType] = useState("LUBE_SERVICE");
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // New Item State
  const [showAddSection, setShowAddSection] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Engine");
  const [newItemUnit, setNewItemUnit] = useState("");

  // Edit Item Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("General");
  const [editUnit, setEditUnit] = useState("");

  // Initialize checklist
  useEffect(() => {
    if (existingChecklist && existingChecklist.items && existingChecklist.items.length > 0) {
      setSelectedType(existingChecklist.checklistType || "LUBE_SERVICE");
      setItems(
        existingChecklist.items.map((i) => ({
          title: i.title || i.label || "Check Item",
          label: i.label || i.title || "Check Item",
          category: i.category || "General",
          measurementUnit: i.measurementUnit || "",
          status: i.status || "PASS",
          notes: i.notes || i.observation || "",
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
        label: tmpl.title,
        category: tmpl.category,
        measurementUnit: tmpl.measurementUnit || "",
        status: "PASS",
        notes: "",
        measurement: "",
      }))
    );
  };

  const handleClearAllItems = () => {
    Alert.alert(
      "Clear All Items?",
      "This will remove all current checklist items so you can start completely custom.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            setSelectedType("CUSTOM");
            setItems([]);
          },
        },
      ]
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

  // Add Item
  const handleAddItem = () => {
    if (!newItemTitle.trim()) {
      Alert.alert("Required", "Please enter check item title.");
      return;
    }
    const created = {
      id: `item_${Date.now()}`,
      title: newItemTitle.trim(),
      label: newItemTitle.trim(),
      category: newItemCategory || "Custom",
      measurementUnit: newItemUnit.trim(),
      status: "PASS",
      notes: "",
      measurement: "",
    };
    setItems([...items, created]);
    setNewItemTitle("");
    setNewItemUnit("");
    setShowAddSection(false);
  };

  // Edit Item Handlers
  const handleOpenEdit = (index) => {
    setEditingIndex(index);
    const item = items[index];
    setEditTitle(item.title || item.label || "");
    setEditCategory(item.category || "General");
    setEditUnit(item.measurementUnit || "");
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      Alert.alert("Required", "Item title cannot be blank.");
      return;
    }
    const updated = [...items];
    updated[editingIndex] = {
      ...updated[editingIndex],
      title: editTitle.trim(),
      label: editTitle.trim(),
      category: editCategory || "General",
      measurementUnit: editUnit.trim(),
    };
    setItems(updated);
    setShowEditModal(false);
    setEditingIndex(null);
  };

  // Delete Item Handler
  const handleDeleteItem = (index) => {
    const item = items[index];
    Alert.alert(
      "Delete Checklist Item",
      `Are you sure you want to remove "${item.title || item.label}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updated = items.filter((_, i) => i !== index);
            setItems(updated);
          },
        },
      ]
    );
  };

  const handleSave = async (isCompleted = false) => {
    if (items.length === 0) {
      Alert.alert("Empty Checklist", "Please add at least one item into the checklist.");
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
        "Saved Successfully! ✅",
        isCompleted
          ? "Checklist has been completed and verified for workshop manager & records."
          : "Checklist progress and custom items saved as draft.",
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
  const naCount = items.filter((i) => i.status === "NA" || i.status === "N/A").length;

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
          <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>
            Inspection & Service Checks
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleClearAllItems}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
            backgroundColor: "#FEE2E2",
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#DC2626" }}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Template Selectors */}
        <View style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#475569" }}>
              Select Checklist Type:
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddSection(!showAddSection)}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Ionicons name="add-circle" size={16} color="#2563EB" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#2563EB" }}>
                {showAddSection ? "Close Form" : "+ Add Item"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: "LUBE_SERVICE", label: "Lube Service" },
              { key: "BASIC_INSPECTION", label: "Basic Inspection" },
              { key: "ANNUAL_INSPECTION", label: "Annual Inspection" },
              { key: "CUSTOM", label: "Custom Checklist" },
            ].map((tmpl) => {
              const isSelected = selectedType === tmpl.key;
              return (
                <TouchableOpacity
                  key={tmpl.key}
                  onPress={() => {
                    if (tmpl.key === "CUSTOM") {
                      setSelectedType("CUSTOM");
                    } else if (items.length > 0) {
                      Alert.alert(
                        "Switch Checklist?",
                        "Loading this template will replace current items with default template checks.",
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Load Template", onPress: () => loadTemplate(tmpl.key) },
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
        </View>

        {/* Add New Check Item Expandable Card */}
        {showAddSection && (
          <View
            style={{
              backgroundColor: "#EFF6FF",
              borderRadius: 14,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1.5,
              borderColor: "#BFDBFE",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="add-circle-outline" size={18} color="#2563EB" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#1E40AF" }}>
                  Add New Item to Checklist
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddSection(false)}>
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 4 }}>
              Check Item Title / Description *
            </Text>
            <TextInput
              style={{
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#CBD5E1",
                borderRadius: 8,
                paddingHorizontal: 12,
                height: 42,
                fontSize: 13,
                color: "#0F172A",
                marginBottom: 10,
              }}
              placeholder="e.g. Inspect Fifth Wheel Jaws & Release Handle"
              placeholderTextColor="#94A3B8"
              value={newItemTitle}
              onChangeText={setNewItemTitle}
            />

            {/* Category Chips */}
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {CHECKLIST_CATEGORIES.map((cat) => {
                const isSelected = newItemCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setNewItemCategory(cat)}
                    style={{
                      backgroundColor: isSelected ? "#2563EB" : "#FFFFFF",
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 6,
                      marginRight: 6,
                      borderWidth: 1,
                      borderColor: isSelected ? "#2563EB" : "#CBD5E1",
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Measurement Unit */}
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 4 }}>
              Measurement Unit (Optional)
            </Text>
            <TextInput
              style={{
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#CBD5E1",
                borderRadius: 8,
                paddingHorizontal: 12,
                height: 42,
                fontSize: 13,
                color: "#0F172A",
                marginBottom: 12,
              }}
              placeholder="e.g. mm, Liters, PSI, Volts, Bar, %"
              placeholderTextColor="#94A3B8"
              value={newItemUnit}
              onChangeText={setNewItemUnit}
            />

            <TouchableOpacity
              onPress={handleAddItem}
              style={{
                backgroundColor: "#2563EB",
                borderRadius: 8,
                height: 44,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Ionicons name="checkmark" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>
                Add Item to Checklist
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
          <View style={{ width: 1, height: "100%", backgroundColor: "#E2E8F0" }} />
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#2563EB" }}>{items.length}</Text>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B" }}>TOTAL</Text>
          </View>
        </View>

        {/* Empty State */}
        {items.length === 0 && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              padding: 24,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              marginBottom: 16,
            }}
          >
            <Ionicons name="clipboard-outline" size={44} color="#94A3B8" style={{ marginBottom: 10 }} />
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A", textAlign: "center" }}>
              Checklist is Empty
            </Text>
            <Text style={{ fontSize: 12, color: "#64748B", textAlign: "center", marginTop: 4, marginBottom: 16 }}>
              Add custom check items, or load one of the standard templates above.
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddSection(true)}
              style={{
                backgroundColor: "#2563EB",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#FFFFFF" }}>
                Add First Item
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Checklist Items List */}
        {items.map((item, idx) => {
          const isFail = item.status === "FAIL";
          const isPass = item.status === "PASS";

          return (
            <View
              key={item.id || idx}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 14,
                padding: 14,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isFail ? "#FCA5A5" : isPass ? "#BBF7D0" : "#E2E8F0",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              {/* Header: Title + Category + Edit & Delete Action Buttons */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A", lineHeight: 20 }}>
                    {idx + 1}. {item.title || item.label}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 3 }}>
                    {item.category && (
                      <View style={{ backgroundColor: "#F1F5F9", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ fontSize: 10, color: "#475569", fontWeight: "700" }}>
                          {item.category}
                        </Text>
                      </View>
                    )}
                    {item.measurementUnit ? (
                      <View style={{ backgroundColor: "#EFF6FF", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ fontSize: 10, color: "#1D4ED8", fontWeight: "700" }}>
                          Unit: {item.measurementUnit}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                {/* Edit & Delete Action Buttons */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <TouchableOpacity
                    onPress={() => handleOpenEdit(idx)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: "#EFF6FF",
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#DBEAFE",
                    }}
                  >
                    <Ionicons name="pencil-outline" size={15} color="#2563EB" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeleteItem(idx)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: "#FEF2F2",
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#FEE2E2",
                    }}
                  >
                    <Ionicons name="trash-outline" size={15} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Status Pill Toggle */}
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: "#F1F5F9",
                  borderRadius: 8,
                  padding: 2,
                  marginBottom: 10,
                }}
              >
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
                        flex: 1,
                        paddingVertical: 6,
                        borderRadius: 6,
                        alignItems: "center",
                        backgroundColor: isActive ? st.color : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
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
                    paddingVertical: 6,
                    fontSize: 12,
                    color: "#0F172A",
                  }}
                  placeholder={
                    item.measurementUnit
                      ? `Reading (${item.measurementUnit})`
                      : "Reading / Measurement (e.g. 5.2 mm, 12.8V)"
                  }
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
                    paddingVertical: 6,
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
          );
        })}

        {/* Quick Add Button at bottom of list */}
        {items.length > 0 && !showAddSection && (
          <TouchableOpacity
            onPress={() => setShowAddSection(true)}
            style={{
              backgroundColor: "#EFF6FF",
              borderWidth: 1.5,
              borderColor: "#BFDBFE",
              borderStyle: "dashed",
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              marginBottom: 16,
            }}
          >
            <Ionicons name="add-circle" size={18} color="#2563EB" style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 13, fontWeight: "800", color: "#2563EB" }}>
              + Add Custom Check Item
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Sticky Bottom Action Buttons */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: Platform.OS === "ios" ? 16 : 12,
          borderTopWidth: 1,
          borderTopColor: "#E2E8F0",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 5,
          elevation: 6,
          flexDirection: "row",
          gap: 10,
        }}
      >
        <TouchableOpacity
          disabled={submitting}
          onPress={() => handleSave(false)}
          style={{
            flex: 1,
            backgroundColor: "#F1F5F9",
            borderRadius: 10,
            height: 48,
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
            height: 48,
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

      {/* EDIT ITEM MODAL */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              width: "100%",
              maxWidth: 420,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
                  Edit Check Item
                </Text>
                <Text style={{ fontSize: 11, color: "#64748B" }}>
                  Customize title, category and measurement unit
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close-circle" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 4 }}>
              Item Title *
            </Text>
            <TextInput
              style={{
                backgroundColor: "#F8FAFC",
                borderWidth: 1,
                borderColor: "#CBD5E1",
                borderRadius: 8,
                paddingHorizontal: 12,
                height: 42,
                fontSize: 13,
                color: "#0F172A",
                marginBottom: 12,
              }}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="e.g. Brake Disc Thickness"
              placeholderTextColor="#94A3B8"
            />

            {/* Category selection */}
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {CHECKLIST_CATEGORIES.map((cat) => {
                const isSelected = editCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setEditCategory(cat)}
                    style={{
                      backgroundColor: isSelected ? "#2563EB" : "#F1F5F9",
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 6,
                      marginRight: 6,
                      borderWidth: 1,
                      borderColor: isSelected ? "#2563EB" : "#E2E8F0",
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Measurement Unit */}
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 4 }}>
              Measurement Unit (Optional)
            </Text>
            <TextInput
              style={{
                backgroundColor: "#F8FAFC",
                borderWidth: 1,
                borderColor: "#CBD5E1",
                borderRadius: 8,
                paddingHorizontal: 12,
                height: 42,
                fontSize: 13,
                color: "#0F172A",
                marginBottom: 16,
              }}
              value={editUnit}
              onChangeText={setEditUnit}
              placeholder="e.g. mm, Liters, PSI, Volts, Bar"
              placeholderTextColor="#94A3B8"
            />

            {/* Modal Buttons */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: "#F1F5F9",
                  borderRadius: 10,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#64748B" }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveEdit}
                style={{
                  flex: 1,
                  backgroundColor: "#2563EB",
                  borderRadius: 10,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#FFFFFF" }}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
