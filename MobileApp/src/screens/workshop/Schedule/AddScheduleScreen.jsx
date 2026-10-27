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
import { workshopScheduleService } from "../../../services/workshopScheduleService";
import { workshopVehicleService } from "../../../services/workshopVehicleService";

export default function AddScheduleScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const prefilledVehicleId = route?.params?.prefilledVehicleId;
  const prefilledCustomerId = route?.params?.prefilledCustomerId;
  const prefilledType = route?.params?.prefilledType || "Basic Service";

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(prefilledVehicleId || "");
  const [type, setType] = useState("Service"); // "Service" | "Inspection"
  const [serviceOrInspectionType, setServiceOrInspectionType] = useState(prefilledType);
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split("T")[0]);
  const [assignedPerson, setAssignedPerson] = useState("");
  const [assignedWorkshop, setAssignedWorkshop] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const vData = await workshopVehicleService.getVehicles();
      setVehicles(vData);
      if (!selectedVehicleId && vData.length > 0) {
        setSelectedVehicleId(vData[0]._id);
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedVehicleId) {
      Alert.alert("Missing Vehicle", "Please select a vehicle.");
      return;
    }

    setSubmitting(true);
    try {
      await workshopScheduleService.createSchedule({
        type,
        vehicleId: selectedVehicleId,
        serviceOrInspectionType: serviceOrInspectionType.trim(),
        scheduledDate,
        assignedPerson: assignedPerson.trim(),
        assignedWorkshop: assignedWorkshop.trim(),
        notes: notes.trim(),
      });
      Alert.alert("Success", "Scheduled successfully!");
      navigation.goBack();
    } catch (err) {
      console.error("Error creating schedule:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to create schedule.");
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
          Schedule Service or Inspection
        </Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, borderWidth: 1, borderColor: "#E2E8F0", gap: 14 }}>
            {/* Type Picker */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Schedule Category
              </Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {["Service", "Inspection"].map((t) => {
                  const isSelected = type === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => {
                        setType(t);
                        setServiceOrInspectionType(t === "Service" ? "Basic Service" : "Truck Inspection");
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: isSelected ? "#059669" : "#F8FAFC",
                        borderWidth: 1,
                        borderColor: isSelected ? "#059669" : "#CBD5E1",
                        paddingVertical: 10,
                        borderRadius: 8,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Vehicle Picker */}
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
                        onPress={() => setSelectedVehicleId(v._id)}
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

            {/* Service or Inspection Type Name */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Specific Job / Type *
              </Text>
              <TextInput
                value={serviceOrInspectionType}
                onChangeText={setServiceOrInspectionType}
                placeholder="e.g. Basic Service / Annual Inspection"
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

            {/* Scheduled Date */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Scheduled Date (YYYY-MM-DD) *
              </Text>
              <TextInput
                value={scheduledDate}
                onChangeText={setScheduledDate}
                placeholder="2026-08-30"
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

            {/* Assigned Person */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Assigned Mechanic / Inspector
              </Text>
              <TextInput
                value={assignedPerson}
                onChangeText={setAssignedPerson}
                placeholder="e.g. Raj Sharma"
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

            {/* Assigned Workshop */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Workshop / Location
              </Text>
              <TextInput
                value={assignedWorkshop}
                onChangeText={setAssignedWorkshop}
                placeholder="e.g. Bay 2 / Main Workshop"
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

            {/* Notes */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Notes
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Instructions or parts needed..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={2}
                style={{
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1,
                  borderColor: "#CBD5E1",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  height: 60,
                  fontSize: 14,
                  color: "#0F172A",
                  textAlignVertical: "top",
                }}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={submitting}
            style={{
              marginTop: 20,
              backgroundColor: "#059669",
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
                Confirm Schedule
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
