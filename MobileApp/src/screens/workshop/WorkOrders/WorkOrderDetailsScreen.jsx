import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopWorkOrderService } from "../../../services/workshopWorkOrderService";
import WorkshopStatusBadge from "../../../components/workshop/WorkshopStatusBadge";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

export default function WorkOrderDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchWorkOrderDetails = async () => {
    try {
      setError(null);
      const res = await workshopWorkOrderService.getWorkOrderById(id);
      setData(res);
    } catch (err) {
      console.error("Error loading work order details:", err);
      setError(err.response?.data?.message || "Failed to load work order details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWorkOrderDetails();
    }, [id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkOrderDetails();
  };

  const handleStatusTransition = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await workshopWorkOrderService.updateWorkOrder(id, { status: newStatus });
      await fetchWorkOrderDetails();
      Alert.alert("Status Updated", `Work Order is now ${newStatus.replace(/_/g, " ")}.`);
    } catch (err) {
      console.error("Status update error:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Work Order",
      "Are you sure you want to delete this work order? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await workshopWorkOrderService.deleteWorkOrder(id);
              Alert.alert("Deleted", "Work order removed successfully");
              navigation.goBack();
            } catch (err) {
              Alert.alert("Error", err.response?.data?.message || "Could not delete work order");
            }
          },
        },
      ]
    );
  };

  const workOrder = data?.workOrder;
  const customer = workOrder?.customer;
  const vehicle = workOrder?.vehicle;
  const inspections = data?.inspections || [];
  const services = data?.services || [];
  const invoices = data?.invoices || [];
  const totalInvoiceAmount = data?.totalInvoiceAmount || 0;

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
          justifyContent: "space-between",
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderColor: "#E2E8F0",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>
            Work Order Details
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.EDIT_WORKSHOP_WORKORDER, { workOrder })}
            style={{ padding: 6, backgroundColor: "#F1F5F9", borderRadius: 8 }}
          >
            <Ionicons name="pencil-outline" size={18} color="#0F172A" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            style={{ padding: 6, backgroundColor: "#FEE2E2", borderRadius: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <WorkshopStateView loading={true} />
      ) : error && !data ? (
        <WorkshopStateView error={error} onRetry={fetchWorkOrderDetails} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Main Job Hero Card */}
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
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <View>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F172A" }}>
                  {workOrder?.jobNumber}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#059669", marginTop: 2 }}>
                  {workOrder?.jobType}
                </Text>
              </View>

              <View style={{ gap: 4, alignItems: "flex-end" }}>
                <WorkshopStatusBadge status={workOrder?.status} />
                {workOrder?.priority && (
                  <WorkshopStatusBadge status={workOrder?.priority} size="small" />
                )}
              </View>
            </View>

            {workOrder?.description ? (
              <Text style={{ fontSize: 13, color: "#475569", marginTop: 8, lineHeight: 18 }}>
                {workOrder.description}
              </Text>
            ) : null}

            <View style={{ borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 12, marginTop: 12, gap: 6 }}>
              <Text style={{ fontSize: 12, color: "#64748B" }}>
                Mechanic: <Text style={{ fontWeight: "700", color: "#334155" }}>{workOrder?.assignedMechanic || "Unassigned"}</Text>
              </Text>
              <Text style={{ fontSize: 12, color: "#64748B" }}>
                Date Received: <Text style={{ fontWeight: "600", color: "#334155" }}>{new Date(workOrder?.dateReceived || workOrder?.createdAt).toLocaleDateString()}</Text>
              </Text>
              {workOrder?.expectedCompletionDate ? (
                <Text style={{ fontSize: 12, color: "#64748B" }}>
                  Expected Delivery: <Text style={{ fontWeight: "600", color: "#334155" }}>{new Date(workOrder.expectedCompletionDate).toLocaleDateString()}</Text>
                </Text>
              ) : null}

              {/* Quick Action Tools for Manager & Mechanic Collaboration */}
              <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(ROUTES.WORKSHOP_EMPLOYEE_CHECKLIST, {
                      id: workOrder._id,
                      existingChecklist: workOrder.checklist,
                    })
                  }
                  style={{
                    flex: 1,
                    backgroundColor: "#ECFDF5",
                    borderRadius: 8,
                    paddingVertical: 8,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#A7F3D0",
                  }}
                >
                  <Ionicons name="checkbox-outline" size={16} color="#059669" style={{ marginBottom: 2 }} />
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#059669" }}>Checklist</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(ROUTES.WORKSHOP_EMPLOYEE_PHOTOS, {
                      id: workOrder._id,
                      existingPhotos: workOrder.photos,
                    })
                  }
                  style={{
                    flex: 1,
                    backgroundColor: "#FEF2F2",
                    borderRadius: 8,
                    paddingVertical: 8,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#FECACA",
                  }}
                >
                  <Ionicons name="camera-outline" size={16} color="#DC2626" style={{ marginBottom: 2 }} />
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#DC2626" }}>Photos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(ROUTES.WORKSHOP_EMPLOYEE_CHAT, {
                      id: workOrder._id,
                      jobNumber: workOrder.jobNumber,
                    })
                  }
                  style={{
                    flex: 1,
                    backgroundColor: "#F0FDF4",
                    borderRadius: 8,
                    paddingVertical: 8,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#BBF7D0",
                  }}
                >
                  <Ionicons name="chatbubbles-outline" size={16} color="#16A34A" style={{ marginBottom: 2 }} />
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#16A34A" }}>Team Chat (Soon)</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Lifecycle Transition Buttons */}
            <View style={{ borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 14, marginTop: 14, gap: 8 }}>
              {workOrder?.status === "OPEN" && (
                <TouchableOpacity
                  onPress={() => handleStatusTransition("IN_PROGRESS")}
                  disabled={updatingStatus}
                  style={{ backgroundColor: "#059669", paddingVertical: 10, borderRadius: 8, alignItems: "center" }}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>
                    Start Work → IN PROGRESS
                  </Text>
                </TouchableOpacity>
              )}

              {(workOrder?.status === "IN_PROGRESS" || workOrder?.status === "WAITING_FOR_PARTS" || workOrder?.status === "INSPECTION_PENDING") && (
                <TouchableOpacity
                  onPress={() => handleStatusTransition("READY_FOR_COLLECTION")}
                  disabled={updatingStatus}
                  style={{ backgroundColor: "#7C3AED", paddingVertical: 10, borderRadius: 8, alignItems: "center" }}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>
                    Mark READY FOR COLLECTION
                  </Text>
                </TouchableOpacity>
              )}

              {workOrder?.status === "READY_FOR_COLLECTION" && (
                <TouchableOpacity
                  onPress={() => handleStatusTransition("COMPLETED")}
                  disabled={updatingStatus}
                  style={{ backgroundColor: "#15803D", paddingVertical: 10, borderRadius: 8, alignItems: "center" }}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>
                    Complete Job & Handover Vehicle → COMPLETED
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Linked Customer & Vehicle Cards */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
            {/* Customer */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (customer?._id) navigation.navigate(ROUTES.WORKSHOP_CUSTOMER_DETAILS, { id: customer._id });
              }}
              style={{ flex: 1, backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E2E8F0" }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", marginBottom: 4 }}>CUSTOMER</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>
                {customer?.fullName || "Walk-in"}
              </Text>
              <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{customer?.phone}</Text>
            </TouchableOpacity>

            {/* Vehicle */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (vehicle?._id) navigation.navigate(ROUTES.WORKSHOP_VEHICLE_DETAILS, { id: vehicle._id });
              }}
              style={{ flex: 1, backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E2E8F0" }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", marginBottom: 4 }}>VEHICLE</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>
                {vehicle?.make} {vehicle?.model}
              </Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#059669", marginTop: 2 }}>
                {vehicle?.registration}
              </Text>
            </TouchableOpacity>
          </View>

          {/* QUICK JOB INTAKE REPORT CARD */}
          {workOrder?.intakeDetails && (
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
                shadowOpacity: 0.04,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: "#ECFDF5",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 8,
                    }}
                  >
                    <Ionicons name="clipboard-outline" size={18} color="#059669" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
                      Quick Job Intake Report
                    </Text>
                    <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>
                      Logged by {workOrder.intakeDetails.createdByName || workOrder.assignedMechanic || "Floor Mechanic"}
                    </Text>
                  </View>
                </View>

                {workOrder.intakeDetails.vehicleOffRoad && (
                  <View style={{ backgroundColor: "#FEE2E2", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ fontSize: 10, fontWeight: "800", color: "#DC2626" }}>VOR - CRITICAL</Text>
                  </View>
                )}
              </View>

              {/* Work Types Chips */}
              {workOrder.intakeDetails.workTypes?.length > 0 && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {workOrder.intakeDetails.workTypes.map((wt, i) => (
                    <View key={i} style={{ backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                      <Text style={{ fontSize: 11, fontWeight: "700", color: "#334155" }}>{wt}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Details Box */}
              <View style={{ backgroundColor: "#F8FAFC", borderRadius: 10, padding: 10, gap: 6, borderWidth: 1, borderColor: "#F1F5F9" }}>
                {workOrder.intakeDetails.customerComplaint ? (
                  <View>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#64748B", textTransform: "uppercase" }}>
                      Customer Complaint:
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: "#0F172A", marginTop: 1 }}>
                      {workOrder.intakeDetails.customerComplaint}
                    </Text>
                  </View>
                ) : null}

                {workOrder.intakeDetails.workRequired ? (
                  <View style={{ borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 4, marginTop: 2 }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#64748B", textTransform: "uppercase" }}>
                      Work Required:
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: "#0F172A", marginTop: 1 }}>
                      {workOrder.intakeDetails.workRequired}
                    </Text>
                  </View>
                ) : null}

                {workOrder.intakeDetails.faultCodes ? (
                  <View style={{ borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 4, marginTop: 2 }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#64748B", textTransform: "uppercase" }}>
                      Warning / Fault Codes:
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#DC2626", marginTop: 1 }}>
                      {workOrder.intakeDetails.faultCodes}
                    </Text>
                  </View>
                ) : null}

                {workOrder.intakeDetails.additionalNotes ? (
                  <View style={{ borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 4, marginTop: 2 }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#64748B", textTransform: "uppercase" }}>
                      Additional Notes:
                    </Text>
                    <Text style={{ fontSize: 12, color: "#475569", marginTop: 1 }}>
                      {workOrder.intakeDetails.additionalNotes}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Intake Photos */}
              {workOrder.intakeDetails.intakePhotos?.length > 0 && (
                <View style={{ marginTop: 10 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#475569", marginBottom: 6 }}>
                    Attached Photos ({workOrder.intakeDetails.intakePhotos.length})
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {workOrder.intakeDetails.intakePhotos.map((uri, idx) => (
                      <Image
                        key={idx}
                        source={{ uri }}
                        style={{ width: 64, height: 64, borderRadius: 8, borderWidth: 1, borderColor: "#CBD5E1" }}
                      />
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* Digital Checklist Card (Manager View) */}
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
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: "#ECFDF5",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 8,
                  }}
                >
                  <Ionicons name="checkbox-outline" size={18} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
                    Digital Checklist
                  </Text>
                  <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }} numberOfLines={1}>
                    {workOrder?.checklist?.checklistType
                      ? workOrder.checklist.checklistType.replace(/_/g, " ")
                      : "Inspection & Service Checklist"}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(ROUTES.WORKSHOP_EMPLOYEE_CHECKLIST, {
                    id: workOrder._id,
                    existingChecklist: workOrder.checklist,
                  })
                }
                style={{
                  backgroundColor: "#059669",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Ionicons name="create-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>
                  {workOrder?.checklist?.items?.length ? "View / Edit" : "+ Start"}
                </Text>
              </TouchableOpacity>
            </View>

            {workOrder?.checklist?.items?.length ? (
              <View>
                {/* Stats Bar */}
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: "#F8FAFC",
                    borderRadius: 10,
                    padding: 10,
                    marginBottom: 10,
                    justifyContent: "space-around",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ fontSize: 15, fontWeight: "800", color: "#10B981" }}>
                      {workOrder.checklist.items.filter((i) => i.status === "PASS" || i.status === "OK").length}
                    </Text>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#64748B" }}>OK</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: "#E2E8F0" }} />
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ fontSize: 15, fontWeight: "800", color: "#EF4444" }}>
                      {workOrder.checklist.items.filter((i) => i.status === "FAIL" || i.status === "DEFECT").length}
                    </Text>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#64748B" }}>DEFECTS</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: "#E2E8F0" }} />
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ fontSize: 15, fontWeight: "800", color: "#64748B" }}>
                      {workOrder.checklist.items.filter((i) => i.status === "NA" || i.status === "N/A").length}
                    </Text>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#64748B" }}>N/A</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: "#E2E8F0" }} />
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ fontSize: 15, fontWeight: "800", color: "#059669" }}>
                      {workOrder.checklist.items.length}
                    </Text>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#64748B" }}>TOTAL</Text>
                  </View>
                </View>

                {/* Overall Outcome & Verified badge */}
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons
                      name={workOrder.checklist.completedAt ? "checkmark-circle" : "time-outline"}
                      size={16}
                      color={workOrder.checklist.completedAt ? "#10B981" : "#F59E0B"}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: workOrder.checklist.completedAt ? "#15803D" : "#B45309",
                      }}
                    >
                      {workOrder.checklist.completedAt
                        ? `Completed on ${new Date(workOrder.checklist.completedAt).toLocaleDateString()}`
                        : "Draft in Progress"}
                    </Text>
                  </View>

                  {workOrder.checklist.overallOutcome && (
                    <View
                      style={{
                        backgroundColor:
                          workOrder.checklist.overallOutcome === "Pass" || workOrder.checklist.overallOutcome === "Satisfactory"
                            ? "#F0FDF4"
                            : "#FEE2E2",
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "800",
                          color:
                            workOrder.checklist.overallOutcome === "Pass" || workOrder.checklist.overallOutcome === "Satisfactory"
                              ? "#16A34A"
                              : "#DC2626",
                        }}
                      >
                        {workOrder.checklist.overallOutcome}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Axle Brake Measurements Summary (if recorded) */}
                {workOrder.checklist.axleMeasurements?.some((a) => a.rhsMm || a.lhsMm) && (
                  <View
                    style={{
                      backgroundColor: "#F8FAFC",
                      borderRadius: 8,
                      padding: 8,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "800", color: "#1E293B", marginBottom: 4 }}>
                      Brake Linings / Shoes Thickness:
                    </Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                      {workOrder.checklist.axleMeasurements.map((ax, idx) => (
                        <View key={idx} style={{ backgroundColor: "#FFFFFF", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: "#CBD5E1" }}>
                          <Text style={{ fontSize: 10, fontWeight: "700", color: "#334155" }}>
                            {ax.axleNumber}: R {ax.rhsMm || "-"}mm / L {ax.lhsMm || "-"}mm
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Service Completion Record Summary (if present) */}
                {workOrder.checklist.serviceRecord?.nextServiceDueKm && (
                  <View
                    style={{
                      backgroundColor: "#ECFDF5",
                      borderRadius: 8,
                      padding: 8,
                      marginBottom: 8,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#065F46" }}>
                      Next Service Due:
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: "800", color: "#047857" }}>
                      {Number(workOrder.checklist.serviceRecord.nextServiceDueKm).toLocaleString()} km
                    </Text>
                  </View>
                )}

                {/* Defects Breakdown */}
                {workOrder.checklist.items
                  .filter((i) => i.status === "FAIL" || i.status === "DEFECT")
                  .map((defect, dIdx) => (
                    <View
                      key={dIdx}
                      style={{
                        backgroundColor: "#FEF2F2",
                        borderRadius: 8,
                        padding: 8,
                        marginTop: 4,
                        borderLeftWidth: 3,
                        borderLeftColor: defect.severity === "Critical" ? "#DC2626" : "#F59E0B",
                      }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ fontSize: 12, fontWeight: "800", color: "#991B1B", flex: 1 }}>
                          ⚠️ {defect.title || defect.label}
                        </Text>
                        <View style={{ backgroundColor: "#FFFFFF", paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                          <Text style={{ fontSize: 10, fontWeight: "800", color: defect.severity === "Critical" ? "#DC2626" : "#D97706" }}>
                            {defect.severity || "Minor"}
                          </Text>
                        </View>
                      </View>
                      {defect.defectDescription ? (
                        <Text style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
                          {defect.defectDescription}
                        </Text>
                      ) : null}
                      {defect.recommendedRepair ? (
                        <Text style={{ fontSize: 11, fontWeight: "700", color: "#059669", marginTop: 2 }}>
                          Action: {defect.recommendedRepair}
                        </Text>
                      ) : null}
                    </View>
                  ))}
              </View>
            ) : (
              <View style={{ backgroundColor: "#F8FAFC", borderRadius: 8, padding: 12, alignItems: "center" }}>
                <Text style={{ fontSize: 12, color: "#64748B" }}>
                  No digital checklist submitted yet for this work order.
                </Text>
              </View>
            )}
          </View>

          {/* Section 1: Linked Inspections */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
                Inspections ({inspections.length})
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.CREATE_WORKSHOP_INSPECTION, {
                  prefilledWorkOrderId: workOrder?._id,
                  prefilledVehicleId: vehicle?._id,
                  prefilledCustomerId: customer?._id,
                  vehicleType: vehicle?.vehicleType,
                })}
                style={{ backgroundColor: "#7C3AED", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>+ Add Inspect</Text>
              </TouchableOpacity>
            </View>

            {inspections.length === 0 ? (
              <View style={{ backgroundColor: "#FFFFFF", borderRadius: 10, padding: 14, borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center" }}>
                <Text style={{ fontSize: 12, color: "#64748B" }}>No inspections recorded for this work order.</Text>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                {inspections.map((insp) => (
                  <TouchableOpacity
                    key={insp._id}
                    onPress={() => navigation.navigate(ROUTES.WORKSHOP_INSPECTION_DETAILS, { id: insp._id })}
                    style={{ backgroundColor: "#FFFFFF", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#E2E8F0" }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>
                        {insp.inspectionType} Inspection
                      </Text>
                      <WorkshopStatusBadge status={insp.status} size="small" />
                    </View>
                    <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                      Inspector: {insp.inspectorName} • {insp.checklistItems?.length || 0} checks
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Section 2: Linked Services */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
                Services Recorded ({services.length})
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (vehicle?.vehicleType === "Trailer") {
                    navigation.navigate(ROUTES.ADD_WORKSHOP_TRAILER_SERVICE, {
                      prefilledWorkOrderId: workOrder?._id,
                      prefilledVehicleId: vehicle?._id,
                      prefilledCustomerId: customer?._id,
                    });
                  } else {
                    navigation.navigate(ROUTES.ADD_WORKSHOP_TRUCK_SERVICE, {
                      prefilledWorkOrderId: workOrder?._id,
                      prefilledVehicleId: vehicle?._id,
                      prefilledCustomerId: customer?._id,
                    });
                  }
                }}
                style={{ backgroundColor: "#15803D", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>+ Record Service</Text>
              </TouchableOpacity>
            </View>

            {services.length === 0 ? (
              <View style={{ backgroundColor: "#FFFFFF", borderRadius: 10, padding: 14, borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center" }}>
                <Text style={{ fontSize: 12, color: "#64748B" }}>No services recorded for this work order.</Text>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                {services.map((srv) => (
                  <TouchableOpacity
                    key={srv._id}
                    onPress={() => {
                      if (srv.vehicleCategory === "Trailer") {
                        navigation.navigate(ROUTES.WORKSHOP_TRAILER_SERVICE_DETAILS, { id: srv._id });
                      } else {
                        navigation.navigate(ROUTES.WORKSHOP_TRUCK_SERVICE_DETAILS, { id: srv._id });
                      }
                    }}
                    style={{ backgroundColor: "#FFFFFF", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#E2E8F0" }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>
                        {srv.serviceType}
                      </Text>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: "#16A34A" }}>
                        ${srv.cost || 0}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                      Odometer: {srv.odometer?.toLocaleString() || 0} km • Vendor: {srv.workshopVendor || "In-house"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Section 3: Invoices & Parts Expenses */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <View>
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
                  Parts & Invoices ({invoices.length})
                </Text>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#16A34A" }}>
                  Total: ${totalInvoiceAmount.toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.ADD_WORKSHOP_INVOICE, {
                  prefilledWorkOrderId: workOrder?._id,
                  prefilledVehicleId: vehicle?._id,
                  prefilledCustomerId: customer?._id,
                })}
                style={{ backgroundColor: "#16A34A", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>+ Add Part/Exp</Text>
              </TouchableOpacity>
            </View>

            {invoices.length === 0 ? (
              <View style={{ backgroundColor: "#FFFFFF", borderRadius: 10, padding: 14, borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center" }}>
                <Text style={{ fontSize: 12, color: "#64748B" }}>No parts or invoices added to this work order.</Text>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                {invoices.map((inv) => (
                  <TouchableOpacity
                    key={inv._id}
                    onPress={() => navigation.navigate(ROUTES.WORKSHOP_INVOICE_DETAILS, { id: inv._id })}
                    style={{ backgroundColor: "#FFFFFF", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#E2E8F0" }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>
                        {inv.invoiceNumber} ({inv.category})
                      </Text>
                      <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}>
                        ${inv.amount || 0}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                      Vendor: {inv.vendor || "N/A"} • {inv.notes || ""}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
