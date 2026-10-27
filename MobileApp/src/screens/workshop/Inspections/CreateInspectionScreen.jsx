import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { workshopInspectionService } from "../../../services/workshopInspectionService";
import { workshopVehicleService } from "../../../services/workshopVehicleService";
import { workshopWorkOrderService } from "../../../services/workshopWorkOrderService";

const DEFAULT_TRUCK_CHECKS = [
  "Brakes & Air Lines",
  "Headlights & Indicators",
  "Tires & Wheels",
  "Engine Oil & Fluids",
  "Steering & Suspension",
  "Windshield & Wipers",
  "Exhaust System",
];

const DEFAULT_TRAILER_CHECKS = [
  "Kingpin & Fifth Wheel Plate",
  "Brake Couplings & Hoses",
  "Trailer Tires & Rims",
  "Marker & Brake Lights",
  "Chassis & Landing Gear",
  "Door Locks & Latches",
];

export default function CreateInspectionScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const prefilledVehicleId = route?.params?.prefilledVehicleId;
  const prefilledWorkOrderId = route?.params?.prefilledWorkOrderId;
  const defaultType = route?.params?.defaultType || (route?.params?.vehicleType === "Trailer" ? "Trailer" : "Truck");

  const [vehicles, setVehicles] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(prefilledVehicleId || "");
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(prefilledWorkOrderId || "");
  const [inspectionType, setInspectionType] = useState(defaultType);
  const [inspectorName, setInspectorName] = useState("");
  const [status, setStatus] = useState("IN_PROGRESS");
  const [notes, setNotes] = useState("");

  const [checklist, setChecklist] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVehiclesAndWorkOrders();
  }, []);

  useEffect(() => {
    // Populate default checklist based on inspectionType
    const items = inspectionType === "Trailer" ? DEFAULT_TRAILER_CHECKS : DEFAULT_TRUCK_CHECKS;
    setChecklist(
      items.map((it) => ({
        item: it,
        status: "PASS",
        note: "",
      }))
    );
  }, [inspectionType]);

  const fetchVehiclesAndWorkOrders = async () => {
    try {
      const [vData, woData] = await Promise.all([
        workshopVehicleService.getVehicles(),
        workshopWorkOrderService.getWorkOrders(),
      ]);
      setVehicles(vData);
      setWorkOrders(woData);
      if (!selectedVehicleId && vData.length > 0) {
        setSelectedVehicleId(vData[0]._id);
        if (vData[0].vehicleType === "Trailer") setInspectionType("Trailer");
      }
    } catch (err) {
      console.error("Error fetching vehicles/work orders:", err);
    }
  };

  const handleVehicleChange = (vId) => {
    setSelectedVehicleId(vId);
    const found = vehicles.find((v) => v._id === vId);
    if (found && found.vehicleType === "Trailer") {
      setInspectionType("Trailer");
    } else if (found) {
      setInspectionType("Truck");
    }
  };

  const updateItemStatus = (index, itemStatus) => {
    const updated = [...checklist];
    updated[index].status = itemStatus;
    setChecklist(updated);
  };

  const updateItemNote = (index, noteText) => {
    const updated = [...checklist];
    updated[index].note = noteText;
    setChecklist(updated);
  };

  const handleSubmit = async () => {
    if (!selectedVehicleId) {
      Alert.alert("Missing Vehicle", "Please select a vehicle to inspect.");
      return;
    }

    if (!inspectorName.trim()) {
      Alert.alert("Missing Inspector", "Please enter the Inspector name.");
      return;
    }

    // If any item failed, default status to FAILED or allow manager selection
    const hasFailures = checklist.some((c) => c.status === "FAIL");
    const finalStatus = hasFailures && status === "PASSED" ? "FAILED" : status;

    setSubmitting(true);
    try {
      await workshopInspectionService.createInspection({
        vehicleId: selectedVehicleId,
        workOrderId: selectedWorkOrderId || undefined,
        inspectionType,
        inspectorName: inspectorName.trim(),
        checklistItems: checklist,
        status: finalStatus,
        notes: notes.trim(),
      });
      Alert.alert("Success", "Inspection recorded successfully!");
      navigation.goBack();
    } catch (err) {
      console.error("Error creating inspection:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to record inspection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderColor: "#E2E8F0",
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 10 }}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>
          Record Inspection
        </Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, borderWidth: 1, borderColor: "#E2E8F0", gap: 14 }}>
            {/* Inspection Type (Truck vs Trailer) */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Inspection Category
              </Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {["Truck", "Trailer"].map((t) => {
                  const isSelected = inspectionType === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setInspectionType(t)}
                      style={{
                        flex: 1,
                        backgroundColor: isSelected ? "#7C3AED" : "#F8FAFC",
                        borderWidth: 1,
                        borderColor: isSelected ? "#7C3AED" : "#CBD5E1",
                        paddingVertical: 10,
                        borderRadius: 8,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                        {t} Inspection
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Vehicle Selection */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Select Vehicle *
              </Text>
              {vehicles.length === 0 ? (
                <Text style={{ fontSize: 13, color: "#DC2626" }}>No vehicles registered yet.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {vehicles.map((v) => {
                    const isSelected = selectedVehicleId === v._id;
                    return (
                      <TouchableOpacity
                        key={v._id}
                        onPress={() => handleVehicleChange(v._id)}
                        style={{
                          backgroundColor: isSelected ? "#0F172A" : "#F1F5F9",
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#334155" }}>
                          {v.registration} ({v.make} {v.model})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* Optional Work Order Link */}
            {workOrders.length > 0 && (
              <View>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                  Link to Work Order (Optional)
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setSelectedWorkOrderId("")}
                    style={{
                      backgroundColor: !selectedWorkOrderId ? "#059669" : "#F1F5F9",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "700", color: !selectedWorkOrderId ? "#FFFFFF" : "#475569" }}>
                      None
                    </Text>
                  </TouchableOpacity>
                  {workOrders.map((wo) => {
                    const isSelected = selectedWorkOrderId === wo._id;
                    return (
                      <TouchableOpacity
                        key={wo._id}
                        onPress={() => setSelectedWorkOrderId(wo._id)}
                        style={{
                          backgroundColor: isSelected ? "#059669" : "#F1F5F9",
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                          {wo.jobNumber} ({wo.jobType})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Inspector Name */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Inspector Name *
              </Text>
              <TextInput
                value={inspectorName}
                onChangeText={setInspectorName}
                placeholder="e.g. Raj / Dave"
                placeholderTextColor="#94A3B8"
                style={{
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1,
                  borderColor: "#CBD5E1",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  height: 44,
                  fontSize: 14,
                  color: "#0F172A",
                }}
              />
            </View>

            {/* Overall Status */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Initial Status
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["IN_PROGRESS", "PASSED", "FAILED"].map((st) => {
                  const isSelected = status === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      onPress={() => setStatus(st)}
                      style={{
                        flex: 1,
                        backgroundColor: isSelected ? (st === "PASSED" ? "#15803D" : st === "FAILED" ? "#DC2626" : "#059669") : "#F8FAFC",
                        borderWidth: 1,
                        borderColor: isSelected ? "transparent" : "#CBD5E1",
                        paddingVertical: 8,
                        borderRadius: 8,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Checklist Items Card */}
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A", marginTop: 20, marginBottom: 12 }}>
            Configured Checklist Items
          </Text>

          <View style={{ gap: 10 }}>
            {checklist.map((item, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A", marginBottom: 8 }}>
                  {item.item}
                </Text>

                {/* PASS / FAIL / N/A selector */}
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
                  {["PASS", "FAIL", "N/A"].map((opt) => {
                    const isSelected = item.status === opt;
                    let optBg = "#F1F5F9";
                    let optText = "#475569";
                    if (isSelected) {
                      if (opt === "PASS") {
                        optBg = "#15803D";
                        optText = "#FFFFFF";
                      } else if (opt === "FAIL") {
                        optBg = "#DC2626";
                        optText = "#FFFFFF";
                      } else {
                        optBg = "#475569";
                        optText = "#FFFFFF";
                      }
                    }

                    return (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => updateItemStatus(index, opt)}
                        style={{
                          flex: 1,
                          backgroundColor: optBg,
                          paddingVertical: 6,
                          borderRadius: 6,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: "700", color: optText }}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TextInput
                  value={item.note}
                  onChangeText={(txt) => updateItemNote(index, txt)}
                  placeholder="Notes for this item (optional)..."
                  placeholderTextColor="#94A3B8"
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    borderRadius: 6,
                    paddingHorizontal: 10,
                    height: 36,
                    fontSize: 12,
                    color: "#0F172A",
                  }}
                />
              </View>
            ))}
          </View>

          {/* Notes */}
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, marginTop: 16, borderWidth: 1, borderColor: "#E2E8F0" }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
              Overall Inspection Notes
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Rear light lens cracked, needs replacement parts..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: "#F8FAFC",
                borderWidth: 1,
                borderColor: "#CBD5E1",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                height: 70,
                fontSize: 14,
                color: "#0F172A",
                textAlignVertical: "top",
              }}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={submitting}
            style={{
              marginTop: 20,
              backgroundColor: "#7C3AED",
              borderRadius: 12,
              height: 50,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
                Submit Inspection
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
