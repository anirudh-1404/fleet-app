import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
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
import { workshopWorkOrderService } from "../../../services/workshopWorkOrderService";
import { workshopEmployeeService } from "../../../services/workshopEmployeeService";

const STATUS_OPTIONS = ["OPEN", "INSPECTION_PENDING", "IN_PROGRESS", "WAITING_FOR_PARTS", "COMPLETED", "CANCELLED"];
const JOB_TYPES = ["Basic Service", "Annual Service", "Lube Service", "Inspection", "Repair", "Other"];
const PRIORITIES = ["Normal", "Urgent", "Critical"];

export default function EditWorkOrderScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { workOrder } = route.params;

  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(workOrder?.assignedTo?._id || workOrder?.assignedTo || "");
  const [jobType, setJobType] = useState(workOrder?.jobType || "Basic Service");
  const [priority, setPriority] = useState(workOrder?.priority || "Normal");
  const [status, setStatus] = useState(workOrder?.status || "OPEN");
  const [assignedMechanic, setAssignedMechanic] = useState(workOrder?.assignedMechanic || "");
  const [description, setDescription] = useState(workOrder?.description || "");
  const [notes, setNotes] = useState(workOrder?.notes || "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await workshopEmployeeService.getEmployees();
      setEmployees(data || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      await workshopWorkOrderService.updateWorkOrder(workOrder._id, {
        jobType,
        priority,
        status,
        assignedMechanic: assignedMechanic.trim(),
        assignedTo: selectedEmployeeId || undefined,
        description: description.trim(),
        notes: notes.trim(),
      });
      Alert.alert("Success", "Work order updated successfully!");
      navigation.goBack();
    } catch (err) {
      console.error("Error updating work order:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to update work order.");
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
          Edit Work Order ({workOrder?.jobNumber})
        </Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, borderWidth: 1, borderColor: "#E2E8F0", gap: 14 }}>
            {/* Status Selection */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Status
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {STATUS_OPTIONS.map((st) => {
                  const isSelected = status === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      onPress={() => setStatus(st)}
                      style={{
                        backgroundColor: isSelected ? "#059669" : "#F8FAFC",
                        borderWidth: 1,
                        borderColor: isSelected ? "#059669" : "#CBD5E1",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                        {st.replace(/_/g, " ")}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Job Type */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Job Type
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {JOB_TYPES.map((jt) => {
                  const isSelected = jobType === jt;
                  return (
                    <TouchableOpacity
                      key={jt}
                      onPress={() => setJobType(jt)}
                      style={{
                        backgroundColor: isSelected ? "#059669" : "#F8FAFC",
                        borderWidth: 1,
                        borderColor: isSelected ? "#059669" : "#CBD5E1",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                        {jt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Priority */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Job Priority
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {PRIORITIES.map((pr) => {
                  const isSelected = priority === pr;
                  return (
                    <TouchableOpacity
                      key={pr}
                      onPress={() => setPriority(pr)}
                      style={{
                        flex: 1,
                        backgroundColor: isSelected ? (pr === "Critical" ? "#DC2626" : pr === "Urgent" ? "#EA580C" : "#0F172A") : "#F8FAFC",
                        borderWidth: 1,
                        borderColor: isSelected ? "transparent" : "#CBD5E1",
                        paddingVertical: 8,
                        borderRadius: 8,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                        {pr}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Assigned Mechanic / Employee */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Assign to Workshop Employee / Mechanic
              </Text>
              {employees.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                  {employees.map((emp) => {
                    const isSelected = selectedEmployeeId === emp._id;
                    return (
                      <TouchableOpacity
                        key={emp._id}
                        onPress={() => {
                          if (isSelected) {
                            setSelectedEmployeeId("");
                            setAssignedMechanic("");
                          } else {
                            setSelectedEmployeeId(emp._id);
                            setAssignedMechanic(emp.name);
                          }
                        }}
                        style={{
                          backgroundColor: isSelected ? "#059669" : "#F1F5F9",
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                          marginRight: 8,
                          borderWidth: 1,
                          borderColor: isSelected ? "#059669" : "#E2E8F0",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "700",
                            color: isSelected ? "#FFFFFF" : "#334155",
                          }}
                        >
                          {emp.name} {emp.designation ? `(${emp.designation})` : ""}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : null}
              <TextInput
                value={assignedMechanic}
                onChangeText={(text) => {
                  setAssignedMechanic(text);
                  setSelectedEmployeeId("");
                }}
                placeholder="Mechanic name or select from team above..."
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

            {/* Description */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Description
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Job description..."
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
                  height: 80,
                  fontSize: 14,
                  color: "#0F172A",
                  textAlignVertical: "top",
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
                placeholder="Internal notes..."
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
            onPress={handleUpdate}
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
                Update Work Order
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
