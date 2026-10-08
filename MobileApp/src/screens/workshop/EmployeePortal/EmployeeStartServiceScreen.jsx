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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopEmployeeService } from "../../../services/workshopEmployeeService";
import WorkshopStatusBadge from "../../../components/workshop/WorkshopStatusBadge";

const VEHICLE_TYPES = ["Truck", "Trailer", "Van", "Ute", "Car", "Other"];
const SERVICE_TYPES = [
  "Lube Service",
  "Basic Service",
  "Annual Service",
  "Inspection",
  "Repair",
  "Other",
];
const PRIORITIES = ["Normal", "Urgent", "Critical"];

export default function EmployeeStartServiceScreen() {
  const navigation = useNavigation();

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

  // Service Intake Form State
  const [step, setStep] = useState(1); // 1: Search/Select/Add Truck, 2: Service Intake Details
  const [serviceType, setServiceType] = useState("Lube Service");
  const [priority, setPriority] = useState("Normal");
  const [serviceOdometer, setServiceOdometer] = useState("");
  const [description, setDescription] = useState("");
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
    }
    setStep(2);
  };

  const handleLaunchService = async () => {
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
          odometer: newOdometer ? Number(newOdometer) : 0,
          customerName: newCustomerName.trim() || undefined,
          status: "IN_WORKSHOP",
        });
        vehicleId = createdVehicle._id;
        customerId = createdVehicle.customer?._id || createdVehicle.customer;
      }

      // 2. Launch the work order / service intake
      const workOrder = await workshopEmployeeService.startVehicleService({
        vehicleId,
        customerId,
        jobType: serviceType,
        priority,
        odometer: serviceOdometer ? Number(serviceOdometer) : undefined,
        description: description.trim() || `${serviceType} started by mechanic`,
        status: "IN_PROGRESS",
      });

      Alert.alert(
        "Service Started! 🚀",
        `Job ${workOrder.jobNumber} for ${workOrder.vehicle?.registration || "truck"} is now active in workshop.`,
        [
          {
            text: "Open Job Details",
            onPress: () => {
              navigation.replace(ROUTES.WORKSHOP_EMPLOYEE_JOB_DETAILS, {
                id: workOrder._id,
              });
            },
          },
        ]
      );
    } catch (err) {
      console.error("Error launching service:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to start service.");
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

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#F8FAFC",
                      borderWidth: 1.5,
                      borderColor: "#CBD5E1",
                      borderRadius: 10,
                      paddingHorizontal: 12,
                    }}
                  >
                    <Ionicons name="search" size={18} color="#64748B" style={{ marginRight: 6 }} />
                    <TextInput
                      style={{
                        flex: 1,
                        height: 44,
                        fontSize: 15,
                        fontWeight: "700",
                        color: "#0F172A",
                        textTransform: "uppercase",
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
                      >
                        <Ionicons name="close-circle" size={18} color="#94A3B8" />
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <TouchableOpacity
                    disabled={searching || !searchRego.trim()}
                    onPress={() => handleSearch(searchRego)}
                    style={{
                      backgroundColor: searchRego.trim() ? "#2563EB" : "#94A3B8",
                      borderRadius: 10,
                      paddingHorizontal: 16,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {searching ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>
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
                      <View>
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
                  {/* Found Header Banner */}
                  <View
                    style={{
                      backgroundColor: "#ECFDF5",
                      borderWidth: 1,
                      borderColor: "#A7F3D0",
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <Ionicons name="checkmark-circle" size={22} color="#10B981" style={{ marginRight: 8 }} />
                      <View>
                        <Text style={{ fontSize: 13, fontWeight: "800", color: "#065F46" }}>
                          Truck Found in Workshop Records
                        </Text>
                        <Text style={{ fontSize: 11, color: "#047857" }}>
                          Registration: {selectedVehicle.registration}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedVehicle(null);
                        setVehicleHistory(null);
                      }}
                      style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#059669" }}>
                        Change
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Vehicle Specs Summary Card */}
                  <View
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 14,
                      padding: 16,
                      marginBottom: 14,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A", marginBottom: 10 }}>
                      {selectedVehicle.make} {selectedVehicle.model} {selectedVehicle.year ? `(${selectedVehicle.year})` : ""}
                    </Text>

                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                      <View style={{ width: "48%" }}>
                        <Text style={{ fontSize: 11, color: "#64748B" }}>Vehicle Type:</Text>
                        <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E293B" }}>
                          {selectedVehicle.vehicleType}
                        </Text>
                      </View>
                      <View style={{ width: "48%" }}>
                        <Text style={{ fontSize: 11, color: "#64748B" }}>Last Odometer:</Text>
                        <Text style={{ fontSize: 13, fontWeight: "700", color: "#2563EB" }}>
                          {selectedVehicle.odometer ? `${selectedVehicle.odometer.toLocaleString()} km` : "N/A"}
                        </Text>
                      </View>
                      <View style={{ width: "48%" }}>
                        <Text style={{ fontSize: 11, color: "#64748B" }}>VIN / Chassis:</Text>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: "#334155" }}>
                          {selectedVehicle.vin || "Not recorded"}
                        </Text>
                      </View>
                      <View style={{ width: "48%" }}>
                        <Text style={{ fontSize: 11, color: "#64748B" }}>Customer / Fleet:</Text>
                        <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155" }}>
                          {selectedVehicle.customer?.companyName || selectedVehicle.customer?.fullName || "General"}
                        </Text>
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
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
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

                    {loadingHistory ? (
                      <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 16 }} />
                    ) : (
                      (() => {
                        const pastWorkOrders = vehicleHistory?.workOrders || [];
                        const pastServices = vehicleHistory?.services || [];
                        const pastInspections = vehicleHistory?.inspections || [];

                        if (pastWorkOrders.length === 0 && pastServices.length === 0 && pastInspections.length === 0) {
                          return (
                            <View style={{ backgroundColor: "#F8FAFC", padding: 14, borderRadius: 8, alignItems: "center" }}>
                              <Text style={{ fontSize: 12, color: "#64748B", fontStyle: "italic" }}>
                                No previous services logged for this vehicle yet.
                              </Text>
                            </View>
                          );
                        }

                        return (
                          <View style={{ gap: 10 }}>
                            {pastWorkOrders.map((wo, idx) => (
                              <View
                                key={wo._id || idx}
                                style={{
                                  backgroundColor: "#F8FAFC",
                                  borderRadius: 10,
                                  padding: 12,
                                  borderLeftWidth: 3,
                                  borderLeftColor: wo.status === "COMPLETED" ? "#10B981" : "#2563EB",
                                }}
                              >
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                  <Text style={{ fontSize: 13, fontWeight: "800", color: "#0F172A" }}>
                                    {wo.jobNumber}: {wo.jobType}
                                  </Text>
                                  <WorkshopStatusBadge status={wo.status} />
                                </View>

                                <Text style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>
                                  Date: {new Date(wo.dateReceived || wo.createdAt).toLocaleDateString()}
                                  {wo.assignedMechanic ? ` • Tech: ${wo.assignedMechanic}` : ""}
                                </Text>

                                {wo.description ? (
                                  <Text style={{ fontSize: 12, color: "#334155", marginBottom: 4 }} numberOfLines={2}>
                                    {wo.description}
                                  </Text>
                                ) : null}

                                {wo.checklist?.isCompleted ? (
                                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                                    <Ionicons name="checkmark-done" size={14} color="#10B981" style={{ marginRight: 4 }} />
                                    <Text style={{ fontSize: 11, color: "#059669", fontWeight: "700" }}>
                                      {wo.checklist.checklistType?.replace(/_/g, " ")} Checklist Completed
                                    </Text>
                                  </View>
                                ) : null}
                              </View>
                            ))}
                          </View>
                        );
                      })()
                    )}
                  </View>

                  {/* Button to proceed to service */}
                  <TouchableOpacity
                    onPress={handleProceedToService}
                    style={{
                      backgroundColor: "#2563EB",
                      borderRadius: 12,
                      paddingVertical: 14,
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                    }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: "800", color: "#FFFFFF", marginRight: 6 }}>
                      Start Next Service on this Truck
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
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

          {/* STEP 2: SERVICE INTAKE DETAILS */}
          {step === 2 && (
            <View>
              {/* Selected Truck Banner */}
              <View
                style={{
                  backgroundColor: "#EFF6FF",
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#BFDBFE",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#2563EB", textTransform: "uppercase" }}>
                    Service For Vehicle
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
                    {isNewTruckMode ? newRego.toUpperCase() : selectedVehicle?.registration}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#64748B" }}>
                    {isNewTruckMode
                      ? `${newMake} ${newModel} (${newVehicleType})`
                      : `${selectedVehicle?.make} ${selectedVehicle?.model} (${selectedVehicle?.vehicleType})`}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setStep(1)}
                  style={{
                    backgroundColor: "#DBEAFE",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#1D4ED8" }}>Change</Text>
                </TouchableOpacity>
              </View>

              {/* Service Form */}
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
                {/* Service Type Selection */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>
                    Select Service / Job Type *
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {SERVICE_TYPES.map((st) => {
                      const isSelected = serviceType === st;
                      return (
                        <TouchableOpacity
                          key={st}
                          onPress={() => setServiceType(st)}
                          style={{
                            backgroundColor: isSelected ? "#2563EB" : "#F1F5F9",
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: isSelected ? "#2563EB" : "#E2E8F0",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "700",
                              color: isSelected ? "#FFFFFF" : "#334155",
                            }}
                          >
                            {st}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Priority Selection */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>
                    Priority Level
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {PRIORITIES.map((pr) => {
                      const isSelected = priority === pr;
                      return (
                        <TouchableOpacity
                          key={pr}
                          onPress={() => setPriority(pr)}
                          style={{
                            flex: 1,
                            backgroundColor: isSelected
                              ? pr === "Critical"
                                ? "#DC2626"
                                : pr === "Urgent"
                                ? "#EA580C"
                                : "#2563EB"
                              : "#F1F5F9",
                            paddingVertical: 8,
                            borderRadius: 8,
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: isSelected ? "transparent" : "#E2E8F0",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "700",
                              color: isSelected ? "#FFFFFF" : "#475569",
                            }}
                          >
                            {pr}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Service Odometer */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: "800", color: "#0F172A", marginBottom: 6 }}>
                    Odometer at Service (km)
                  </Text>
                  <TextInput
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
                    placeholder="e.g. 152000"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={serviceOdometer}
                    onChangeText={setServiceOdometer}
                  />
                </View>

                {/* Fault / Service Scope Description */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: "800", color: "#0F172A", marginBottom: 6 }}>
                    Work Required / Customer Issue
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: "#F8FAFC",
                      borderWidth: 1,
                      borderColor: "#CBD5E1",
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      fontSize: 14,
                      color: "#0F172A",
                      minHeight: 80,
                      textAlignVertical: "top",
                    }}
                    placeholder="e.g. 50,000 km lube service, check air brakes, replace oil and fuel filters..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>

                {/* Launch Button */}
                <TouchableOpacity
                  disabled={submittingService}
                  onPress={handleLaunchService}
                  style={{
                    backgroundColor: "#16A34A",
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  {submittingService ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="construct" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={{ fontSize: 16, fontWeight: "800", color: "#FFFFFF" }}>
                        Launch Service Job
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
