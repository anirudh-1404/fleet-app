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
import { workshopServiceService } from "../../../services/workshopServiceService";
import { workshopVehicleService } from "../../../services/workshopVehicleService";
import { workshopWorkOrderService } from "../../../services/workshopWorkOrderService";

const SERVICE_TYPES = ["Basic Service", "Annual Service", "Lube Service", "Repair", "Other"];

export default function AddTruckServiceScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const prefilledVehicleId = route?.params?.prefilledVehicleId;
  const prefilledWorkOrderId = route?.params?.prefilledWorkOrderId;

  const [trucks, setTrucks] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedTruckId, setSelectedTruckId] = useState(prefilledVehicleId || "");
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(prefilledWorkOrderId || "");
  const [serviceType, setServiceType] = useState("Basic Service");
  const [odometer, setOdometer] = useState("");
  const [cost, setCost] = useState("");
  const [workshopVendor, setWorkshopVendor] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTrucksAndOrders();
  }, []);

  const fetchTrucksAndOrders = async () => {
    try {
      const [vData, woData] = await Promise.all([
        workshopVehicleService.getVehicles(),
        workshopWorkOrderService.getWorkOrders(),
      ]);
      const onlyTrucks = vData.filter((v) => v.vehicleType !== "Trailer");
      setTrucks(onlyTrucks);
      setWorkOrders(woData);
      if (!selectedTruckId && onlyTrucks.length > 0) {
        setSelectedTruckId(onlyTrucks[0]._id);
        if (onlyTrucks[0].odometer) setOdometer(String(onlyTrucks[0].odometer));
      }
    } catch (err) {
      console.error("Error fetching trucks:", err);
    }
  };

  const handleTruckSelect = (truck) => {
    setSelectedTruckId(truck._id);
    if (truck.odometer) setOdometer(String(truck.odometer));
  };

  const handleSubmit = async () => {
    if (!selectedTruckId) {
      Alert.alert("Missing Truck", "Please select a truck to record service.");
      return;
    }

    setSubmitting(true);
    try {
      await workshopServiceService.createService({
        vehicleId: selectedTruckId,
        workOrderId: selectedWorkOrderId || undefined,
        vehicleCategory: "Truck",
        serviceType,
        odometer: Number(odometer) || 0,
        cost: Number(cost) || 0,
        workshopVendor: workshopVendor.trim(),
        notes: notes.trim(),
      });
      Alert.alert("Success", "Truck service recorded successfully!");
      navigation.goBack();
    } catch (err) {
      console.error("Error creating truck service:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to record service.");
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
          Record Truck Service
        </Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, borderWidth: 1, borderColor: "#E2E8F0", gap: 14 }}>
            {/* Truck Selector */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Select Truck *
              </Text>
              {trucks.length === 0 ? (
                <Text style={{ fontSize: 13, color: "#DC2626" }}>No trucks registered yet.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {trucks.map((t) => {
                    const isSelected = selectedTruckId === t._id;
                    return (
                      <TouchableOpacity
                        key={t._id}
                        onPress={() => handleTruckSelect(t)}
                        style={{
                          backgroundColor: isSelected ? "#15803D" : "#F1F5F9",
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#334155" }}>
                          {t.registration} ({t.make} {t.model})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* Service Type */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Service Type
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {SERVICE_TYPES.map((st) => {
                  const isSelected = serviceType === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      onPress={() => setServiceType(st)}
                      style={{
                        backgroundColor: isSelected ? "#15803D" : "#F8FAFC",
                        borderWidth: 1,
                        borderColor: isSelected ? "#15803D" : "#CBD5E1",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Odometer & Cost */}
            <View style={{ flexDirection: "row", gap: 10 }}>
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

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>Service Cost ($)</Text>
                <TextInput
                  value={cost}
                  onChangeText={setCost}
                  placeholder="e.g. 450"
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

            {/* Workshop / Vendor */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Service Provider / Vendor
              </Text>
              <TextInput
                value={workshopVendor}
                onChangeText={setWorkshopVendor}
                placeholder="e.g. In-house / Volvo Authorized Workshop"
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
                        onPress={() => setSelectedWorkOrderId(wo._id)}
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

            {/* Notes */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Service Notes / Work Performed
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Details of fluids replaced, filter changes..."
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
              backgroundColor: "#15803D",
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
                Save Service Record
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
