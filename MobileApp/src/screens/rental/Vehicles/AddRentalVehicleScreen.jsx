import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { rentalVehicleService } from "../../../services/rentalVehicleService";
import { uploadService } from "../../../services/uploadService";
import ROUTES from "../../../constants/routes";

const VEHICLE_TYPES = ["Sedan", "SUV", "Van", "Truck", "Hatchback", "Minivan", "Coupe", "Other"];
const STATUS_OPTIONS = ["AVAILABLE", "MAINTENANCE", "INACTIVE"];

export default function AddRentalVehicleScreen() {
  const navigation = useNavigation();

  const [vehicleType, setVehicleType] = useState("Sedan");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [registration, setRegistration] = useState("");
  const [vin, setVin] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("0");
  const [status, setStatus] = useState("AVAILABLE");
  const [photo, setPhoto] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async (useCamera = false) => {
    try {
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Camera/Gallery access is required to upload vehicle photos.");
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
            mediaTypes: ["images"],
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
            mediaTypes: ["images"],
          });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        setIsUploadingPhoto(true);
        try {
          const uploadRes = await uploadService.uploadImage(localUri);
          if (uploadRes && uploadRes.url) {
            setPhoto(uploadRes.url);
          } else {
            setPhoto(localUri);
          }
        } catch (e) {
          console.warn("Upload service fallback to local URI:", e.message);
          setPhoto(localUri);
        } finally {
          setIsUploadingPhoto(false);
        }
      }
    } catch (err) {
      console.error("Error picking photo:", err);
      Alert.alert("Error", "Failed to select photo.");
    }
  };

  const handlePhotoSelect = () => {
    Alert.alert(
      "Vehicle Photo",
      "Choose an option to upload vehicle photo",
      [
        { text: "Take Photo", onPress: () => pickImage(true) },
        { text: "Choose from Gallery", onPress: () => pickImage(false) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!make.trim() || !model.trim() || !registration.trim() || !dailyRate.trim() || !year.trim()) {
      Alert.alert("Required Fields", "Please enter make, model, year, registration, and daily rental rate.");
      return;
    }

    setIsSubmitting(true);
    try {
      await rentalVehicleService.createVehicle({
        vehicleType,
        make: make.trim(),
        model: model.trim(),
        year: Number(year),
        registration: registration.trim().toUpperCase(),
        vin: vin.trim(),
        dailyRate: Number(dailyRate),
        securityDeposit: Number(securityDeposit || 0),
        status,
        photo: photo.trim(),
        notes: notes.trim(),
      });

      Alert.alert("Success", "Rental vehicle added successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error("Error creating vehicle:", err);
      const msg = err.response?.data?.message || "Failed to create vehicle. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC", paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0 }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderColor: "#E2E8F0",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 4, marginRight: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A" }}>
          Add Rental Vehicle
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section 1: Vehicle Specifications */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A", marginBottom: 12 }}>
              Vehicle Type & Classification
            </Text>

            {/* Vehicle Type Selection Chips */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {VEHICLE_TYPES.map((t) => {
                const isSelected = vehicleType === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setVehicleType(t)}
                    style={{
                      backgroundColor: isSelected ? "#2563EB" : "#F1F5F9",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: isSelected ? "#FFFFFF" : "#334155", fontWeight: "600", fontSize: 12 }}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Make & Model */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Make *</Text>
                <TextInput
                  value={make}
                  onChangeText={setMake}
                  placeholder="e.g. Toyota"
                  placeholderTextColor="#94A3B8"
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#CBD5E1",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    height: 42,
                    fontSize: 14,
                    color: "#0F172A",
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Model *</Text>
                <TextInput
                  value={model}
                  onChangeText={setModel}
                  placeholder="e.g. HiAce / Camry"
                  placeholderTextColor="#94A3B8"
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#CBD5E1",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    height: 42,
                    fontSize: 14,
                    color: "#0F172A",
                  }}
                />
              </View>
            </View>

            {/* Year & Registration */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              <View style={{ width: 100 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Year *</Text>
                <TextInput
                  value={year}
                  onChangeText={setYear}
                  placeholder="2025"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#CBD5E1",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    height: 42,
                    fontSize: 14,
                    color: "#0F172A",
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Registration / Plate *</Text>
                <TextInput
                  value={registration}
                  onChangeText={setRegistration}
                  placeholder="e.g. ABC-123"
                  autoCapitalize="characters"
                  placeholderTextColor="#94A3B8"
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#CBD5E1",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    height: 42,
                    fontSize: 14,
                    color: "#0F172A",
                    fontWeight: "600",
                  }}
                />
              </View>
            </View>

            {/* VIN */}
            <View style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>VIN / Chassis (Optional)</Text>
              <TextInput
                value={vin}
                onChangeText={setVin}
                placeholder="17-digit VIN"
                autoCapitalize="characters"
                placeholderTextColor="#94A3B8"
                style={{
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1,
                  borderColor: "#CBD5E1",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  height: 42,
                  fontSize: 14,
                  color: "#0F172A",
                }}
              />
            </View>
          </View>

          {/* Section 2: Rental Rates & Pricing */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A", marginBottom: 12 }}>
              Pricing & Initial Status
            </Text>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Daily Rate ($) *</Text>
                <TextInput
                  value={dailyRate}
                  onChangeText={setDailyRate}
                  placeholder="120"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#CBD5E1",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    height: 42,
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#2563EB",
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Security Deposit ($)</Text>
                <TextInput
                  value={securityDeposit}
                  onChangeText={setSecurityDeposit}
                  placeholder="300"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#CBD5E1",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    height: 42,
                    fontSize: 15,
                    fontWeight: "600",
                    color: "#0F172A",
                  }}
                />
              </View>
            </View>

            {/* Status Selection */}
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 6 }}>Initial Status</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {STATUS_OPTIONS.map((s) => {
                const isSelected = status === s;
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStatus(s)}
                    style={{
                      flex: 1,
                      backgroundColor: isSelected ? "#0F172A" : "#F8FAFC",
                      borderWidth: 1,
                      borderColor: isSelected ? "#0F172A" : "#CBD5E1",
                      paddingVertical: 8,
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: isSelected ? "#FFFFFF" : "#475569", fontWeight: "700", fontSize: 11 }}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section 3: Photo Upload from Gallery / Camera */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A", marginBottom: 12 }}>
              Vehicle Photo
            </Text>

            {photo ? (
              <View style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "#CBD5E1", marginBottom: 10 }}>
                <Image
                  source={{ uri: photo }}
                  style={{ width: "100%", height: 160 }}
                  resizeMode="cover"
                />
                <View style={{ padding: 10, backgroundColor: "#FFFFFF", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={handlePhotoSelect}
                    style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                  >
                    <Ionicons name="camera-reverse-outline" size={18} color="#2563EB" />
                    <Text style={{ color: "#2563EB", fontWeight: "700", fontSize: 13 }}>Change Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setPhoto("")}
                    style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                  >
                    <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    <Text style={{ color: "#DC2626", fontWeight: "600", fontSize: 13 }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handlePhotoSelect}
                disabled={isUploadingPhoto}
                activeOpacity={0.75}
                style={{
                  borderWidth: 1.5,
                  borderStyle: "dashed",
                  borderColor: "#CBD5E1",
                  borderRadius: 12,
                  backgroundColor: "#F8FAFC",
                  padding: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                {isUploadingPhoto ? (
                  <View style={{ alignItems: "center", gap: 8 }}>
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "500" }}>Uploading photo...</Text>
                  </View>
                ) : (
                  <View style={{ alignItems: "center" }}>
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: "#EFF6FF",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 10,
                      }}
                    >
                      <Ionicons name="images-outline" size={24} color="#2563EB" />
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>
                      Upload Vehicle Photo
                    </Text>
                    <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                      Choose from Gallery or Take a Photo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Section 4: Internal Notes */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              padding: 16,
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A", marginBottom: 10 }}>
              Internal Notes
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Features, scratches, special conditions..."
              multiline
              numberOfLines={3}
              placeholderTextColor="#94A3B8"
              style={{
                backgroundColor: "#F8FAFC",
                borderWidth: 1,
                borderColor: "#CBD5E1",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                height: 70,
                fontSize: 14,
                color: "#0F172A",
                textAlignVertical: "top",
              }}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={{
              backgroundColor: "#2563EB",
              height: 50,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}>Save Vehicle</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
