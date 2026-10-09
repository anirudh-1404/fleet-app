import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ROUTES from "@constants/routes";
import { workshopInquiryService } from "../../../services/workshopInquiryService";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

export default function InquiryDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    try {
      setError(null);
      const data = await workshopInquiryService.getInquiryById(id);
      setInquiry(data);
    } catch (err) {
      console.error("Error loading inquiry details:", err);
      setError(err.response?.data?.message || "Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await workshopInquiryService.updateInquiryStatus(id, newStatus);
      setInquiry((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Could not update status");
    }
  };

  const handleConvertToWorkOrder = () => {
    Alert.alert(
      "Convert to Work Order",
      `Do you want to create an active Workshop Work Order for ${inquiry.vehicle?.make} ${inquiry.vehicle?.model} (${inquiry.vehicle?.registration})? This will automatically register the vehicle and client in your workshop roster.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create Work Order",
          onPress: async () => {
            setConverting(true);
            try {
              const res = await workshopInquiryService.convertToWorkOrder(id);
              Alert.alert(
                "Work Order Created! 🎉",
                `Successfully created ${res.workOrder?.jobNumber}. You can now assign technicians and start servicing.`,
                [
                  {
                    text: "Open Work Order",
                    onPress: () => {
                      navigation.replace(ROUTES.WORKSHOP_WORKORDER_DETAILS, {
                        id: res.workOrder?._id,
                      });
                    },
                  },
                ]
              );
            } catch (err) {
              Alert.alert("Conversion Failed", err.response?.data?.message || "Could not create work order");
            } finally {
              setConverting(false);
            }
          },
        },
      ]
    );
  };

  const handleCall = () => {
    if (inquiry?.customer?.mobileNumber) {
      Linking.openURL(`tel:${inquiry.customer.mobileNumber}`);
    }
  };

  const handleWhatsApp = () => {
    if (inquiry?.customer?.mobileNumber) {
      const clean = inquiry.customer.mobileNumber.replace(/[^0-9]/g, "");
      const msg = encodeURIComponent(
        `Hi ${inquiry.customer.name}, regarding your workshop booking for vehicle ${inquiry.vehicle?.registration}:`
      );
      Linking.openURL(`https://wa.me/${clean}?text=${msg}`).catch(() => {
        Linking.openURL(`sms:${inquiry.customer.mobileNumber}`);
      });
    }
  };

  const handleEmail = () => {
    if (inquiry?.customer?.email) {
      Linking.openURL(`mailto:${inquiry.customer.email}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
        <WorkshopStateView loading={true} />
      </SafeAreaView>
    );
  }

  if (error || !inquiry) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
        <WorkshopStateView error={error || "Booking not found"} onRetry={fetchDetails} />
      </SafeAreaView>
    );
  }

  const { customer, vehicle, bookingTypes, mainJobRequest, signature, status, convertedWorkOrder, createdAt } = inquiry;

  const formattedDate = new Date(createdAt).toLocaleString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 14,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E2E8F0",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#F1F5F9",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A" }}>
              Job Card Inquiry
            </Text>
            <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}>
              {vehicle?.registration} • {formattedDate}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      >
        {/* Status Control Bar */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 14,
            padding: 14,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B" }}>LEAD STATUS</Text>
            <Text style={{ fontSize: 15, fontWeight: "800", color: status === "NEW" ? "#1D4ED8" : status === "CONVERTED" ? "#15803D" : "#B45309", marginTop: 2 }}>
              {status === "NEW" ? "New Booking Lead" : status === "CONTACTED" ? "Client Contacted" : "Converted to Work Order"}
            </Text>
          </View>

          {status !== "CONVERTED" ? (
            <View style={{ flexDirection: "row", gap: 8 }}>
              {status === "NEW" ? (
                <TouchableOpacity
                  onPress={() => handleStatusChange("CONTACTED")}
                  style={{ backgroundColor: "#FEF3C7", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#B45309" }}>Mark Contacted</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => handleStatusChange("NEW")}
                  style={{ backgroundColor: "#EFF6FF", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#1D4ED8" }}>Mark as New</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}
        </View>

        {/* Section 1: Customer Details */}
        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, borderBottomWidth: 1, borderColor: "#F1F5F9", paddingBottom: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
              <Ionicons name="person-outline" size={18} color="#2563EB" />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
              1. Customer Details
            </Text>
          </View>

          <View style={{ gap: 8, marginBottom: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Customer Name:</Text>
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}>{customer?.name}</Text>
            </View>

            {customer?.companyName ? (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>Company Name:</Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155" }}>{customer.companyName}</Text>
              </View>
            ) : null}

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Mobile Number:</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#2563EB" }}>{customer?.mobileNumber}</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Email Address:</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#334155" }}>{customer?.email}</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Preferred Contact:</Text>
              <View style={{ backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155" }}>{customer?.preferredContactMethod || "Phone"}</Text>
              </View>
            </View>

            {customer?.customerNotes ? (
              <View style={{ marginTop: 6, backgroundColor: "#F8FAFC", padding: 10, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", marginBottom: 2 }}>Customer Notes:</Text>
                <Text style={{ fontSize: 13, color: "#334155" }}>{customer.customerNotes}</Text>
              </View>
            ) : null}
          </View>

          {/* Quick Actions for Contact */}
          <View style={{ flexDirection: "row", gap: 8, borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 12 }}>
            <TouchableOpacity
              onPress={handleCall}
              style={{ flex: 1, backgroundColor: "#EFF6FF", paddingVertical: 10, borderRadius: 10, alignItems: "center", flexDirection: "row", justifyContent: "center" }}
            >
              <Ionicons name="call-outline" size={16} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#2563EB" }}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleWhatsApp}
              style={{ flex: 1, backgroundColor: "#DCFCE7", paddingVertical: 10, borderRadius: 10, alignItems: "center", flexDirection: "row", justifyContent: "center" }}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#16A34A" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#16A34A" }}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleEmail}
              style={{ flex: 1, backgroundColor: "#F1F5F9", paddingVertical: 10, borderRadius: 10, alignItems: "center", flexDirection: "row", justifyContent: "center" }}
            >
              <Ionicons name="mail-outline" size={16} color="#475569" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#475569" }}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: Vehicle Details */}
        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, borderBottomWidth: 1, borderColor: "#F1F5F9", paddingBottom: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
              <Ionicons name="car-outline" size={18} color="#D97706" />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
              2. Vehicle Details
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Registration Number:</Text>
              <View style={{ backgroundColor: "#FEF08A", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: "#FDE047" }}>
                <Text style={{ fontSize: 14, fontWeight: "900", color: "#854D0E" }}>{vehicle?.registration}</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Make & Model:</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>
                {vehicle?.make} {vehicle?.model}
              </Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Year:</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#334155" }}>{vehicle?.year}</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Odometer (km):</Text>
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}>{vehicle?.odometer?.toLocaleString()} km</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Vehicle Type:</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#2563EB" }}>{vehicle?.vehicleType}</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Fuel Type:</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155" }}>{vehicle?.fuelType}</Text>
            </View>

            {vehicle?.vin ? (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>VIN / Chassis:</Text>
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#64748B" }}>{vehicle.vin}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Section 3: Booking Type */}
        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, borderBottomWidth: 1, borderColor: "#F1F5F9", paddingBottom: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#E0F2FE", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
              <Ionicons name="checkbox-outline" size={18} color="#0284C7" />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
              3. Booking Types Selected
            </Text>
          </View>

          {bookingTypes && bookingTypes.length > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {bookingTypes.map((type, idx) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: "#EFF6FF",
                    borderWidth: 1,
                    borderColor: "#BFDBFE",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="checkmark-circle" size={14} color="#2563EB" style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#1D4ED8" }}>{type}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ fontSize: 13, color: "#94A3B8" }}>No specific booking types checked.</Text>
          )}
        </View>

        {/* Section 4: Main Job / Customer Request */}
        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, borderBottomWidth: 1, borderColor: "#F1F5F9", paddingBottom: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#F3E8FF", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
              <Ionicons name="document-text-outline" size={18} color="#7C3AED" />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
              4. Main Job / Customer Request
            </Text>
          </View>

          {mainJobRequest ? (
            <View style={{ backgroundColor: "#F8FAFC", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0" }}>
              <Text style={{ fontSize: 14, color: "#0F172A", lineHeight: 20 }}>
                {mainJobRequest}
              </Text>
            </View>
          ) : (
            <Text style={{ fontSize: 13, color: "#94A3B8" }}>No specific comments provided by customer.</Text>
          )}
        </View>

        {/* Section 5: Signs (Customer Signature) */}
        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: "#E2E8F0" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, borderBottomWidth: 1, borderColor: "#F1F5F9", paddingBottom: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
              <Ionicons name="create-outline" size={18} color="#15803D" />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
              5. Customer Signature & Authorisation
            </Text>
          </View>

          {signature ? (
            <View
              style={{
                backgroundColor: "#FAFAFA",
                borderWidth: 1,
                borderColor: "#E2E8F0",
                borderRadius: 12,
                padding: 12,
                alignItems: "center",
              }}
            >
              <Image
                source={{ uri: signature }}
                style={{ width: "100%", height: 120, resizeMode: "contain" }}
              />
              <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 8 }}>
                Signed digitally on submission
              </Text>
            </View>
          ) : (
            <View style={{ padding: 16, backgroundColor: "#F8FAFC", borderRadius: 8, alignItems: "center" }}>
              <Text style={{ fontSize: 13, color: "#94A3B8" }}>No digital signature recorded</Text>
            </View>
          )}
        </View>

        {/* Section 6: Action Footer */}
        {status === "CONVERTED" && convertedWorkOrder ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate(ROUTES.WORKSHOP_WORKORDER_DETAILS, {
                id: convertedWorkOrder._id || convertedWorkOrder,
              })
            }
            style={{
              backgroundColor: "#15803D",
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Ionicons name="open-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#FFFFFF" }}>
              Open Converted Work Order #{convertedWorkOrder?.jobNumber || ""}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={converting}
            onPress={handleConvertToWorkOrder}
            style={{
              backgroundColor: "#2563EB",
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {converting ? (
              <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="build-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            )}
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#FFFFFF" }}>
              {converting ? "Creating Work Order..." : "Convert to Workshop Work Order 🚀"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
