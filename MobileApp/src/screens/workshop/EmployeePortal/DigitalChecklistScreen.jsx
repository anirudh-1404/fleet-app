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
import { useAuth } from "../../../context/AuthContext";
import { workshopEmployeeService } from "../../../services/workshopEmployeeService";
import {
  CHECKLIST_TYPES_LIST,
  CHECKLIST_TEMPLATES,
  CHECKLIST_CATEGORIES,
} from "../../../constants/checklistTemplates";

export default function DigitalChecklistScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { id, existingChecklist } = route.params;

  const [selectedType, setSelectedType] = useState("HEAVY_TRUCK_INSPECTION");
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Accordion collapsed state: object map of categoryName -> boolean
  const [collapsedCategories, setCollapsedCategories] = useState({});

  // Axle Brake Thickness State (Heavy Truck & Trailer)
  const [axleMeasurements, setAxleMeasurements] = useState([
    { axleNumber: "1st Axle", rhsMm: "", lhsMm: "" },
    { axleNumber: "2nd Axle", rhsMm: "", lhsMm: "" },
    { axleNumber: "3rd Axle", rhsMm: "", lhsMm: "" },
    { axleNumber: "4th Axle", rhsMm: "", lhsMm: "" },
  ]);

  // Tyre Tread Depth State (Car / Light Vehicle)
  const [tyreTreadMeasurements, setTyreTreadMeasurements] = useState({
    frontLeft: "",
    frontRight: "",
    rearLeft: "",
    rearRight: "",
  });

  // Service Completion Record State (Lube, Basic, Annual Service)
  const [serviceRecord, setServiceRecord] = useState({
    engineOilReplaced: false,
    oilFilterReplaced: false,
    fuelFilterReplaced: false,
    airFilterReplaced: false,
    coolantServiced: false,
    transmissionDiffOilsServiced: false,
    greasingCompleted: false,
    diagnosticScanCompleted: false,
    serviceReminderReset: false,
    roadTestCompleted: false,
    additionalWorkRequired: false,
    nextServiceDueKm: "",
    nextServiceDueDate: "",
  });

  // Final Summary & Outcome State
  const [overallOutcome, setOverallOutcome] = useState("Pass");
  const [inspectorComments, setInspectorComments] = useState("");
  const [inspectorName, setInspectorName] = useState(user?.name || "");

  // New Item State
  const [showAddSection, setShowAddSection] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Engine & Engine Bay");
  const [newItemUnit, setNewItemUnit] = useState("");

  // Edit Item Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("General / Custom");
  const [editUnit, setEditUnit] = useState("");

  // Initialize checklist
  useEffect(() => {
    if (existingChecklist && existingChecklist.items && existingChecklist.items.length > 0) {
      setSelectedType(existingChecklist.checklistType || "HEAVY_TRUCK_INSPECTION");
      setItems(
        existingChecklist.items.map((i) => ({
          id: i.id || i._id || `item_${Date.now()}_${Math.random()}`,
          title: i.title || i.label || "Check Item",
          label: i.label || i.title || "Check Item",
          category: i.category || "General / Custom",
          measurementUnit: i.measurementUnit || "",
          status: i.status === "PASS" ? "OK" : (i.status || "OK"),
          severity: i.severity || "Minor",
          notes: i.notes || i.observation || "",
          observation: i.observation || i.notes || "",
          measurement: i.measurement || "",
          defectDescription: i.defectDescription || "",
          recommendedRepair: i.recommendedRepair || "",
          repairPriority: i.repairPriority || "Normal",
        }))
      );

      if (existingChecklist.axleMeasurements && existingChecklist.axleMeasurements.length > 0) {
        setAxleMeasurements(existingChecklist.axleMeasurements);
      }
      if (existingChecklist.tyreTreadMeasurements) {
        setTyreTreadMeasurements(existingChecklist.tyreTreadMeasurements);
      }
      if (existingChecklist.serviceRecord) {
        setServiceRecord({
          ...serviceRecord,
          ...existingChecklist.serviceRecord,
          nextServiceDueKm: existingChecklist.serviceRecord.nextServiceDueKm
            ? String(existingChecklist.serviceRecord.nextServiceDueKm)
            : "",
        });
      }
      if (existingChecklist.overallOutcome) {
        setOverallOutcome(existingChecklist.overallOutcome);
      }
      if (existingChecklist.inspectorComments) {
        setInspectorComments(existingChecklist.inspectorComments);
      }
      if (existingChecklist.inspectorName) {
        setInspectorName(existingChecklist.inspectorName);
      }
    } else {
      loadTemplate("HEAVY_TRUCK_INSPECTION");
    }
  }, [existingChecklist]);

  const loadTemplate = (templateKey) => {
    setSelectedType(templateKey);
    const template = CHECKLIST_TEMPLATES[templateKey] || [];
    setItems(
      template.map((tmpl, idx) => ({
        id: `item_${Date.now()}_${idx}`,
        title: tmpl.title,
        label: tmpl.title,
        category: tmpl.category || "General / Custom",
        measurementUnit: tmpl.measurementUnit || "",
        status: "OK",
        severity: "Minor",
        notes: "",
        observation: "",
        measurement: "",
        defectDescription: "",
        recommendedRepair: "",
        repairPriority: "Normal",
      }))
    );
  };

  const activeTemplateConfig =
    CHECKLIST_TYPES_LIST.find((t) => t.key === selectedType) || CHECKLIST_TYPES_LIST[0];

  const toggleCategoryCollapse = (cat) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
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

  const setItemSeverity = (index, severity) => {
    const updated = [...items];
    updated[index].severity = severity;
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
    updated[index].observation = val;
    setItems(updated);
  };

  const setItemDefectDescription = (index, val) => {
    const updated = [...items];
    updated[index].defectDescription = val;
    setItems(updated);
  };

  const setItemRecommendedRepair = (index, val) => {
    const updated = [...items];
    updated[index].recommendedRepair = val;
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
      category: newItemCategory || "General / Custom",
      measurementUnit: newItemUnit.trim(),
      status: "OK",
      severity: "Minor",
      notes: "",
      observation: "",
      measurement: "",
      defectDescription: "",
      recommendedRepair: "",
      repairPriority: "Normal",
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
    setEditCategory(item.category || "General / Custom");
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
      category: editCategory || "General / Custom",
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

  // Update Axle Measurement
  const updateAxleMeasurement = (axleIdx, field, val) => {
    const updated = [...axleMeasurements];
    updated[axleIdx][field] = val;
    setAxleMeasurements(updated);
  };

  // Toggle Service Record checkbox
  const toggleServiceRecord = (key) => {
    setServiceRecord((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async (isCompleted = false) => {
    if (items.length === 0) {
      Alert.alert("Empty Checklist", "Please add at least one item into the checklist.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        checklistType: selectedType,
        items,
        axleMeasurements,
        tyreTreadMeasurements,
        serviceRecord: {
          ...serviceRecord,
          nextServiceDueKm: serviceRecord.nextServiceDueKm
            ? Number(serviceRecord.nextServiceDueKm)
            : undefined,
        },
        overallOutcome,
        inspectorComments: inspectorComments.trim(),
        inspectorName: inspectorName.trim() || user?.name || "Technician",
        isCompleted,
      };

      await workshopEmployeeService.submitChecklist(id, payload);

      Alert.alert(
        "Saved Successfully! ✅",
        isCompleted
          ? "Checklist has been completed and verified for workshop manager & client records."
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

  const passedCount = items.filter((i) => i.status === "OK" || i.status === "PASS").length;
  const failedCount = items.filter((i) => i.status === "FAIL" || i.status === "DEFECT").length;
  const naCount = items.filter((i) => i.status === "NA" || i.status === "N/A").length;

  // Group items by category for collapsible accordions
  const categoriesPresent = Array.from(new Set(items.map((i) => i.category || "General / Custom")));

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

        <View style={{ alignItems: "center", flex: 1, marginHorizontal: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: "900", color: "#0F172A" }} numberOfLines={1}>
            {activeTemplateConfig.title}
          </Text>
          <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>
            {activeTemplateConfig.badge} • {items.length} Check Points
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
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Template Selector Horizontal Bar */}
        <View style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: "800", color: "#334155" }}>
              Select Checklist Standard:
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

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {CHECKLIST_TYPES_LIST.map((tmpl) => {
              const isSelected = selectedType === tmpl.key;
              return (
                <TouchableOpacity
                  key={tmpl.key}
                  onPress={() => {
                    if (tmpl.key === "CUSTOM") {
                      setSelectedType("CUSTOM");
                    } else if (items.length > 0 && selectedType !== tmpl.key) {
                      Alert.alert(
                        "Switch Checklist?",
                        `Loading "${tmpl.title}" will replace current list with this standard.`,
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Load Standard", onPress: () => loadTemplate(tmpl.key) },
                        ]
                      );
                    } else if (selectedType !== tmpl.key) {
                      loadTemplate(tmpl.key);
                    }
                  }}
                  style={{
                    backgroundColor: isSelected ? "#2563EB" : "#FFFFFF",
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: isSelected ? "#2563EB" : "#E2E8F0",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name={tmpl.icon || "list-outline"}
                    size={16}
                    color={isSelected ? "#FFFFFF" : "#475569"}
                    style={{ marginRight: 6 }}
                  />
                  <View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "800",
                        color: isSelected ? "#FFFFFF" : "#0F172A",
                      }}
                    >
                      {tmpl.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "600",
                        color: isSelected ? "#DBEAFE" : "#64748B",
                      }}
                    >
                      {tmpl.badge}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Live Counters */}
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
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#10B981" }}>{passedCount}</Text>
            <Text style={{ fontSize: 10, fontWeight: "800", color: "#64748B" }}>OK</Text>
          </View>
          <View style={{ width: 1, height: "100%", backgroundColor: "#E2E8F0" }} />
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#EF4444" }}>{failedCount}</Text>
            <Text style={{ fontSize: 10, fontWeight: "800", color: "#64748B" }}>DEFECTS</Text>
          </View>
          <View style={{ width: 1, height: "100%", backgroundColor: "#E2E8F0" }} />
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#64748B" }}>{naCount}</Text>
            <Text style={{ fontSize: 10, fontWeight: "800", color: "#64748B" }}>N/A</Text>
          </View>
          <View style={{ width: 1, height: "100%", backgroundColor: "#E2E8F0" }} />
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#2563EB" }}>{items.length}</Text>
            <Text style={{ fontSize: 10, fontWeight: "800", color: "#64748B" }}>TOTAL</Text>
          </View>
        </View>

        {/* SPECIAL SECTION: AXLE BRAKE PAD THICKNESS (HEAVY TRUCK & TRAILER) */}
        {activeTemplateConfig.hasAxleMeasurements && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1.5,
              borderColor: "#CBD5E1",
              borderLeftWidth: 5,
              borderLeftColor: "#2563EB",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <Ionicons name="speedometer-outline" size={18} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}>
                Brake Pads / Shoes Thickness Measurements
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: "#64748B", marginBottom: 12 }}>
              Record brake lining thickness in millimeters (mm) for each axle
            </Text>

            <View style={{ gap: 8 }}>
              {axleMeasurements.map((axle, aIdx) => (
                <View
                  key={axle.axleNumber || aIdx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F8FAFC",
                    padding: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                  }}
                >
                  <Text style={{ width: 85, fontSize: 12, fontWeight: "800", color: "#1E293B" }}>
                    {axle.axleNumber}
                  </Text>

                  {/* RHS mm */}
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "center", marginRight: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#475569", marginRight: 4 }}>RHS:</Text>
                    <TextInput
                      style={{
                        flex: 1,
                        backgroundColor: "#FFFFFF",
                        borderWidth: 1,
                        borderColor: "#CBD5E1",
                        borderRadius: 6,
                        height: 36,
                        paddingHorizontal: 8,
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#0F172A",
                      }}
                      placeholder="mm"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={axle.rhsMm}
                      onChangeText={(val) => updateAxleMeasurement(aIdx, "rhsMm", val)}
                    />
                  </View>

                  {/* LHS mm */}
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#475569", marginRight: 4 }}>LHS:</Text>
                    <TextInput
                      style={{
                        flex: 1,
                        backgroundColor: "#FFFFFF",
                        borderWidth: 1,
                        borderColor: "#CBD5E1",
                        borderRadius: 6,
                        height: 36,
                        paddingHorizontal: 8,
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#0F172A",
                      }}
                      placeholder="mm"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={axle.lhsMm}
                      onChangeText={(val) => updateAxleMeasurement(aIdx, "lhsMm", val)}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* SPECIAL SECTION: TYRE TREAD DEPTH (CAR INSPECTION) */}
        {activeTemplateConfig.hasTyreTreadMeasurements && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1.5,
              borderColor: "#CBD5E1",
              borderLeftWidth: 5,
              borderLeftColor: "#10B981",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <Ionicons name="disc-outline" size={18} color="#10B981" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}>
                Tyre Tread Depth Measurements (mm)
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#475569", marginBottom: 3 }}>Front Left (FL)</Text>
                <TextInput
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#CBD5E1",
                    borderRadius: 8,
                    height: 38,
                    paddingHorizontal: 8,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                  placeholder="mm"
                  keyboardType="numeric"
                  value={tyreTreadMeasurements.frontLeft}
                  onChangeText={(val) => setTyreTreadMeasurements({ ...tyreTreadMeasurements, frontLeft: val })}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#475569", marginBottom: 3 }}>Front Right (FR)</Text>
                <TextInput
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#CBD5E1",
                    borderRadius: 8,
                    height: 38,
                    paddingHorizontal: 8,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                  placeholder="mm"
                  keyboardType="numeric"
                  value={tyreTreadMeasurements.frontRight}
                  onChangeText={(val) => setTyreTreadMeasurements({ ...tyreTreadMeasurements, frontRight: val })}
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#475569", marginBottom: 3 }}>Rear Left (RL)</Text>
                <TextInput
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#CBD5E1",
                    borderRadius: 8,
                    height: 38,
                    paddingHorizontal: 8,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                  placeholder="mm"
                  keyboardType="numeric"
                  value={tyreTreadMeasurements.rearLeft}
                  onChangeText={(val) => setTyreTreadMeasurements({ ...tyreTreadMeasurements, rearLeft: val })}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#475569", marginBottom: 3 }}>Rear Right (RR)</Text>
                <TextInput
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#CBD5E1",
                    borderRadius: 8,
                    height: 38,
                    paddingHorizontal: 8,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                  placeholder="mm"
                  keyboardType="numeric"
                  value={tyreTreadMeasurements.rearRight}
                  onChangeText={(val) => setTyreTreadMeasurements({ ...tyreTreadMeasurements, rearRight: val })}
                />
              </View>
            </View>
          </View>
        )}

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
                  Add Custom Item to Checklist
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddSection(false)}>
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 4 }}>
              Check Item Title *
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

        {/* CHECKLIST ITEMS GROUPED BY CATEGORY (COLLAPSIBLE ACCORDIONS) */}
        {categoriesPresent.map((categoryName) => {
          const categoryItems = items
            .map((item, originalIndex) => ({ item, originalIndex }))
            .filter(({ item }) => (item.category || "General / Custom") === categoryName);

          const isCollapsed = !!collapsedCategories[categoryName];
          const catPassed = categoryItems.filter(({ item }) => item.status === "OK" || item.status === "PASS").length;
          const catFailed = categoryItems.filter(({ item }) => item.status === "FAIL" || item.status === "DEFECT").length;

          return (
            <View
              key={categoryName}
              style={{
                marginBottom: 14,
                backgroundColor: "#FFFFFF",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                overflow: "hidden",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              {/* Category Accordion Header */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggleCategoryCollapse(categoryName)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#F8FAFC",
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderBottomWidth: isCollapsed ? 0 : 1,
                  borderBottomColor: "#E2E8F0",
                }}
              >
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: "900", color: "#0F172A" }}>
                    {categoryName}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <Text style={{ fontSize: 11, fontWeight: "600", color: "#64748B" }}>
                      {categoryItems.length} items
                    </Text>
                    {catFailed > 0 ? (
                      <View style={{ backgroundColor: "#FEE2E2", paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                        <Text style={{ fontSize: 10, fontWeight: "800", color: "#DC2626" }}>
                          {catFailed} Defect{catFailed > 1 ? "s" : ""}
                        </Text>
                      </View>
                    ) : (
                      <View style={{ backgroundColor: "#F0FDF4", paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                        <Text style={{ fontSize: 10, fontWeight: "800", color: "#16A34A" }}>
                          {catPassed}/{categoryItems.length} OK
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <Ionicons
                  name={isCollapsed ? "chevron-forward" : "chevron-down"}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>

              {/* Category Items List (if not collapsed) */}
              {!isCollapsed && (
                <View style={{ padding: 12, gap: 10 }}>
                  {categoryItems.map(({ item, originalIndex }) => {
                    const isFail = item.status === "FAIL" || item.status === "DEFECT";
                    const isPass = item.status === "OK" || item.status === "PASS";

                    return (
                      <View
                        key={item.id || originalIndex}
                        style={{
                          backgroundColor: isFail ? "#FFF5F5" : "#FFFFFF",
                          borderRadius: 12,
                          padding: 12,
                          borderWidth: 1,
                          borderColor: isFail ? "#FCA5A5" : "#E2E8F0",
                        }}
                      >
                        {/* Title Row + Edit/Delete */}
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                          <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={{ fontSize: 13, fontWeight: "800", color: "#0F172A", lineHeight: 18 }}>
                              {item.title || item.label}
                            </Text>
                            {item.measurementUnit ? (
                              <Text style={{ fontSize: 10, color: "#2563EB", fontWeight: "700", marginTop: 2 }}>
                                Unit: {item.measurementUnit}
                              </Text>
                            ) : null}
                          </View>

                          <View style={{ flexDirection: "row", gap: 6 }}>
                            <TouchableOpacity
                              onPress={() => handleOpenEdit(originalIndex)}
                              style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" }}
                            >
                              <Ionicons name="pencil-outline" size={13} color="#2563EB" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleDeleteItem(originalIndex)}
                              style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: "#FEF2F2", justifyContent: "center", alignItems: "center" }}
                            >
                              <Ionicons name="trash-outline" size={13} color="#EF4444" />
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Status Toggle (OK / Defect / N/A) */}
                        <View style={{ flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 8, padding: 2, marginBottom: 8 }}>
                          {[
                            { key: "OK", label: "OK", icon: "checkmark", color: "#10B981" },
                            { key: "FAIL", label: "Defect", color: "#EF4444" },
                            { key: "NA", label: "N/A", color: "#64748B" },
                          ].map((st) => {
                            const isActive =
                              st.key === "OK"
                                ? item.status === "OK" || item.status === "PASS"
                                : item.status === st.key;
                            return (
                              <TouchableOpacity
                                key={st.key}
                                onPress={() => setItemStatus(originalIndex, st.key)}
                                style={{
                                  flex: 1,
                                  paddingVertical: 6,
                                  borderRadius: 6,
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 4,
                                  backgroundColor: isActive ? st.color : "transparent",
                                }}
                              >
                                {st.icon && (
                                  <Ionicons
                                    name={st.icon}
                                    size={13}
                                    color={isActive ? "#FFFFFF" : "#10B981"}
                                  />
                                )}
                                <Text style={{ fontSize: 11, fontWeight: "800", color: isActive ? "#FFFFFF" : "#64748B" }}>
                                  {st.label}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        {/* If marked Defect, show Severity & Recommended Repair */}
                        {isFail && (
                          <View
                            style={{
                              backgroundColor: "#FEF2F2",
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              borderWidth: 1,
                              borderColor: "#FCA5A5",
                            }}
                          >
                            <Text style={{ fontSize: 11, fontWeight: "800", color: "#991B1B", marginBottom: 6 }}>
                              Defect Severity:
                            </Text>
                            <View style={{ flexDirection: "row", gap: 6, marginBottom: 8 }}>
                              {["Minor", "Major", "Critical"].map((sev) => {
                                const isSevActive = item.severity === sev;
                                return (
                                  <TouchableOpacity
                                    key={sev}
                                    onPress={() => setItemSeverity(originalIndex, sev)}
                                    style={{
                                      flex: 1,
                                      paddingVertical: 5,
                                      borderRadius: 6,
                                      alignItems: "center",
                                      backgroundColor: isSevActive
                                        ? sev === "Critical"
                                          ? "#DC2626"
                                          : sev === "Major"
                                          ? "#D97706"
                                          : "#2563EB"
                                        : "#FFFFFF",
                                      borderWidth: 1,
                                      borderColor: isSevActive ? "transparent" : "#CBD5E1",
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontSize: 11,
                                        fontWeight: "800",
                                        color: isSevActive ? "#FFFFFF" : "#475569",
                                      }}
                                    >
                                      {sev}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>

                            <TextInput
                              style={{
                                backgroundColor: "#FFFFFF",
                                borderWidth: 1,
                                borderColor: "#FCA5A5",
                                borderRadius: 6,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                fontSize: 11,
                                color: "#0F172A",
                                marginBottom: 6,
                              }}
                              placeholder="Describe defect in detail..."
                              placeholderTextColor="#94A3B8"
                              value={item.defectDescription}
                              onChangeText={(val) => setItemDefectDescription(originalIndex, val)}
                            />

                            <TextInput
                              style={{
                                backgroundColor: "#FFFFFF",
                                borderWidth: 1,
                                borderColor: "#FCA5A5",
                                borderRadius: 6,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                fontSize: 11,
                                color: "#0F172A",
                              }}
                              placeholder="Recommended repair / action..."
                              placeholderTextColor="#94A3B8"
                              value={item.recommendedRepair}
                              onChangeText={(val) => setItemRecommendedRepair(originalIndex, val)}
                            />
                          </View>
                        )}

                        {/* Optional Measurement Input */}
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                          <Ionicons name="speedometer-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
                          <TextInput
                            style={{
                              flex: 1,
                              backgroundColor: "#F8FAFC",
                              borderWidth: 1,
                              borderColor: "#E2E8F0",
                              borderRadius: 6,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              fontSize: 11,
                              color: "#0F172A",
                            }}
                            placeholder={
                              item.measurementUnit
                                ? `Reading (${item.measurementUnit})`
                                : "Measurement / Reading (optional)"
                            }
                            placeholderTextColor="#94A3B8"
                            value={item.measurement}
                            onChangeText={(val) => setItemMeasurement(originalIndex, val)}
                          />
                        </View>

                        {/* Notes / Remarks */}
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Ionicons name="chatbubble-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
                          <TextInput
                            style={{
                              flex: 1,
                              backgroundColor: "#F8FAFC",
                              borderWidth: 1,
                              borderColor: "#E2E8F0",
                              borderRadius: 6,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              fontSize: 11,
                              color: "#0F172A",
                            }}
                            placeholder="Technician observation / remarks..."
                            placeholderTextColor="#94A3B8"
                            value={item.notes}
                            onChangeText={(val) => setItemNotes(originalIndex, val)}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {/* SPECIAL SECTION: SERVICE COMPLETION CHECKLIST & NEXT SERVICE (Lube, Basic, Annual) */}
        {(activeTemplateConfig.hasServiceDetails || activeTemplateConfig.hasServiceRecord) && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1.5,
              borderColor: "#CBD5E1",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <Ionicons name="checkbox-outline" size={18} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
                Service Completion Record
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: "#64748B", marginBottom: 12 }}>
              Check off completed maintenance tasks per workshop service schedule
            </Text>

            <View style={{ gap: 8 }}>
              {[
                { key: "engineOilReplaced", label: "Engine oil changed / replaced" },
                { key: "oilFilterReplaced", label: "Oil filter replaced" },
                { key: "fuelFilterReplaced", label: "Fuel filter replaced" },
                { key: "airFilterReplaced", label: "Air filter replaced" },
                { key: "coolantServiced", label: "Coolant inspected / serviced" },
                { key: "greasingCompleted", label: "All grease points lubricated" },
                { key: "diagnosticScanCompleted", label: "Diagnostic fault scan completed" },
                { key: "roadTestCompleted", label: "Road test completed" },
                { key: "serviceReminderReset", label: "Dashboard service reminder reset" },
              ].map(({ key, label }) => {
                const isChecked = !!serviceRecord[key];
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => toggleServiceRecord(key)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: isChecked ? "#F0FDF4" : "#F8FAFC",
                      padding: 10,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: isChecked ? "#BBF7D0" : "#E2E8F0",
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "700", color: isChecked ? "#15803D" : "#334155" }}>
                      {label}
                    </Text>
                    <Ionicons
                      name={isChecked ? "checkbox" : "square-outline"}
                      size={20}
                      color={isChecked ? "#16A34A" : "#94A3B8"}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Next Service Due km */}
            <View style={{ marginTop: 14 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 4 }}>
                Next Service Due (km)
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1,
                  borderColor: "#CBD5E1",
                  borderRadius: 8,
                  height: 42,
                  paddingHorizontal: 10,
                  fontSize: 13,
                  fontWeight: "700",
                  color: "#0F172A",
                }}
                placeholder="e.g. 175000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={serviceRecord.nextServiceDueKm}
                onChangeText={(val) => setServiceRecord({ ...serviceRecord, nextServiceDueKm: val })}
              />
            </View>
          </View>
        )}

        {/* SECTION: FINAL INSPECTION OUTCOME & SIGN-OFF */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 14,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <Ionicons name="ribbon-outline" size={18} color="#7C3AED" style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
              Final Inspection Outcome & Sign-Off
            </Text>
          </View>

          {/* Outcome Selectors */}
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
            Overall Inspection Outcome:
          </Text>
          <View style={{ gap: 6, marginBottom: 12 }}>
            {[
              { label: "Pass", color: "#10B981" },
              { label: "Defects Found", color: "#F59E0B" },
              { label: "Further Inspection Required", color: "#6366F1" },
              { label: "Unsafe — Do Not Use Until Repaired", color: "#EF4444" },
            ].map((out) => {
              const isSelected = overallOutcome === out.label;
              return (
                <TouchableOpacity
                  key={out.label}
                  onPress={() => setOverallOutcome(out.label)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: isSelected ? `${out.color}15` : "#F8FAFC",
                    borderWidth: 1.5,
                    borderColor: isSelected ? out.color : "#E2E8F0",
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "800", color: isSelected ? out.color : "#475569" }}>
                    {out.label}
                  </Text>
                  <Ionicons
                    name={isSelected ? "radio-button-on" : "radio-button-off"}
                    size={16}
                    color={isSelected ? out.color : "#94A3B8"}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Inspector Comments */}
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 4 }}>
            Inspector's Comments
          </Text>
          <TextInput
            style={{
              backgroundColor: "#F8FAFC",
              borderWidth: 1,
              borderColor: "#CBD5E1",
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 8,
              fontSize: 12,
              color: "#0F172A",
              minHeight: 56,
              textAlignVertical: "top",
              marginBottom: 12,
            }}
            placeholder="Final remarks, test drive result, or roadworthiness notes..."
            placeholderTextColor="#94A3B8"
            multiline
            value={inspectorComments}
            onChangeText={setInspectorComments}
          />

          {/* Inspector Name */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#475569", marginBottom: 2 }}>
                Inspector / Technician Name
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1,
                  borderColor: "#CBD5E1",
                  borderRadius: 6,
                  height: 38,
                  paddingHorizontal: 8,
                  fontSize: 12,
                  fontWeight: "700",
                  color: "#0F172A",
                }}
                value={inspectorName}
                onChangeText={setInspectorName}
              />
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 10, color: "#94A3B8", fontWeight: "600" }}>Date Completed</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#0F172A", marginTop: 2 }}>
                {new Date().toLocaleDateString("en-AU")}
              </Text>
            </View>
          </View>
        </View>
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
