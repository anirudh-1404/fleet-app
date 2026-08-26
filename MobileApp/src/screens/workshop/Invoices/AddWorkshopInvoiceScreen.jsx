import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
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
import { workshopInvoiceService } from "../../../services/workshopInvoiceService";
import { workshopWorkOrderService } from "../../../services/workshopWorkOrderService";
import { workshopVehicleService } from "../../../services/workshopVehicleService";
import { uploadService } from "../../../services/uploadService";

const CATEGORIES = ["Parts", "Insurances", "Other Expenses"];

export default function AddWorkshopInvoiceScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const prefilledWorkOrderId = route?.params?.prefilledWorkOrderId;
  const prefilledVehicleId = route?.params?.prefilledVehicleId;
  const prefilledCustomerId = route?.params?.prefilledCustomerId;

  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-5)}`);
  const [category, setCategory] = useState("Parts");
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [file, setFile] = useState("");
  const [notes, setNotes] = useState("");

  const [workOrders, setWorkOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(prefilledWorkOrderId || "");
  const [selectedVehicleId, setSelectedVehicleId] = useState(prefilledVehicleId || "");

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrdersAndVehicles();
  }, []);

  const fetchOrdersAndVehicles = async () => {
    try {
      const [woData, vData] = await Promise.all([
        workshopWorkOrderService.getWorkOrders(),
        workshopVehicleService.getVehicles(),
      ]);
      setWorkOrders(woData);
      setVehicles(vData);
    } catch (err) {
      console.error("Error loading work orders / vehicles:", err);
    }
  };

  const handlePickReceipt = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Gallery permission is required.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        setUploading(true);
        try {
          const res = await uploadService.uploadImage(selectedUri);
          if (res && res.url) setFile(res.url);
          else setFile(selectedUri);
        } catch (uErr) {
          setFile(selectedUri);
        } finally {
          setUploading(false);
        }
      }
    } catch (err) {
      console.error("Error picking receipt:", err);
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!invoiceNumber.trim() || !amount) {
      Alert.alert("Missing Fields", "Please enter Invoice Number and Amount.");
      return;
    }

    setSubmitting(true);
    try {
      await workshopInvoiceService.createInvoice({
        invoiceNumber: invoiceNumber.trim(),
        category,
        amount: Number(amount),
        vendor: vendor.trim(),
        workOrderId: selectedWorkOrderId || undefined,
        vehicleId: selectedVehicleId || undefined,
        file,
        notes: notes.trim(),
      });
      Alert.alert("Success", "Invoice recorded successfully!");
      navigation.goBack();
    } catch (err) {
      console.error("Error creating invoice:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to record invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
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
          Add Invoice / Expense
        </Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, borderWidth: 1, borderColor: "#E2E8F0", gap: 14 }}>
            {/* Category Picker */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Expense Category
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={{
                        flex: 1,
                        backgroundColor: isSelected ? "#16A34A" : "#F8FAFC",
                        borderWidth: 1,
                        borderColor: isSelected ? "#16A34A" : "#CBD5E1",
                        paddingVertical: 8,
                        borderRadius: 8,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Invoice Number */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Invoice Number *
              </Text>
              <TextInput
                value={invoiceNumber}
                onChangeText={setInvoiceNumber}
                placeholder="e.g. INV-10492"
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

            {/* Amount */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Total Amount ($) *
              </Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="e.g. 120.00"
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

            {/* Vendor */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Vendor / Supplier Name
              </Text>
              <TextInput
                value={vendor}
                onChangeText={setVendor}
                placeholder="e.g. AutoParts Direct / State Insurance"
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

            {/* Link to Work Order */}
            {workOrders.length > 0 && (
              <View>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                  Link to Work Order (Optional)
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setSelectedWorkOrderId("")}
                    style={{
                      backgroundColor: !selectedWorkOrderId ? "#2563EB" : "#F1F5F9",
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
                        onPress={() => {
                          setSelectedWorkOrderId(wo._id);
                          if (wo.vehicle?._id) setSelectedVehicleId(wo.vehicle._id);
                        }}
                        style={{
                          backgroundColor: isSelected ? "#2563EB" : "#F1F5F9",
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

            {/* Upload Receipt / Document */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Receipt / Invoice Photo
              </Text>
              {file ? (
                <View style={{ position: "relative" }}>
                  <Image source={{ uri: file }} style={{ width: "100%", height: 160, borderRadius: 8 }} resizeMode="cover" />
                  <TouchableOpacity
                    onPress={() => setFile("")}
                    style={{ position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.6)", padding: 6, borderRadius: 16 }}
                  >
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handlePickReceipt}
                  disabled={uploading}
                  style={{
                    height: 80,
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
                    <ActivityIndicator color="#16A34A" />
                  ) : (
                    <>
                      <Ionicons name="document-attach-outline" size={24} color="#64748B" />
                      <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600", marginTop: 4 }}>
                        Upload Receipt Image
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Notes */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Notes / Items Purchased
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Brake light assembly replacement, 2x oil filters..."
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
              backgroundColor: "#16A34A",
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
                Save Invoice
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
