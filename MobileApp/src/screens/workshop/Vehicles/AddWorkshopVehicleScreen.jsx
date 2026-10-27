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
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { workshopVehicleService } from "../../../services/workshopVehicleService";
import { workshopCustomerService } from "../../../services/workshopCustomerService";
import { uploadService } from "../../../services/uploadService";

const VEHICLE_TYPES = ["Truck", "Trailer", "Van", "Ute", "Car", "Other"];
const STATUS_OPTIONS = ["AVAILABLE", "IN_WORKSHOP", "READY_FOR_COLLECTION", "OUTSIDE_WORKSHOP", "INACTIVE"];

export default function AddWorkshopVehicleScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const prefilledCustomerId = route?.params?.prefilledCustomerId;

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(prefilledCustomerId || "");
  const [vehicleType, setVehicleType] = useState("Truck");
  const [registration, setRegistration] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [vin, setVin] = useState("");
  const [odometer, setOdometer] = useState("");
  const [status, setStatus] = useState("OUTSIDE_WORKSHOP");
  const [photo, setPhoto] = useState("");
  const [notes, setNotes] = useState("");

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await workshopCustomerService.getCustomers();
      setCustomers(data);
      if (!selectedCustomerId && data.length > 0) {
        setSelectedCustomerId(data[0]._id);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const handlePickImage = async (useCamera = false) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission needed", "Camera permission is required to capture vehicle photo.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission needed", "Gallery permission is required to select photos.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        setUploading(true);
        try {
          const uploadRes = await uploadService.uploadImage(selectedUri);
          if (uploadRes && uploadRes.url) {
            setPhoto(uploadRes.url);
          } else {
            setPhoto(selectedUri);
          }
        } catch (uploadErr) {
          console.warn("Upload service error, fallback to local URI:", uploadErr);
          setPhoto(selectedUri);
        } finally {
          setUploading(false);
        }
      }
    } catch (err) {
      console.error("Image picker error:", err);
      setUploading(false);
    }
  };

  const showImageSourceOptions = () => {
    Alert.alert("Vehicle Photo", "Choose photo source", [
      { text: "Camera", onPress: () => handlePickImage(true) },
      { text: "Photo Gallery", onPress: () => handlePickImage(false) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      Alert.alert("Missing Customer", "Please select or add a customer first.");
      return;
    }

    if (!registration.trim()) {
      Alert.alert("Required Field", "Please enter the vehicle registration plate.");
      return;
    }

    setSubmitting(true);
    try {
      await workshopVehicleService.createVehicle({
        customerId: selectedCustomerId,
        vehicleType,
        registration: registration.trim().toUpperCase(),
        make: make.trim(),
        model: model.trim(),
        year: Number(year) || new Date().getFullYear(),
        vin: vin.trim(),
        odometer: Number(odometer) || 0,
        status,
        photo,
        notes: notes.trim(),
      });
      Alert.alert("Success", "Vehicle registered successfully!");
      navigation.goBack();
    } catch (err) {
      console.error("Error adding vehicle:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to add vehicle.");
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
          Register Customer Vehicle
        </Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, borderWidth: 1, borderColor: "#E2E8F0", gap: 14 }}>
            {/* Customer Picker */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Customer / Vehicle Owner *
              </Text>
              {customers.length === 0 ? (
                <Text style={{ fontSize: 13, color: "#DC2626" }}>No customers found. Please add a customer first.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {customers.map((c) => {
                    const isSelected = selectedCustomerId === c._id;
                    return (
                      <TouchableOpacity
                        key={c._id}
                        onPress={() => setSelectedCustomerId(c._id)}
                        style={{
                          backgroundColor: isSelected ? "#059669" : "#F1F5F9",
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#334155" }}>
                          {c.fullName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* Vehicle Type Selection */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Vehicle Type
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {VEHICLE_TYPES.map((t) => {
                  const isSelected = vehicleType === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setVehicleType(t)}
                      style={{
                        backgroundColor: isSelected ? "#0F172A" : "#F8FAFC",
                        borderWidth: 1,
                        borderColor: isSelected ? "#0F172A" : "#CBD5E1",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
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

            {/* Registration */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Registration Number / Plate *
              </Text>
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
                  height: 44,
                  fontSize: 14,
                  color: "#0F172A",
                  fontWeight: "700",
                }}
              />
            </View>

            {/* Make & Model */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>Make</Text>
                <TextInput
                  value={make}
                  onChangeText={setMake}
                  placeholder="e.g. Volvo"
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

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>Model</Text>
                <TextInput
                  value={model}
                  onChangeText={setModel}
                  placeholder="e.g. FH16"
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
            </View>

            {/* Year & Odometer */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>Year</Text>
                <TextInput
                  value={year}
                  onChangeText={setYear}
                  placeholder="2024"
                  keyboardType="numeric"
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

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>Odometer (km)</Text>
                <TextInput
                  value={odometer}
                  onChangeText={setOdometer}
                  placeholder="e.g. 145000"
                  keyboardType="numeric"
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
            </View>

            {/* VIN */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                VIN / Chassis Number (Optional)
              </Text>
              <TextInput
                value={vin}
                onChangeText={setVin}
                placeholder="e.g. 1HGCR2F83HA000000"
                autoCapitalize="characters"
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

            {/* Vehicle Status */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Current Status
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

            {/* Vehicle Photo Upload */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Vehicle Photo
              </Text>
              {photo ? (
                <View style={{ position: "relative" }}>
                  <Image source={{ uri: photo }} style={{ width: "100%", height: 160, borderRadius: 8 }} resizeMode="cover" />
                  <TouchableOpacity
                    onPress={() => setPhoto("")}
                    style={{ position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.6)", padding: 6, borderRadius: 16 }}
                  >
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={showImageSourceOptions}
                  disabled={uploading}
                  style={{
                    height: 100,
                    borderWidth: 1.5,
                    borderStyle: "dashed",
                    borderColor: "#CBD5E1",
                    borderRadius: 8,
                    backgroundColor: "#F8FAFC",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {uploading ? (
                    <ActivityIndicator color="#059669" />
                  ) : (
                    <>
                      <Ionicons name="camera-outline" size={26} color="#64748B" />
                      <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "600", marginTop: 4 }}>
                        Upload from Gallery or Camera
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Notes */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Notes / Special Conditions
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Condition notes, custom equipment..."
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
                Register Vehicle
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
