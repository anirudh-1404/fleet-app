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
import { workshopNoteService } from "../../../services/workshopNoteService";
import { workshopVehicleService } from "../../../services/workshopVehicleService";

export default function AddNoteScreen() {
  const navigation = useNavigation();

  const [noteText, setNoteText] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
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
    if (!noteText.trim()) {
      Alert.alert("Required Field", "Please enter note text.");
      return;
    }

    setSubmitting(true);
    try {
      await workshopNoteService.createNote({
        noteText: noteText.trim(),
        vehicleId: selectedVehicleId || undefined,
      });
      Alert.alert("Success", "Note added successfully!");
      navigation.goBack();
    } catch (err) {
      console.error("Error creating note:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to create note.");
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
          Add Workshop Note
        </Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, borderWidth: 1, borderColor: "#E2E8F0", gap: 14 }}>
            {/* Note Text */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Note Content *
              </Text>
              <TextInput
                value={noteText}
                onChangeText={setNoteText}
                placeholder="Write your observation or reminder..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={5}
                style={{
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1,
                  borderColor: "#CBD5E1",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  height: 120,
                  fontSize: 14,
                  color: "#0F172A",
                  textAlignVertical: "top",
                }}
              />
            </View>

            {/* Optional Vehicle link */}
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
                      General (None)
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
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={submitting}
            style={{
              marginTop: 20,
              backgroundColor: "#CA8A04",
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
                Save Note
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
