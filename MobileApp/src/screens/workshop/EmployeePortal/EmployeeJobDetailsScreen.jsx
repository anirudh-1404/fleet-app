import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopEmployeeService } from "../../../services/workshopEmployeeService";
import WorkshopStatusBadge from "../../../components/workshop/WorkshopStatusBadge";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";
import { normalizeImageUrl } from "../../../services/uploadService";

const STATUS_OPTIONS = [
  { key: "OPEN", label: "Open", color: "#3B82F6", bg: "#EFF6FF" },
  { key: "IN_PROGRESS", label: "In Progress", color: "#F59E0B", bg: "#FFFBEB" },
  { key: "WAITING_FOR_PARTS", label: "Waiting Parts", color: "#8B5CF6", bg: "#F5F3FF" },
  { key: "COMPLETED", label: "Completed", color: "#10B981", bg: "#ECFDF5" },
];

export default function EmployeeJobDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const fetchDetails = async () => {
    try {
      setError(null);
      const res = await workshopEmployeeService.getJobDetails(id);
      setData(res);
    } catch (err) {
      console.error("Error loading job details:", err);
      setError(err.response?.data?.message || "Failed to load job details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDetails();
  };

  const handleStatusChange = async (newStatus) => {
    if (data?.workOrder?.status === newStatus) return;
    setUpdatingStatus(true);
    try {
      await workshopEmployeeService.updateJobStatus(id, newStatus);
      await fetchDetails();
      Alert.alert("Success", `Job status updated to ${newStatus.replace(/_/g, " ")}`);
    } catch (err) {
      console.error("Status update error:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to update job status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      Alert.alert("Required", "Please enter a note before adding.");
      return;
    }
    setSubmittingNote(true);
    try {
      await workshopEmployeeService.addWorkNote(id, newNote.trim());
      setNewNote("");
      await fetchDetails();
      Alert.alert("Saved", "Work note added successfully.");
    } catch (err) {
      console.error("Add note error:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to add work note");
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <StatusBar barStyle="dark-content" />
        <WorkshopStateView loading message="Loading job details..." />
      </SafeAreaView>
    );
  }

  if (error || !data || !data.workOrder) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <StatusBar barStyle="dark-content" />
        <WorkshopStateView
          error
          message={error || "Work order not found"}
          actionLabel="Try Again"
          onAction={fetchDetails}
        />
      </SafeAreaView>
    );
  }

  const { workOrder, services = [], inspections = [] } = data;
  const vehicle = workOrder.vehicle;
  const checklist = workOrder.checklist;
  const photos = workOrder.photos || { before: [], during: [], after: [] };
  const allPhotos = [
    ...(photos.before || []).map((p) => ({ ...p, phase: "Before" })),
    ...(photos.during || []).map((p) => ({ ...p, phase: "During" })),
    ...(photos.after || []).map((p) => ({ ...p, phase: "After" })),
  ];
  const workNotes = workOrder.workNotes || [];

  // Checklist counts
  const totalChecklistItems = checklist?.items?.length || 0;
  const passedItems = checklist?.items?.filter((i) => i.status === "PASS").length || 0;
  const failedItems = checklist?.items?.filter((i) => i.status === "FAIL").length || 0;

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
          onPress={() => navigation.goBack()}
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
            {workOrder.jobNumber}
          </Text>
          <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "500" }}>
            Assigned Work Order
          </Text>
        </View>

        {/* Chat shortcut button */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(ROUTES.WORKSHOP_EMPLOYEE_CHAT, {
              id: workOrder._id,
              jobNumber: workOrder.jobNumber,
            })
          }
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: "#EFF6FF",
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#BFDBFE",
          }}
        >
          <Ionicons name="chatbubbles" size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />}
      >
        {/* Status Bar Card */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <View>
              <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600", textTransform: "uppercase" }}>
                Current Status
              </Text>
              <View style={{ marginTop: 4 }}>
                <WorkshopStatusBadge status={workOrder.status} />
              </View>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600", textTransform: "uppercase" }}>
                Priority
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "800",
                  marginTop: 2,
                  color: workOrder.priority === "Urgent" || workOrder.priority === "Critical" ? "#DC2626" : "#2563EB",
                }}
              >
                {workOrder.priority || "Normal"}
              </Text>
            </View>
          </View>

          {/* Quick status transition chips */}
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 8 }}>
            Change Status:
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {STATUS_OPTIONS.map((st) => {
              const isSelected = workOrder.status === st.key;
              return (
                <TouchableOpacity
                  key={st.key}
                  disabled={updatingStatus}
                  onPress={() => handleStatusChange(st.key)}
                  style={{
                    backgroundColor: isSelected ? st.color : st.bg,
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: isSelected ? st.color : "#E2E8F0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: isSelected ? "#FFFFFF" : st.color,
                    }}
                  >
                    {st.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Vehicle Information Card */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: "#EFF6FF",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 10,
                }}
              >
                <Ionicons name="car" size={20} color="#2563EB" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
                Vehicle Details
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowHistory(!showHistory)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#F1F5F9",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#2563EB", marginRight: 4 }}>
                {showHistory ? "Hide History" : "View History"}
              </Text>
              <Ionicons
                name={showHistory ? "chevron-up" : "chevron-down"}
                size={14}
                color="#2563EB"
              />
            </TouchableOpacity>
          </View>

          {vehicle ? (
            <View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Registration:</Text>
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}>
                  {vehicle.registration || "N/A"}
                </Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Make & Model:</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>
                  {vehicle.make} {vehicle.model}
                </Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>VIN:</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#334155" }}>
                  {vehicle.vin || "Not recorded"}
                </Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Vehicle Type:</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#334155" }}>
                  {vehicle.vehicleType || "Standard"}
                </Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Odometer:</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#2563EB" }}>
                  {vehicle.odometer ? `${vehicle.odometer.toLocaleString()} km` : "N/A"}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={{ fontSize: 13, color: "#94A3B8" }}>No vehicle assigned</Text>
          )}

          {/* Collapsible Service & Repair History */}
          {showHistory && (
            <View
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: "#F1F5F9",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>
                Previous Services & Repairs
              </Text>
              {services.length === 0 && inspections.length === 0 ? (
                <Text style={{ fontSize: 12, color: "#94A3B8", fontStyle: "italic" }}>
                  No previous records found for this vehicle.
                </Text>
              ) : (
                <View>
                  {services.map((srv, idx) => (
                    <View
                      key={srv._id || idx}
                      style={{
                        backgroundColor: "#F8FAFC",
                        borderRadius: 8,
                        padding: 10,
                        marginBottom: 6,
                      }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ fontSize: 12, fontWeight: "700", color: "#1E293B" }}>
                          {srv.serviceType || "Service"}
                        </Text>
                        <Text style={{ fontSize: 11, color: "#64748B" }}>
                          {srv.date ? new Date(srv.date).toLocaleDateString() : ""}
                        </Text>
                      </View>
                      {srv.notes ? (
                        <Text style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
                          {srv.notes}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                  {inspections.map((insp, idx) => (
                    <View
                      key={insp._id || idx}
                      style={{
                        backgroundColor: "#F8FAFC",
                        borderRadius: 8,
                        padding: 10,
                        marginBottom: 6,
                      }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ fontSize: 12, fontWeight: "700", color: "#1E293B" }}>
                          {insp.inspectionType || "Inspection"}
                        </Text>
                        <Text style={{ fontSize: 11, color: "#64748B" }}>
                          {insp.date ? new Date(insp.date).toLocaleDateString() : ""}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 11, color: insp.status === "PASSED" ? "#10B981" : "#EF4444", fontWeight: "600", marginTop: 2 }}>
                        Status: {insp.status || "Completed"}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Job Scope & Customer Card */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: "#FEF3C7",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 10,
              }}
            >
              <Ionicons name="construct" size={20} color="#D97706" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
              Work Order Details
            </Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ fontSize: 13, color: "#64748B" }}>Job Type:</Text>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#0F172A" }}>
              {workOrder.jobType || "Standard"}
            </Text>
          </View>

          {workOrder.expectedCompletionDate && (
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Expected Completion:</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#334155" }}>
                {new Date(workOrder.expectedCompletionDate).toLocaleDateString()}
              </Text>
            </View>
          )}

          {workOrder.customer && (
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Customer:</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#0F172A" }}>
                {workOrder.customer.companyName || workOrder.customer.fullName}
              </Text>
            </View>
          )}

          <View style={{ marginTop: 8, backgroundColor: "#F8FAFC", padding: 12, borderRadius: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 4 }}>
              Customer Issue / Description:
            </Text>
            <Text style={{ fontSize: 13, color: "#1E293B", lineHeight: 18 }}>
              {workOrder.description || "No specific instructions provided."}
            </Text>
          </View>
        </View>

        {/* Digital Checklist Quick Access Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate(ROUTES.WORKSHOP_EMPLOYEE_CHECKLIST, {
              id: workOrder._id,
              existingChecklist: checklist,
            })
          }
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: checklist?.isCompleted ? "#DCFCE7" : "#EFF6FF",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons
                  name={checklist?.isCompleted ? "checkmark-done-circle" : "checkbox"}
                  size={24}
                  color={checklist?.isCompleted ? "#10B981" : "#2563EB"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
                  Digital Checklist
                </Text>
                <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                  {checklist?.checklistType
                    ? `${checklist.checklistType.replace(/_/g, " ")} • ${passedItems} Pass, ${failedItems} Fail`
                    : "Lube, Basic & Annual Checklists"}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  backgroundColor: checklist?.isCompleted ? "#10B981" : "#2563EB",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 6,
                  marginRight: 6,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "800", color: "#FFFFFF" }}>
                  {checklist?.isCompleted ? "COMPLETED" : "FILL IN"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Photos & Evidence Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate(ROUTES.WORKSHOP_EMPLOYEE_PHOTOS, {
              id: workOrder._id,
              existingPhotos: photos,
            })
          }
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: "#FEF2F2",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="camera" size={22} color="#EF4444" />
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
                  Photos & Evidence
                </Text>
                <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                  {allPhotos.length} {allPhotos.length === 1 ? "photo" : "photos"} uploaded
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  backgroundColor: "#EFF6FF",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 6,
                  marginRight: 6,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "800", color: "#2563EB" }}>
                  ADD / VIEW
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </View>
          </View>

          {/* Mini photo thumbnails preview */}
          {allPhotos.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
              {allPhotos.map((p, idx) => (
                <View key={idx} style={{ marginRight: 8, position: "relative" }}>
                  <Image
                    source={{ uri: normalizeImageUrl(p.url) }}
                    style={{ width: 68, height: 68, borderRadius: 8, backgroundColor: "#E2E8F0" }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      bottom: 2,
                      left: 2,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      paddingHorizontal: 4,
                      paddingVertical: 1,
                      borderRadius: 4,
                    }}
                  >
                    <Text style={{ fontSize: 9, color: "#FFFFFF", fontWeight: "700" }}>{p.phase}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={{ fontSize: 12, color: "#94A3B8", fontStyle: "italic" }}>
              No photos attached yet. Tap to take or upload Before/During/After evidence.
            </Text>
          )}
        </TouchableOpacity>

        {/* Work Notes & Observations */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: "#F3E8FF",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 10,
              }}
            >
              <Ionicons name="document-text" size={20} color="#9333EA" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
              Work Notes & Observations
            </Text>
          </View>

          {/* Add note input */}
          <View style={{ marginBottom: 14 }}>
            <TextInput
              style={{
                backgroundColor: "#F8FAFC",
                borderWidth: 1,
                borderColor: "#CBD5E1",
                borderRadius: 10,
                padding: 12,
                fontSize: 14,
                color: "#0F172A",
                minHeight: 70,
                textAlignVertical: "top",
              }}
              placeholder="Record inspection findings, repairs made, or parts needed..."
              placeholderTextColor="#94A3B8"
              multiline
              value={newNote}
              onChangeText={setNewNote}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={submittingNote}
              onPress={handleAddNote}
              style={{
                backgroundColor: "#2563EB",
                marginTop: 8,
                borderRadius: 8,
                paddingVertical: 10,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              {submittingNote ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="add-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>
                    Add Work Note
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Notes list */}
          {workNotes.length === 0 ? (
            <Text style={{ fontSize: 12, color: "#94A3B8", fontStyle: "italic" }}>
              No notes logged for this job yet.
            </Text>
          ) : (
            workNotes.map((note, idx) => (
              <View
                key={note._id || idx}
                style={{
                  backgroundColor: "#F8FAFC",
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 8,
                  borderLeftWidth: 3,
                  borderLeftColor: "#2563EB",
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#1E293B" }}>
                    {note.authorName || "Mechanic"}
                  </Text>
                  <Text style={{ fontSize: 10, color: "#64748B" }}>
                    {note.createdAt ? new Date(note.createdAt).toLocaleString() : ""}
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: "#334155", lineHeight: 18 }}>
                  {note.text}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Team Chat Action Bar */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate(ROUTES.WORKSHOP_EMPLOYEE_CHAT, {
              id: workOrder._id,
              jobNumber: workOrder.jobNumber,
            })
          }
          style={{
            backgroundColor: "#1E293B",
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 3,
          }}
        >
          <Ionicons name="chatbubbles-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#FFFFFF" }}>
            Open Job Team Chat (Coming Soon)
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
