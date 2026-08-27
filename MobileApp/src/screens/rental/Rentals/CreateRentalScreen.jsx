import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
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
import { rentalVehicleService } from "../../../services/rentalVehicleService";
import { customerService } from "../../../services/customerService";
import { rentalService } from "../../../services/rentalService";
import ROUTES from "../../../constants/routes";
import RentalStateView from "../../../components/rental/RentalStateView";

const DURATION_PRESETS = [1, 2, 3, 5, 7, 14, 30];

// Helper to format Date as YYYY-MM-DD
const formatDateToString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Helper to add days to YYYY-MM-DD
const addDaysToDate = (dateStr, days) => {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  date.setDate(date.getDate() + Number(days));
  return formatDateToString(date);
};

export default function CreateRentalScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const preSelectedVehicleId = route.params?.preSelectedVehicleId;

  // Step state or collapsible sections
  const [vehicles, setVehicles] = useState([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Customer info
  const [existingCustomers, setExistingCustomers] = useState([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [licenceClass, setLicenceClass] = useState("Car (Class C)");
  const [licenceExpiry, setLicenceExpiry] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  // Rental details
  const todayStr = formatDateToString(new Date());
  const [startDate, setStartDate] = useState(todayStr);
  const [startTime, setStartTime] = useState("09:00");
  const [durationDays, setDurationDays] = useState("3");
  const [returnTime, setReturnTime] = useState("17:00");
  const [dailyRate, setDailyRate] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [rentalNotes, setRentalNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate return date automatically from Start Date + durationDays
  const returnDate = addDaysToDate(startDate, durationDays || 1);

  // Pricing calculations
  const numDays = Math.max(1, parseInt(durationDays, 10) || 1);
  const rateVal = parseFloat(dailyRate) || (selectedVehicle?.dailyRate || 0);
  const depositVal = parseFloat(securityDeposit) || (selectedVehicle?.securityDeposit || 0);
  const rentalAmount = rateVal * numDays;
  const totalAmount = rentalAmount + depositVal;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoadingVehicles(true);
      const [vehList, custList] = await Promise.all([
        rentalVehicleService.getVehicles({ status: "AVAILABLE" }),
        customerService.getCustomers(),
      ]);

      setVehicles(vehList);
      setExistingCustomers(custList);

      if (preSelectedVehicleId) {
        const found = vehList.find((v) => v._id === preSelectedVehicleId);
        if (found) {
          selectVehicle(found);
        } else {
          // If vehicle was passed directly, fetch single
          const single = await rentalVehicleService.getVehicleById(preSelectedVehicleId);
          if (single?.vehicle) {
            selectVehicle(single.vehicle);
          }
        }
      } else if (vehList.length > 0) {
        selectVehicle(vehList[0]);
      }
    } catch (e) {
      console.error("Error loading initial rental data:", e);
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const selectVehicle = (v) => {
    setSelectedVehicle(v);
    setDailyRate(v.dailyRate.toString());
    setSecurityDeposit((v.securityDeposit || 0).toString());
  };

  const handleCustomerPhoneChange = (input) => {
    setPhone(input);
    // If exact match found among existing customers, autofill
    const matched = existingCustomers.find((c) => c.phone.trim() === input.trim());
    if (matched) {
      setFullName(matched.fullName || "");
      setEmail(matched.email || "");
      setAddress(matched.address || "");
      setLicenceNumber(matched.licenceNumber || "");
      setLicenceClass(matched.licenceClass || "Car (Class C)");
      setLicenceExpiry(matched.licenceExpiry || "");
      setEmergencyContact(matched.emergencyContact || "");
    }
  };

  const handleConfirmRental = async () => {
    if (!selectedVehicle) {
      Alert.alert("Select Vehicle", "Please select an available vehicle for this rental.");
      return;
    }

    if (!fullName.trim() || !phone.trim() || !licenceNumber.trim()) {
      Alert.alert("Customer Details", "Customer Full Name, Phone Number, and Licence Number are required.");
      return;
    }

    if (!startDate || !durationDays) {
      Alert.alert("Rental Duration", "Please specify start date and rental duration.");
      return;
    }

    setIsSubmitting(true);
    try {
      const rentalPayload = {
        vehicleId: selectedVehicle._id,
        customerDetails: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          licenceNumber: licenceNumber.trim().toUpperCase(),
          licenceClass: licenceClass.trim(),
          licenceExpiry: licenceExpiry.trim(),
          emergencyContact: emergencyContact.trim(),
          customerNotes: customerNotes.trim(),
        },
        startDate,
        startTime,
        durationDays: numDays,
        returnDate,
        returnTime,
        dailyRate: rateVal,
        securityDeposit: depositVal,
        paymentStatus,
        notes: rentalNotes.trim(),
      };

      const createdRental = await rentalService.createRental(rentalPayload);

      Alert.alert("Rental Confirmed", "Rental created successfully!", [
        {
          text: "View Details",
          onPress: () => {
            navigation.replace(ROUTES.RENTAL_DETAILS, { rentalId: createdRental._id });
          },
        },
      ]);
    } catch (err) {
      console.error("Rental creation error:", err);
      const errMsg = err.response?.data?.message || "Failed to create rental. Please check details.";
      Alert.alert("Booking Failed", errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingVehicles) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
        <RentalStateView type="loading" message="Loading available vehicles..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
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
          New Vehicle Rental
        </Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }} keyboardShouldPersistTaps="handled">
          
          {/* STEP 1: Vehicle Selection */}
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
              1. Select Available Vehicle
            </Text>

            {vehicles.length === 0 && !selectedVehicle ? (
              <View style={{ paddingVertical: 14, alignItems: "center" }}>
                <Text style={{ color: "#DC2626", fontWeight: "600", fontSize: 13 }}>
                  No available vehicles in your fleet!
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate(ROUTES.ADD_RENTAL_VEHICLE)}
                  style={{ marginTop: 8 }}
                >
                  <Text style={{ color: "#2563EB", fontWeight: "700", fontSize: 13 }}>+ Add a Vehicle</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                {vehicles.map((v) => {
                  const isSelected = selectedVehicle?._id === v._id;
                  return (
                    <TouchableOpacity
                      key={v._id}
                      onPress={() => selectVehicle(v)}
                      style={{
                        width: 170,
                        backgroundColor: isSelected ? "#EFF6FF" : "#F8FAFC",
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected ? "#2563EB" : "#CBD5E1",
                        borderRadius: 12,
                        padding: 12,
                        marginHorizontal: 4,
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: "800", color: isSelected ? "#1E40AF" : "#0F172A" }} numberOfLines={1}>
                        {v.make} {v.model}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                        {v.registration} • {v.year}
                      </Text>
                      <Text style={{ fontSize: 14, fontWeight: "800", color: "#2563EB", marginTop: 8 }}>
                        ${v.dailyRate}/day
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* STEP 2: Customer / Renter Details */}
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
              2. Customer / Renter Information
            </Text>

            {/* Phone (Autofill trigger) & Full Name */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Phone Number *</Text>
              <TextInput
                value={phone}
                onChangeText={handleCustomerPhoneChange}
                placeholder="e.g. +1 555-0199"
                keyboardType="phone-pad"
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

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Full Name *</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="e.g. John Smith"
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

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="john@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
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
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Licence Number *</Text>
                <TextInput
                  value={licenceNumber}
                  onChangeText={setLicenceNumber}
                  placeholder="DL-98765432"
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

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Licence Class</Text>
                <TextInput
                  value={licenceClass}
                  onChangeText={setLicenceClass}
                  placeholder="Class C"
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
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Licence Expiry</Text>
                <TextInput
                  value={licenceExpiry}
                  onChangeText={setLicenceExpiry}
                  placeholder="YYYY-MM-DD"
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

            <View style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Address / Location</Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Residential or business address"
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

          {/* STEP 3: Rental Period & Duration */}
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
              3. Rental Dates & Automatic Return Calculation
            </Text>

            {/* Start Date & Duration */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Start Date *</Text>
                <TextInput
                  value={startDate}
                  onChangeText={setStartDate}
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
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Duration (Days) *</Text>
                <TextInput
                  value={durationDays}
                  onChangeText={setDurationDays}
                  keyboardType="numeric"
                  placeholder="Days"
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
            </View>

            {/* Quick Duration Preset Chips */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {DURATION_PRESETS.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setDurationDays(d.toString())}
                  style={{
                    backgroundColor: durationDays === d.toString() ? "#0F172A" : "#F1F5F9",
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: durationDays === d.toString() ? "#FFFFFF" : "#475569", fontSize: 11, fontWeight: "700" }}>
                    {d} {d === 1 ? "Day" : "Days"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Auto-Calculated Return Date Display Box */}
            <View
              style={{
                backgroundColor: "#F0FDF4",
                borderWidth: 1,
                borderColor: "#A7F3D0",
                borderRadius: 10,
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#059669", textTransform: "uppercase" }}>
                  Expected Return Date (Auto-Calculated)
                </Text>
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#065F46", marginTop: 2 }}>
                  {returnDate} at {returnTime}
                </Text>
              </View>
              <Ionicons name="calendar" size={24} color="#059669" />
            </View>

            {/* Pricing overrides */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Daily Rate ($)</Text>
                <TextInput
                  value={dailyRate}
                  onChangeText={setDailyRate}
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
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>Deposit ($)</Text>
                <TextInput
                  value={securityDeposit}
                  onChangeText={setSecurityDeposit}
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
            </View>

            {/* Payment Status */}
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 6 }}>Payment Status</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {["Paid", "Pending", "Partial"].map((st) => {
                const isSelected = paymentStatus === st;
                return (
                  <TouchableOpacity
                    key={st}
                    onPress={() => setPaymentStatus(st)}
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
                    <Text style={{ color: isSelected ? "#FFFFFF" : "#475569", fontWeight: "700", fontSize: 12 }}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* STEP 4: Rental Summary & Confirmation */}
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
              Rental Summary
            </Text>

            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Vehicle</Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#0F172A" }}>
                  {selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.registration})` : "Not selected"}
                </Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Customer</Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#0F172A" }}>
                  {fullName || "Customer Name"}
                </Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Rental Period</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#2563EB" }}>
                  {startDate} → {returnDate} ({numDays} days)
                </Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Rental Fee (${rateVal} × {numDays}d)</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#0F172A" }}>${rentalAmount}</Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Security Deposit</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#0F172A" }}>${depositVal}</Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingTop: 10,
                  marginTop: 6,
                  borderTopWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>Total Payable</Text>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#2563EB" }}>${totalAmount}</Text>
              </View>
            </View>
          </View>

          {/* Confirm Rental Button */}
          <TouchableOpacity
            onPress={handleConfirmRental}
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
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 16 }}>Confirm Rental</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
