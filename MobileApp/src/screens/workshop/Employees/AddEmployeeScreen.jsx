import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { workshopEmployeeService } from "../../../services/workshopEmployeeService";

const COMMON_SPECIALIZATIONS = [
  "Brakes",
  "Suspension",
  "Engine Overhaul",
  "Electrical & Wiring",
  "Diagnostics",
  "Lube & Filters",
  "Air Conditioning",
  "Tyres & Alignment",
];

export default function AddEmployeeScreen() {
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("Technician");
  const [specializations, setSpecializations] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleSpecialization = (spec) => {
    if (specializations.includes(spec)) {
      setSpecializations(specializations.filter((s) => s !== spec));
    } else {
      setSpecializations([...specializations, spec]);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Field", "Please enter the employee's full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (!password.trim() || password.length < 6) {
      Alert.alert("Weak Password", "Please set a password with at least 6 characters.");
      return;
    }

    try {
      setSubmitting(true);
      await workshopEmployeeService.createEmployee({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        phone: phone.trim(),
        designation: designation.trim() || "Technician",
        specialization: specializations,
        status: "Active",
      });

      Alert.alert("Success", "Employee account created successfully! They can now log into their portal.", [
        { text: "Done", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error("Error creating employee:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to create employee account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#E2E8F0",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6, marginRight: 8 }}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A" }}>Add Employee / Mechanic</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {/* Info Banner */}
          <View
            style={{
              backgroundColor: "#EFF6FF",
              borderRadius: 10,
              padding: 14,
              flexDirection: "row",
              marginBottom: 20,
              borderLeftWidth: 4,
              borderLeftColor: "#2563EB",
            }}
          >
            <Ionicons name="information-circle-outline" size={20} color="#2563EB" style={{ marginRight: 10 }} />
            <Text style={{ fontSize: 13, color: "#1E40AF", flex: 1, lineHeight: 18 }}>
              This employee can securely log into Workfle with their email and password to view and complete their assigned jobs.
            </Text>
          </View>

          {/* Full Name */}
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
            Full Name <Text style={{ color: "#EF4444" }}>*</Text>
          </Text>
          <TextInput
            placeholder="e.g. David Miller"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
            style={{
              backgroundColor: "#F8FAFC",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 15,
              color: "#0F172A",
              marginBottom: 16,
            }}
          />

          {/* Email */}
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
            Email Address (Login ID) <Text style={{ color: "#EF4444" }}>*</Text>
          </Text>
          <TextInput
            placeholder="e.g. david@workshop.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            style={{
              backgroundColor: "#F8FAFC",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 15,
              color: "#0F172A",
              marginBottom: 16,
            }}
          />

          {/* Password */}
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
            Initial Password <Text style={{ color: "#EF4444" }}>*</Text>
          </Text>
          <TextInput
            placeholder="Set an initial password (min. 6 chars)"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={{
              backgroundColor: "#F8FAFC",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 15,
              color: "#0F172A",
              marginBottom: 16,
            }}
          />

          {/* Phone */}
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
            Phone Number
          </Text>
          <TextInput
            placeholder="e.g. +61 412 345 678"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            style={{
              backgroundColor: "#F8FAFC",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 15,
              color: "#0F172A",
              marginBottom: 16,
            }}
          />

          {/* Designation */}
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
            Designation / Role Title
          </Text>
          <TextInput
            placeholder="e.g. Senior Diagnostic Technician / Lube Tech"
            placeholderTextColor="#94A3B8"
            value={designation}
            onChangeText={setDesignation}
            style={{
              backgroundColor: "#F8FAFC",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 15,
              color: "#0F172A",
              marginBottom: 20,
            }}
          />

          {/* Specializations */}
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 8 }}>
            Specializations & Skills
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 28 }}>
            {COMMON_SPECIALIZATIONS.map((spec) => {
              const selected = specializations.includes(spec);
              return (
                <TouchableOpacity
                  key={spec}
                  onPress={() => toggleSpecialization(spec)}
                  style={{
                    backgroundColor: selected ? "#2563EB" : "#F1F5F9",
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 20,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: selected ? "#FFFFFF" : "#475569",
                    }}
                  >
                    {spec}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={submitting}
            onPress={handleCreate}
            style={{
              backgroundColor: "#2563EB",
              borderRadius: 12,
              paddingVertical: 15,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}>
                Create Employee Account
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
