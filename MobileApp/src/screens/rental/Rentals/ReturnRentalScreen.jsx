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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { rentalService } from "../../../services/rentalService";

const FUEL_LEVELS = ["Full", "3/4", "1/2", "1/4", "Empty"];

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getCurrentTimeString = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export default function ReturnRentalScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const rental = route.params?.rental;

  const [actualReturnDate, setActualReturnDate] = useState(getTodayDateString());
  const [actualReturnTime, setActualReturnTime] = useState(getCurrentTimeString());
  const [returnOdometer, setReturnOdometer] = useState("");
  const [returnFuelLevel, setReturnFuelLevel] = useState("Full");
  const [damageNotes, setDamageNotes] = useState("");
  const [additionalCharges, setAdditionalCharges] = useState("0");
  const [returnNotes, setReturnNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(rental?.paymentStatus || "Paid");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseTotal = rental?.totalAmount || rental?.rentalAmount || 0;
  const extraCharge = parseFloat(additionalCharges) || 0;
  const finalCalculatedAmount = baseTotal + extraCharge;

  const handleCompleteReturn = async () => {
    if (!actualReturnDate.trim()) {
      Alert.alert("Return Date", "Please enter the actual return date.");
      return;
    }

    setIsSubmitting(true);
    try {
      await rentalService.returnRental(rental._id, {
        actualReturnDate: actualReturnDate.trim(),
        actualReturnTime: actualReturnTime.trim(),
        returnOdometer: returnOdometer ? Number(returnOdometer) : undefined,
        returnFuelLevel,
        damageNotes: damageNotes.trim(),
        additionalCharges: extraCharge,
        finalAmount: finalCalculatedAmount,
        returnNotes: returnNotes.trim(),
        paymentStatus,
      });

      Alert.alert("Vehicle Returned", "Rental marked as returned and vehicle is now available!", [
        {
          text: "Done",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (err) {
      console.error("Return completion error:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to complete return.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{  flex: 1, backgroundColor: "#F8FAFC"  }} edges={["top"]}>
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A" }}>
          Process Vehicle Return
        </Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          
          {/* Summary Box */}
          <View
            style={{
              backgroundColor: "#EFF6FF",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#BFDBFE",
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E40AF", textTransform: "uppercase" }}>
              Rental Agreement Details
            </Text>

            <Text style={{ fontSize: 17, fontWeight: "800", color: "#0F172A", marginTop: 6 }}>
              {rental?.customer?.fullName}
            </Text>
            <Text style={{ fontSize: 14, color: "#475569", marginTop: 2, fontWeight: "500" }}>
              {rental?.vehicle?.make} {rental?.vehicle?.model} • Plate: {rental?.vehicle?.registration}
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: "#DBEAFE" }}>
              <Text style={{ fontSize: 12, color: "#64748B" }}>Expected Return Date:</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#0F172A" }}>{rental?.returnDate}</Text>
            </View>
          </View>

          {/* Return Form Details */}
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
              Return Inspection & Timing
            </Text>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Actual Return Date *</Text>
                <TextInput
                  value={actualReturnDate}
                  onChangeText={setActualReturnDate}
                  placeholder="YYYY-MM-DD"
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
              <View style={{ width: 110 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Return Time</Text>
                <TextInput
                  value={actualReturnTime}
                  onChangeText={setActualReturnTime}
                  placeholder="HH:MM"
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

            {/* Odometer */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Return Odometer (km)</Text>
              <TextInput
                value={returnOdometer}
                onChangeText={setReturnOdometer}
                placeholder="e.g. 45200"
                keyboardType="numeric"
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

            {/* Fuel Level */}
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 6 }}>Return Fuel Level</Text>
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 14 }}>
              {FUEL_LEVELS.map((fl) => {
                const isSelected = returnFuelLevel === fl;
                return (
                  <TouchableOpacity
                    key={fl}
                    onPress={() => setReturnFuelLevel(fl)}
                    style={{
                      flex: 1,
                      backgroundColor: isSelected ? "#0F172A" : "#F8FAFC",
                      borderWidth: 1,
                      borderColor: isSelected ? "#0F172A" : "#CBD5E1",
                      paddingVertical: 7,
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: isSelected ? "#FFFFFF" : "#475569", fontWeight: "700", fontSize: 11 }}>
                      {fl}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Damage Notes */}
            <View style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Damage / Condition Notes</Text>
              <TextInput
                value={damageNotes}
                onChangeText={setDamageNotes}
                placeholder="Note any scratches, cleanliness issues, or damages..."
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

          {/* Additional Charges & Financials */}
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
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A", marginBottom: 12 }}>
              Charges & Final Settlement
            </Text>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Additional Charges (Late/Fuel/Damage $)</Text>
              <TextInput
                value={additionalCharges}
                onChangeText={setAdditionalCharges}
                placeholder="0"
                keyboardType="numeric"
                style={{
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1,
                  borderColor: "#CBD5E1",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  height: 42,
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#DC2626",
                }}
              />
            </View>

            {/* Final Total calculation */}
            <View
              style={{
                backgroundColor: "#F8FAFC",
                borderRadius: 10,
                padding: 12,
                gap: 6,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Base Rental Total</Text>
                <Text style={{ fontSize: 13, color: "#0F172A" }}>${baseTotal}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Extra Charges</Text>
                <Text style={{ fontSize: 13, color: "#DC2626", fontWeight: "600" }}>+${extraCharge}</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingTop: 8,
                  marginTop: 2,
                  borderTopWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>Final Settled Amount</Text>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#2563EB" }}>${finalCalculatedAmount}</Text>
              </View>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={handleCompleteReturn}
            disabled={isSubmitting}
            style={{
              backgroundColor: "#2563EB",
              height: 52,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-done-circle-outline" size={20} color="#FFFFFF" />
                <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 16 }}>Complete Return</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
