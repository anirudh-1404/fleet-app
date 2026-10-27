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
import { useNavigation } from "@react-navigation/native";
import { workshopReminderService } from "../../../services/workshopReminderService";
import { workshopVehicleService } from "../../../services/workshopVehicleService";

const REPEAT_OPTIONS = ["None", "Daily", "Weekly", "Monthly", "Yearly"];

export default function AddReminderScreen() {
  const navigation = useNavigation();

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [repeat, setRepeat] = useState("None");
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const vData = await workshopVehicleService.getVehicles();
      setVehicles(vData);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !dueDate.trim()) {
      Alert.alert("Required Fields", "Please enter a Reminder Title and Due Date.");
      return;
    }

    setSubmitting(true);
    try {
      await workshopReminderService.createReminder({
        title: title.trim(),
        dueDate,
        repeat,
        vehicleId: selectedVehicleId || undefined,
        notes: notes.trim(),
      });
      Alert.alert("Success", "Reminder set successfully!");
      navigation.goBack();
    } catch (err) {
      console.error("Error creating reminder:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to set reminder.");
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
          Add Workshop Reminder
        </Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, borderWidth: 1, borderColor: "#E2E8F0", gap: 14 }}>
            {/* Title */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Reminder Title *
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Call customer about brake replacement"
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

            {/* Due Date */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Due Date (YYYY-MM-DD) *
              </Text>
              <TextInput
                value={dueDate}
                onChangeText={setDueDate}
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

            {/* Repeat */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Repeat Schedule
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {REPEAT_OPTIONS.map((r) => {
                  const isSelected = repeat === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      onPress={() => setRepeat(r)}
                      style={{
                        backgroundColor: isSelected ? "#7C3AED" : "#F8FAFC",
                        borderWidth: 1,
                        borderColor: isSelected ? "#7C3AED" : "#CBD5E1",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                        {r}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Link to Vehicle */}
            {vehicles.length > 0 && (
              <View>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                  Link to Vehicle (Optional)
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setSelectedVehicleId("")}
                    style={{
                      backgroundColor: !selectedVehicleId ? "#059669" : "#F1F5F9",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "700", color: !selectedVehicleId ? "#FFFFFF" : "#475569" }}>
                      None
                    </Text>
                  </TouchableOpacity>
                  {vehicles.map((v) => {
                    const isSelected = selectedVehicleId === v._id;
                    return (
                      <TouchableOpacity
                        key={v._id}
                        onPress={() => setSelectedVehicleId(v._id)}
                        style={{
                          backgroundColor: isSelected ? "#059669" : "#F1F5F9",
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                          {v.registration} ({v.make} {v.model})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Notes */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Notes
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Additional reminder details..."
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
                Set Reminder
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
