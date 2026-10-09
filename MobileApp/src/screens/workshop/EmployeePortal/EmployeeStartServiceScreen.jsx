import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
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
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import ROUTES from "../../../constants/routes";
import { useAuth } from "../../../context/AuthContext";
import { workshopEmployeeService } from "../../../services/workshopEmployeeService";
import WorkshopStatusBadge from "../../../components/workshop/WorkshopStatusBadge";
import {
  INTAKE_WORK_TYPES,
  JOB_PRIORITIES,
} from "../../../constants/checklistTemplates";

const VEHICLE_TYPES = ["Truck", "Trailer", "Van", "Ute", "Car", "Other"];

export default function EmployeeStartServiceScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  // Search state
  const [searchRego, setSearchRego] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [matchingVehicles, setMatchingVehicles] = useState([]);

  // Selected or New Truck State
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleHistory, setVehicleHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // New Truck Intake Form State (if truck not in workshop)
  const [isNewTruckMode, setIsNewTruckMode] = useState(false);
  const [newRego, setNewRego] = useState("");
  const [newVehicleType, setNewVehicleType] = useState("Truck");
  const [newMake, setNewMake] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  const [newVin, setNewVin] = useState("");
  const [newOdometer, setNewOdometer] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");

  // Quick Job Intake Form State (Step 2)
  const [step, setStep] = useState(1); // 1: Search/Select/Add Truck, 2: Quick Job Intake Details
  const [selectedWorkTypes, setSelectedWorkTypes] = useState(["General Service"]);
  const [customerComplaint, setCustomerComplaint] = useState("");
  const [workRequired, setWorkRequired] = useState("");
  const [faultCodes, setFaultCodes] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [jobPriority, setJobPriority] = useState("Normal");
  const [serviceOdometer, setServiceOdometer] = useState("");
  const [intakePhotos, setIntakePhotos] = useState([]);
  const [submittingService, setSubmittingService] = useState(false);

  // Search for trucks by registration
  const handleSearch = async (queryText = searchRego) => {
    const q = queryText.trim().toUpperCase();
    if (!q) {
      setMatchingVehicles([]);
      setSearchPerformed(false);
      return;
    }

    setSearching(true);
    setSearchPerformed(true);
    try {
      const data = await workshopEmployeeService.searchVehicles(q);
      setMatchingVehicles(data || []);
      // If exact match found and only one, we can focus it
      if (data && data.length === 1 && data[0].registration === q) {
        selectExistingVehicle(data[0]);
      }
    } catch (err) {
      console.error("Search error:", err);
      Alert.alert("Error", "Failed to search workshop vehicles.");
    } finally {
      setSearching(false);
    }
  };

  const selectExistingVehicle = async (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsNewTruckMode(false);
    setServiceOdometer(vehicle.odometer ? vehicle.odometer.toString() : "");
    // Fetch full past service & repair history
    setLoadingHistory(true);
    try {
      const details = await workshopEmployeeService.getVehicleHistory(vehicle._id);
      setVehicleHistory(details);
    } catch (err) {
      console.error("Error loading vehicle history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStartNewTruckForm = () => {
    setSelectedVehicle(null);
    setVehicleHistory(null);
    setIsNewTruckMode(true);
    setNewRego(searchRego.trim().toUpperCase());
    setNewMake("");
    setNewModel("");
    setNewOdometer("");
    setNewVin("");
    setNewCustomerName("");
  };

  const handlePickIntakePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIntakePhotos((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (e) {
      console.error("Photo picker error:", e);
      Alert.alert("Photo Error", "Could not select photo.");
    }
  };

  const handleTakeIntakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Camera Permission", "Camera permission is required to capture photos.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIntakePhotos((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (e) {
      console.error("Camera error:", e);
      Alert.alert("Camera Error", "Could not take photo.");
    }
  };

  const handleRemovePhoto = (idx) => {
    setIntakePhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleWorkType = (wt) => {
    if (selectedWorkTypes.includes(wt)) {
      if (selectedWorkTypes.length === 1) {
        Alert.alert("Selection Required", "Please select at least one type of work.");
        return;
      }
      setSelectedWorkTypes(selectedWorkTypes.filter((t) => t !== wt));
    } else {
      setSelectedWorkTypes([...selectedWorkTypes, wt]);
    }
  };

  const handleProceedToService = () => {
    if (isNewTruckMode) {
      if (!newRego.trim()) {
        Alert.alert("Required", "Please enter truck registration / plate number.");
        return;
      }
      setServiceOdometer(newOdometer.trim());
    } else if (!selectedVehicle) {
      Alert.alert("Selection Required", "Please select a truck or add a new one.");
      return;
    } else {
      setServiceOdometer(selectedVehicle.odometer ? selectedVehicle.odometer.toString() : "");
    }
    setStep(2);
  };

  const handleLaunchService = async () => {
    if (selectedWorkTypes.length === 0) {
      Alert.alert("Type of Work Required", "Please select at least one type of work.");
      return;
    }
    setSubmittingService(true);
    try {
      let vehicleId = selectedVehicle?._id;
      let customerId = selectedVehicle?.customer?._id || selectedVehicle?.customer;

      // 1. If this was a new truck, create the vehicle first
      if (isNewTruckMode) {
        const createdVehicle = await workshopEmployeeService.addVehicle({
          registration: newRego.trim().toUpperCase(),
          vehicleType: newVehicleType,
          make: newMake.trim(),
          model: newModel.trim(),
          year: newYear ? Number(newYear) : undefined,
          vin: newVin.trim(),
          odometer: serviceOdometer ? Number(serviceOdometer) : (newOdometer ? Number(newOdometer) : 0),
          customerName: newCustomerName.trim() || undefined,
          status: "IN_WORKSHOP",
        });
        vehicleId = createdVehicle._id;
        customerId = createdVehicle.customer?._id || createdVehicle.customer;
      }

      const primaryJobType = selectedWorkTypes.includes("General Service")
        ? "General Service"
        : selectedWorkTypes[0] || "Repair";

      const priorityValue = jobPriority === "Vehicle Off Road" ? "Critical" : jobPriority;

      const intakePayload = {
        workTypes: selectedWorkTypes,
        customerComplaint: customerComplaint.trim(),
        workRequired: workRequired.trim(),
        faultCodes: faultCodes.trim(),
        additionalNotes: additionalNotes.trim(),
        vehicleOffRoad: jobPriority === "Vehicle Off Road",
        intakePhotos: intakePhotos,
      };

      // 2. Launch the work order / service intake
      const workOrder = await workshopEmployeeService.startVehicleService({
        vehicleId,
        customerId,
        jobType: primaryJobType,
        priority: priorityValue,
        odometer: serviceOdometer ? Number(serviceOdometer) : undefined,
        description:
          workRequired.trim() ||
          customerComplaint.trim() ||
          selectedWorkTypes.join(", "),
        intakeDetails: intakePayload,
        status: "IN_PROGRESS",
      });

      Alert.alert(
        "Job Card Created! 🎉",
        `Job Card ${workOrder.jobNumber} for ${workOrder.vehicle?.registration || "truck"} is created and active in workshop.`,
        [
          {
            text: "Open Job Card",
            onPress: () => {
              navigation.replace(ROUTES.WORKSHOP_EMPLOYEE_JOB_DETAILS, {
                id: workOrder._id,
              });
            },
          },
        ]
      );
    } catch (err) {
      console.error("Error creating job card:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to create job card.");
    } finally {
      setSubmittingService(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E2E8F0",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            if (step === 2) {
              setStep(1);
            } else {
              navigation.goBack();
            }
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: "#F1F5F9",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 17, fontWeight: "800", color: "#0F172A" }}>
            {step === 1 ? "Select / Add Truck" : "Start Service Job"}
          </Text>
          <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>
            {step === 1 ? "Step 1 of 2: Vehicle Intake" : "Step 2 of 2: Service Details"}
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* STEP 1: SEARCH, PAST SERVICE HISTORY, OR ADD NEW TRUCK */}
          {step === 1 && (
            <View>
              {/* Search Bar Container */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#0F172A", marginBottom: 6 }}>
                  Enter Truck Registration / Plate #
                </Text>
                <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>
                  Search workshop records to see previous services or add a new truck.
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View
                    style={{
                      flex: 1,
                      height: 48,
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#F8FAFC",
                      borderWidth: 1.5,
                      borderColor: searchRego ? "#2563EB" : "#CBD5E1",
                      borderRadius: 12,
                      paddingLeft: 12,
                      paddingRight: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 6,
                      }}
                    >
                      <Ionicons name="search" size={19} color="#64748B" />
                    </View>
                    <TextInput
                      style={{
                        flex: 1,
                        height: "100%",
                        fontSize: 15,
                        fontWeight: "700",
                        color: "#0F172A",
                        textTransform: "uppercase",
                        paddingVertical: 0,
                        paddingHorizontal: 0,
                        margin: 0,
                        textAlignVertical: "center",
                      }}
                      placeholder="e.g. TRK-104 or VIC-992"
                      placeholderTextColor="#94A3B8"
                      value={searchRego}
                      onChangeText={(val) => {
                        setSearchRego(val);
                        if (!val.trim()) {
                          setMatchingVehicles([]);
                          setSearchPerformed(false);
                        }
                      }}
                      onSubmitEditing={() => handleSearch(searchRego)}
                      autoCapitalize="characters"
                      returnKeyType="search"
                    />
                    {searchRego ? (
                      <TouchableOpacity
                        onPress={() => {
                          setSearchRego("");
                          setMatchingVehicles([]);
                          setSearchPerformed(false);
                          setSelectedVehicle(null);
                          setVehicleHistory(null);
                        }}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        style={{
                          width: 26,
                          height: "100%",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons name="close-circle" size={18} color="#94A3B8" />
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <TouchableOpacity
                    disabled={searching || !searchRego.trim()}
                    onPress={() => handleSearch(searchRego)}
                    activeOpacity={0.8}
                    style={{
                      height: 48,
                      paddingHorizontal: 18,
                      backgroundColor: searchRego.trim() ? "#2563EB" : "#94A3B8",
                      borderRadius: 12,
                      justifyContent: "center",
                      alignItems: "center",
                      minWidth: 80,
                    }}
                  >
                    {searching ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}>
                        Search
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* SEARCH RESULTS / MATCHING TRUCKS */}
              {matchingVehicles.length > 0 && !selectedVehicle && !isNewTruckMode && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 8 }}>
                    Matching Trucks ({matchingVehicles.length}):
                  </Text>
                  {matchingVehicles.map((item) => (
                    <TouchableOpacity
                      key={item._id}
                      activeOpacity={0.85}
                      onPress={() => selectExistingVehicle(item)}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 12,
                        padding: 14,
                        marginBottom: 10,
                        borderWidth: 1,
                        borderColor: "#CBD5E1",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                          <View
                            style={{
                              backgroundColor: "#EFF6FF",
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 6,
                              marginRight: 8,
                              borderWidth: 1,
                              borderColor: "#BFDBFE",
                            }}
                          >
                            <Text style={{ fontSize: 13, fontWeight: "800", color: "#1E40AF" }}>
                              {item.registration}
                            </Text>
                          </View>
                          <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B" }}>
                            {item.vehicleType}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>
                          {item.make} {item.model} {item.year ? `(${item.year})` : ""}
                        </Text>
                        {item.customer && (
                          <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                            Fleet / Customer: {item.customer.companyName || item.customer.fullName}
                          </Text>
                        )}
                      </View>

                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={{ fontSize: 12, fontWeight: "700", color: "#2563EB" }}>
                          Select →
                        </Text>
                        {item.odometer ? (
                          <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>
                            {item.odometer.toLocaleString()} km
                          </Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* TRUCK FOUND CARD & FULL PAST SERVICE HISTORY */}
              {selectedVehicle && !isNewTruckMode && (
                <View style={{ marginBottom: 16 }}>
                  {/* Unified Vehicle Summary Card */}
                  <View
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 14,
                      marginBottom: 14,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      overflow: "hidden",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                  >
                    {/* Header Bar with Verified Status */}
                    <View
                      style={{
                        backgroundColor: "#F0FDF4",
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: "#DCFCE7",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Ionicons name="checkmark-circle" size={18} color="#16A34A" style={{ marginRight: 6 }} />
                        <Text style={{ fontSize: 13, fontWeight: "800", color: "#166534" }}>
                          Vehicle Verified in Workshop
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          setSelectedVehicle(null);
                          setVehicleHistory(null);
                        }}
                        style={{
                          backgroundColor: "#DCFCE7",
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 6,
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: "700", color: "#15803D" }}>Change</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Body */}
                    <View style={{ padding: 14 }}>
                      {/* Plate Badge & Title */}
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                        <View
                          style={{
                            backgroundColor: "#F8FAFC",
                            borderWidth: 1.5,
                            borderColor: "#CBD5E1",
                            borderRadius: 8,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            marginRight: 10,
                          }}
                        >
                          <Text style={{ fontSize: 15, fontWeight: "900", color: "#0F172A", letterSpacing: 0.5 }}>
                            {selectedVehicle.registration}
                          </Text>
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }} numberOfLines={1}>
                            {selectedVehicle.make} {selectedVehicle.model} {selectedVehicle.year ? `(${selectedVehicle.year})` : ""}
                          </Text>
                          <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600", marginTop: 2 }}>
                            Type: {selectedVehicle.vehicleType || "Truck"}
                          </Text>
                        </View>
                      </View>

                      {/* Specs 2-Column Grid */}
                      <View
                        style={{
                          backgroundColor: "#F8FAFC",
                          borderRadius: 10,
                          padding: 12,
                          gap: 8,
                        }}
                      >
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>Last Odometer</Text>
                            <Text style={{ fontSize: 14, fontWeight: "800", color: "#2563EB", marginTop: 2 }}>
                              {selectedVehicle.odometer ? `${selectedVehicle.odometer.toLocaleString()} km` : "N/A"}
                            </Text>
                          </View>
                          <View style={{ flex: 1, paddingLeft: 12 }}>
                            <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>Customer / Fleet</Text>
                            <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginTop: 2 }} numberOfLines={1}>
                              {selectedVehicle.customer?.companyName || selectedVehicle.customer?.fullName || "Direct Customer"}
                            </Text>
                          </View>
                        </View>

                        {selectedVehicle.vin ? (
                          <View style={{ borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 8, marginTop: 4 }}>
                            <Text style={{ fontSize: 10, color: "#94A3B8", fontWeight: "600" }}>VIN / Chassis Number</Text>
                            <Text style={{ fontSize: 11, fontWeight: "600", color: "#475569", marginTop: 1 }}>
                              {selectedVehicle.vin}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </View>

                  {/* PAST SERVICES & REPAIR HISTORY */}
                  <View
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 14,
                      padding: 16,
                      marginBottom: 16,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            backgroundColor: "#FEF3C7",
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 8,
                          }}
                        >
                          <Ionicons name="time" size={18} color="#D97706" />
                        </View>
                        <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
                          Past Service & Repair Records
                        </Text>
                      </View>

                      {vehicleHistory?.workOrders?.length ? (
                        <View style={{ backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                          <Text style={{ fontSize: 11, fontWeight: "700", color: "#475569" }}>
                            {vehicleHistory.workOrders.length} {vehicleHistory.workOrders.length === 1 ? "Job" : "Jobs"}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {loadingHistory ? (
                      <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 20 }} />
                    ) : (
                      (() => {
                        const pastWorkOrders = vehicleHistory?.workOrders || [];
                        const pastServices = vehicleHistory?.services || [];
                        const pastInspections = vehicleHistory?.inspections || [];

                        if (pastWorkOrders.length === 0 && pastServices.length === 0 && pastInspections.length === 0) {
                          return (
                            <View style={{ backgroundColor: "#F8FAFC", padding: 16, borderRadius: 10, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" }}>
                              <Ionicons name="document-text-outline" size={28} color="#94A3B8" style={{ marginBottom: 4 }} />
                              <Text style={{ fontSize: 13, fontWeight: "600", color: "#64748B" }}>
                                No previous services logged for this truck yet.
                              </Text>
                              <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
                                This will be the first service recorded in the workshop.
                              </Text>
                            </View>
                          );
                        }

                        return (
                          <View style={{ gap: 10 }}>
                            {pastWorkOrders.map((wo, idx) => {
                              const isCompleted = wo.status === "COMPLETED";
                              const isWaitingParts = wo.status === "WAITING_FOR_PARTS";
                              const accentColor = isCompleted ? "#10B981" : isWaitingParts ? "#F97316" : "#2563EB";

                              return (
                                <View
                                  key={wo._id || idx}
                                  style={{
                                    backgroundColor: "#FFFFFF",
                                    borderRadius: 12,
                                    padding: 12,
                                    borderWidth: 1,
                                    borderColor: "#E2E8F0",
                                    borderLeftWidth: 4,
                                    borderLeftColor: accentColor,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.04,
                                    shadowRadius: 2,
                                    elevation: 1,
                                  }}
                                >
                                  {/* Top Header Row with guaranteed flex protection so badge never overflows */}
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "flex-start",
                                      justifyContent: "space-between",
                                      marginBottom: 6,
                                      gap: 8,
                                    }}
                                  >
                                    <View style={{ flex: 1, marginRight: 4 }}>
                                      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                                        <View
                                          style={{
                                            backgroundColor: "#EFF6FF",
                                            paddingHorizontal: 6,
                                            paddingVertical: 2,
                                            borderRadius: 4,
                                          }}
                                        >
                                          <Text style={{ fontSize: 11, fontWeight: "800", color: "#1D4ED8" }}>
                                            {wo.jobNumber}
                                          </Text>
                                        </View>
                                        <Text
                                          style={{ fontSize: 13, fontWeight: "700", color: "#0F172A", flexShrink: 1 }}
                                          numberOfLines={1}
                                        >
                                          {wo.jobType}
                                        </Text>
                                      </View>
                                    </View>

                                    {/* Status Badge with fixed sizing */}
                                    <WorkshopStatusBadge status={wo.status} size="small" />
                                  </View>

                                  {/* Metadata: Date, Tech, Odometer */}
                                  <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                      <Ionicons name="calendar-outline" size={12} color="#64748B" style={{ marginRight: 3 }} />
                                      <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>
                                        {new Date(wo.dateReceived || wo.createdAt).toLocaleDateString()}
                                      </Text>
                                    </View>
                                    {wo.assignedMechanic ? (
                                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <Ionicons name="person-outline" size={12} color="#64748B" style={{ marginRight: 3 }} />
                                        <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>
                                          {wo.assignedMechanic}
                                        </Text>
                                      </View>
                                    ) : null}
                                    {wo.odometer ? (
                                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <Ionicons name="speedometer-outline" size={12} color="#64748B" style={{ marginRight: 3 }} />
                                        <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>
                                          {wo.odometer.toLocaleString()} km
                                        </Text>
                                      </View>
                                    ) : null}
                                  </View>

                                  {/* Work Scope / Description Card */}
                                  {wo.description ? (
                                    <View
                                      style={{
                                        backgroundColor: "#F8FAFC",
                                        borderRadius: 8,
                                        paddingHorizontal: 10,
                                        paddingVertical: 8,
                                        borderWidth: 1,
                                        borderColor: "#F1F5F9",
                                        marginTop: 2,
                                        marginBottom: 4,
                                      }}
                                    >
                                      <Text style={{ fontSize: 12, color: "#334155", lineHeight: 17 }} numberOfLines={3}>
                                        {wo.description}
                                      </Text>
                                    </View>
                                  ) : null}

                                  {/* Checklist Status */}
                                  {wo.checklist?.isCompleted ? (
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        marginTop: 4,
                                        backgroundColor: "#F0FDF4",
                                        paddingHorizontal: 8,
                                        paddingVertical: 4,
                                        borderRadius: 6,
                                        alignSelf: "flex-start",
                                      }}
                                    >
                                      <Ionicons name="checkmark-done-circle" size={14} color="#16A34A" style={{ marginRight: 4 }} />
                                      <Text style={{ fontSize: 11, color: "#15803D", fontWeight: "700" }}>
                                        {wo.checklist.checklistType?.replace(/_/g, " ")} Checklist Done
                                      </Text>
                                    </View>
                                  ) : null}
                                </View>
                              );
                            })}
                          </View>
                        );
                      })()
                    )}
                  </View>
                </View>
              )}

              {/* SEARCH PERFORMED BUT NO TRUCK FOUND OR OPTION TO ADD NEW */}
              {(searchPerformed && matchingVehicles.length === 0 && !isNewTruckMode) && (
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 14,
                    padding: 20,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    marginBottom: 16,
                  }}
                >
                  <Ionicons name="alert-circle-outline" size={44} color="#F59E0B" style={{ marginBottom: 10 }} />
                  <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A", textAlign: "center" }}>
                    No Records for "{searchRego.toUpperCase()}"
                  </Text>
                  <Text style={{ fontSize: 12, color: "#64748B", textAlign: "center", marginTop: 4, marginBottom: 16, lineHeight: 18 }}>
                    This truck hasn't been serviced here before. Add it now to log registration, specs, and start service.
                  </Text>

                  <TouchableOpacity
                    onPress={handleStartNewTruckForm}
                    style={{
                      backgroundColor: "#16A34A",
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      borderRadius: 10,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="add-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>
                      Add New Truck to Workshop
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* NEW TRUCK INTAKE FORM */}
              {isNewTruckMode && (
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: "#CBD5E1",
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
                      Add New Truck to Workshop
                    </Text>
                    <TouchableOpacity onPress={() => setIsNewTruckMode(false)}>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B" }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Registration */}
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 4 }}>
                      Truck Registration / Plate # *
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#F8FAFC",
                        borderWidth: 1,
                        borderColor: "#CBD5E1",
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        height: 42,
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#0F172A",
                        textTransform: "uppercase",
                      }}
                      placeholder="e.g. TRK-992"
                      placeholderTextColor="#94A3B8"
                      value={newRego}
                      onChangeText={setNewRego}
                      autoCapitalize="characters"
                    />
                  </View>

                  {/* Vehicle Type Pills */}
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                      Vehicle Type
                    </Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                      {VEHICLE_TYPES.map((vt) => {
                        const isSelected = newVehicleType === vt;
                        return (
                          <TouchableOpacity
                            key={vt}
                            onPress={() => setNewVehicleType(vt)}
                            style={{
                              backgroundColor: isSelected ? "#2563EB" : "#F1F5F9",
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 6,
                              borderWidth: 1,
                              borderColor: isSelected ? "#2563EB" : "#E2E8F0",
                            }}
                          >
                            <Text style={{ fontSize: 12, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                              {vt}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Make & Model */}
                  <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 4 }}>
                        Make
                      </Text>
                      <TextInput
                        style={{
                          backgroundColor: "#F8FAFC",
                          borderWidth: 1,
                          borderColor: "#CBD5E1",
                          borderRadius: 8,
                          paddingHorizontal: 10,
                          height: 42,
                          fontSize: 13,
                          color: "#0F172A",
                        }}
                        placeholder="e.g. Kenworth / Volvo"
                        placeholderTextColor="#94A3B8"
                        value={newMake}
                        onChangeText={setNewMake}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 4 }}>
                        Model
                      </Text>
                      <TextInput
                        style={{
                          backgroundColor: "#F8FAFC",
                          borderWidth: 1,
                          borderColor: "#CBD5E1",
                          borderRadius: 8,
                          paddingHorizontal: 10,
                          height: 42,
                          fontSize: 13,
                          color: "#0F172A",
                        }}
                        placeholder="e.g. T909 / FH16"
                        placeholderTextColor="#94A3B8"
                        value={newModel}
                        onChangeText={setNewModel}
                      />
                    </View>
                  </View>

                  {/* Current Odometer & Year */}
                  <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 4 }}>
                        Current Odometer (km)
                      </Text>
                      <TextInput
                        style={{
                          backgroundColor: "#F8FAFC",
                          borderWidth: 1,
                          borderColor: "#CBD5E1",
                          borderRadius: 8,
                          paddingHorizontal: 10,
                          height: 42,
                          fontSize: 13,
                          color: "#0F172A",
                        }}
                        placeholder="e.g. 150000"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        value={newOdometer}
                        onChangeText={setNewOdometer}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 4 }}>
                        Year
                      </Text>
                      <TextInput
                        style={{
                          backgroundColor: "#F8FAFC",
                          borderWidth: 1,
                          borderColor: "#CBD5E1",
                          borderRadius: 8,
                          paddingHorizontal: 10,
                          height: 42,
                          fontSize: 13,
                          color: "#0F172A",
                        }}
                        placeholder="e.g. 2024"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        value={newYear}
                        onChangeText={setNewYear}
                      />
                    </View>
                  </View>

                  {/* VIN & Customer / Fleet Name */}
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 4 }}>
                      Customer / Fleet Company Name (Optional)
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#F8FAFC",
                        borderWidth: 1,
                        borderColor: "#CBD5E1",
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        height: 42,
                        fontSize: 13,
                        color: "#0F172A",
                      }}
                      placeholder="e.g. Toll Transport / Direct Fleet"
                      placeholderTextColor="#94A3B8"
                      value={newCustomerName}
                      onChangeText={setNewCustomerName}
                    />
                  </View>

                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 4 }}>
                      VIN / Chassis # (Optional)
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#F8FAFC",
                        borderWidth: 1,
                        borderColor: "#CBD5E1",
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        height: 42,
                        fontSize: 13,
                        color: "#0F172A",
                      }}
                      placeholder="17-character VIN"
                      placeholderTextColor="#94A3B8"
                      value={newVin}
                      onChangeText={setNewVin}
                    />
                  </View>

                  {/* Proceed Button */}
                  <TouchableOpacity
                    onPress={handleProceedToService}
                    style={{
                      backgroundColor: "#16A34A",
                      borderRadius: 10,
                      paddingVertical: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF", marginRight: 6 }}>
                      Save Truck & Proceed to Service
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* STEP 2: TRUCK REPAIR – QUICK JOB INTAKE FORM */}
          {step === 2 && (
            <View>
              {/* Form Title Banner */}
              <View
                style={{
                  backgroundColor: "#1E293B",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: "800", color: "#60A5FA", textTransform: "uppercase", letterSpacing: 0.8 }}>
                      Workshop Floor Intake
                    </Text>
                    <Text style={{ fontSize: 17, fontWeight: "900", color: "#FFFFFF", marginTop: 2 }}>
                      TRUCK REPAIR – QUICK JOB INTAKE
                    </Text>
                    <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                      Enter truck details and repair problem before starting work
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setStep(1)}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.12)",
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#F8FAFC" }}>Change Truck</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* SECTION 1: TRUCK DETAILS */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      backgroundColor: "#EFF6FF",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 8,
                    }}
                  >
                    <Ionicons name="bus-outline" size={16} color="#2563EB" />
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
                    1. Truck Details
                  </Text>
                </View>

                {/* Truck Badge & Summary */}
                <View
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderRadius: 10,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "700" }}>Registration *</Text>
                    <View style={{ backgroundColor: "#0F172A", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 }}>
                      <Text style={{ fontSize: 14, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.5 }}>
                        {isNewTruckMode ? newRego.toUpperCase() : selectedVehicle?.registration}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 6, marginTop: 4 }}>
                    <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}>Make & Model *</Text>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#0F172A" }}>
                      {isNewTruckMode
                        ? `${newMake || "Custom"} ${newModel || "Truck"} ${newYear ? `(${newYear})` : ""}`
                        : `${selectedVehicle?.make} ${selectedVehicle?.model} ${selectedVehicle?.year ? `(${selectedVehicle?.year})` : ""}`}
                    </Text>
                  </View>

                  {((isNewTruckMode ? newVin : selectedVehicle?.vin)) ? (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 6, marginTop: 4 }}>
                      <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}>VIN / Chassis</Text>
                      <Text style={{ fontSize: 12, fontWeight: "600", color: "#334155" }}>
                        {isNewTruckMode ? newVin : selectedVehicle?.vin}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Odometer Input */}
                <View>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 4 }}>
                    Odometer (km) *
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: "#F8FAFC",
                      borderWidth: 1,
                      borderColor: "#CBD5E1",
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      height: 42,
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#0F172A",
                    }}
                    placeholder="e.g. 154200"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={serviceOdometer}
                    onChangeText={setServiceOdometer}
                  />
                </View>
              </View>

              {/* SECTION 2: TYPE OF WORK (Multi-Select) */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 7,
                        backgroundColor: "#FEF3C7",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 8,
                      }}
                    >
                      <Ionicons name="construct-outline" size={16} color="#D97706" />
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
                      2. Type of Work *
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>Select one or more</Text>
                </View>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {INTAKE_WORK_TYPES.map((wt) => {
                    const isSelected = selectedWorkTypes.includes(wt);
                    return (
                      <TouchableOpacity
                        key={wt}
                        activeOpacity={0.7}
                        onPress={() => toggleWorkType(wt)}
                        style={{
                          backgroundColor: isSelected ? "#2563EB" : "#F8FAFC",
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                          borderWidth: 1.5,
                          borderColor: isSelected ? "#2563EB" : "#E2E8F0",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        {isSelected ? (
                          <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                        ) : (
                          <Ionicons name="square-outline" size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                        )}
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "700",
                            color: isSelected ? "#FFFFFF" : "#334155",
                          }}
                        >
                          {wt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* SECTION 3: REPAIR DETAILS */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      backgroundColor: "#FEE2E2",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 8,
                    }}
                  >
                    <Ionicons name="chatbox-ellipses-outline" size={16} color="#DC2626" />
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
                    3. Repair Details
                  </Text>
                </View>

                {/* Customer Complaint */}
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 4 }}>
                    Customer Complaint: What is the problem?
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: "#F8FAFC",
                      borderWidth: 1,
                      borderColor: "#CBD5E1",
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      fontSize: 13,
                      color: "#0F172A",
                      minHeight: 56,
                      textAlignVertical: "top",
                    }}
                    placeholder="e.g. Air pressure dropping overnight, grinding sound when braking on steer axle..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    value={customerComplaint}
                    onChangeText={setCustomerComplaint}
                  />
                </View>

                {/* Work Required */}
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 4 }}>
                    Work Required: What needs to be repaired?
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: "#F8FAFC",
                      borderWidth: 1,
                      borderColor: "#CBD5E1",
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      fontSize: 13,
                      color: "#0F172A",
                      minHeight: 56,
                      textAlignVertical: "top",
                    }}
                    placeholder="e.g. Inspect air line fittings, replace drive brake linings, complete lube service..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    value={workRequired}
                    onChangeText={setWorkRequired}
                  />
                </View>

                {/* Dashboard Warning / Fault Codes */}
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 4 }}>
                    Dashboard Warning / Fault Codes
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: "#F8FAFC",
                      borderWidth: 1,
                      borderColor: "#CBD5E1",
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      height: 42,
                      fontSize: 13,
                      color: "#0F172A",
                    }}
                    placeholder="e.g. ABS Warning Light ON, SPN 3216 FMI 20, P0101"
                    placeholderTextColor="#94A3B8"
                    value={faultCodes}
                    onChangeText={setFaultCodes}
                  />
                </View>

                {/* Additional Notes */}
                <View>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 4 }}>
                    Additional Notes
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: "#F8FAFC",
                      borderWidth: 1,
                      borderColor: "#CBD5E1",
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      fontSize: 13,
                      color: "#0F172A",
                      minHeight: 48,
                      textAlignVertical: "top",
                    }}
                    placeholder="Driver mentioned trailer air line fitting is also slightly loose..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    value={additionalNotes}
                    onChangeText={setAdditionalNotes}
                  />
                </View>
              </View>

              {/* SECTION 4: JOB PRIORITY */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      backgroundColor: "#F3E8FF",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 8,
                    }}
                  >
                    <Ionicons name="flag-outline" size={16} color="#7C3AED" />
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
                    4. Job Priority
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  {JOB_PRIORITIES.map((jp) => {
                    const isSelected = jobPriority === jp.label;
                    const isVOR = jp.label === "Vehicle Off Road";
                    return (
                      <TouchableOpacity
                        key={jp.label}
                        onPress={() => setJobPriority(jp.label)}
                        style={{
                          flex: 1,
                          backgroundColor: isSelected
                            ? isVOR
                              ? "#FEF2F2"
                              : jp.label === "Urgent"
                              ? "#FFFBEB"
                              : "#F0FDF4"
                            : "#F8FAFC",
                          borderWidth: isSelected ? 2 : 1,
                          borderColor: isSelected ? jp.color : "#E2E8F0",
                          borderRadius: 10,
                          paddingVertical: 10,
                          paddingHorizontal: 6,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons
                          name={isVOR ? "warning" : jp.label === "Urgent" ? "alert-circle" : "checkmark-circle"}
                          size={18}
                          color={isSelected ? jp.color : "#94A3B8"}
                          style={{ marginBottom: 4 }}
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "800",
                            color: isSelected ? jp.color : "#64748B",
                            textAlign: "center",
                          }}
                        >
                          {jp.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* SECTION 5: PHOTOS / DOCUMENTS */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 7,
                        backgroundColor: "#E0F2FE",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 8,
                      }}
                    >
                      <Ionicons name="camera-outline" size={16} color="#0284C7" />
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
                      5. Photos / Documents
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>
                    {intakePhotos.length} Attached
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>
                  Upload Truck Photos, Damage Photos, Diagnostic Reports
                </Text>

                <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
                  <TouchableOpacity
                    onPress={handleTakeIntakePhoto}
                    style={{
                      flex: 1,
                      backgroundColor: "#F1F5F9",
                      borderRadius: 10,
                      paddingVertical: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                      borderWidth: 1,
                      borderColor: "#CBD5E1",
                    }}
                  >
                    <Ionicons name="camera" size={18} color="#1E293B" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E293B" }}>Take Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handlePickIntakePhoto}
                    style={{
                      flex: 1,
                      backgroundColor: "#F1F5F9",
                      borderRadius: 10,
                      paddingVertical: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                      borderWidth: 1,
                      borderColor: "#CBD5E1",
                    }}
                  >
                    <Ionicons name="images" size={18} color="#1E293B" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E293B" }}>Upload Files</Text>
                  </TouchableOpacity>
                </View>

                {/* Photo Previews Grid */}
                {intakePhotos.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                    {intakePhotos.map((uri, idx) => (
                      <View key={idx} style={{ position: "relative" }}>
                        <Image
                          source={{ uri }}
                          style={{ width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: "#CBD5E1" }}
                        />
                        <TouchableOpacity
                          onPress={() => handleRemovePhoto(idx)}
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            backgroundColor: "#DC2626",
                            width: 22,
                            height: 22,
                            borderRadius: 11,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Ionicons name="close" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* SECTION 6: EMPLOYEE DETAILS (Auto-Filled) */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      backgroundColor: "#F1F5F9",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 8,
                    }}
                  >
                    <Ionicons name="person-circle-outline" size={18} color="#475569" />
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
                    6. Employee Details
                  </Text>
                  <View style={{ marginLeft: "auto", backgroundColor: "#F0FDF4", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#16A34A" }}>Auto-filled</Text>
                  </View>
                </View>

                <View style={{ backgroundColor: "#F8FAFC", borderRadius: 10, padding: 12, gap: 6, borderWidth: 1, borderColor: "#F1F5F9" }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}>Employee Name</Text>
                    <Text style={{ fontSize: 13, fontWeight: "800", color: "#0F172A" }}>
                      {user?.name || "Workshop Technician"}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}>Date</Text>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155" }}>
                      {new Date().toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" })}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}>Time</Text>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155" }}>
                      {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                </View>
              </View>

              {/* SECTION 7: SUBMIT BUTTON [ CREATE JOB CARD ] */}
              <TouchableOpacity
                activeOpacity={0.88}
                disabled={submittingService}
                onPress={handleLaunchService}
                style={{
                  backgroundColor: "#2563EB",
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  shadowColor: "#2563EB",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                  marginBottom: 30,
                }}
              >
                {submittingService ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="card-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 17, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.5 }}>
                      CREATE JOB CARD
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Sticky Bottom Action Footer (Step 1 with Selected Vehicle) */}
        {step === 1 && selectedVehicle && !isNewTruckMode && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: Platform.OS === "ios" ? 14 : 12,
              borderTopWidth: 1,
              borderTopColor: "#E2E8F0",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.05,
              shadowRadius: 5,
              elevation: 8,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleProceedToService}
              style={{
                backgroundColor: "#2563EB",
                borderRadius: 12,
                height: 48,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                shadowColor: "#2563EB",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "800", color: "#FFFFFF", marginRight: 6 }}>
                Start Next Service on this Truck
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
