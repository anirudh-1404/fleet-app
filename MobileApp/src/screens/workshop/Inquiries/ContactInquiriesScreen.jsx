import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Share,
  Linking,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ROUTES from "@constants/routes";
import { SERVER_URL } from "@constants/config";
import { workshopInquiryService } from "../../../services/workshopInquiryService";
import { useAuth } from "../../../context/AuthContext";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

const TABS = [
  { key: "ALL", label: "All" },
  { key: "NEW", label: "New Leads" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "CONVERTED", label: "Converted" },
];

export default function ContactInquiriesScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({ total: 0, newCount: 0, contactedCount: 0, convertedCount: 0 });
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Generate Admin Unique Booking Link
  const adminId = user?.workshopManager || user?._id || "";
  const publicBookingUrl = `${SERVER_URL}/booking/${adminId}`;

  const fetchInquiries = async () => {
    try {
      setError(null);
      const params = {};
      if (activeTab !== "ALL") params.status = activeTab;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await workshopInquiryService.getInquiries(params);
      setInquiries(res.inquiries || []);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      console.error("Error fetching inquiries:", err);
      setError(err.response?.data?.message || "Failed to load inquiries");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInquiries();
    }, [activeTab])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchInquiries();
  };

  const handleCopyLink = () => {
    Alert.alert(
      "Booking Link Ready",
      `Your Unique Public Booking Form Link:\n\n${publicBookingUrl}\n\nShare this link with customers. When they submit, it will appear right here in your inquiries tab!`,
      [
        {
          text: "Share Link",
          onPress: handleShareLink,
        },
        { text: "OK" },
      ]
    );
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        title: "Workshop Booking / Job Card Form",
        message: `Book your commercial vehicle service or inspection with us online (No login required):\n${publicBookingUrl}`,
        url: publicBookingUrl,
      });
    } catch (e) {
      console.error("Error sharing booking link:", e);
    }
  };

  const handlePreviewLink = async () => {
    try {
      const canOpen = await Linking.canOpenURL(publicBookingUrl);
      if (canOpen) {
        await Linking.openURL(publicBookingUrl);
      } else {
        handleCopyLink();
      }
    } catch (e) {
      handleCopyLink();
    }
  };

  const handleCallCustomer = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsAppCustomer = (phone, name) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(`Hi ${name}, thank you for submitting your booking with our workshop!`);
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${msg}`).catch(() => {
      Linking.openURL(`sms:${phone}`);
    });
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "NEW":
        return (
          <View style={{ backgroundColor: "#EFF6FF", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: "#BFDBFE" }}>
            <Text style={{ fontSize: 11, fontWeight: "800", color: "#1D4ED8" }}>NEW LEAD</Text>
          </View>
        );
      case "CONTACTED":
        return (
          <View style={{ backgroundColor: "#FEF3C7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: "#FDE68A" }}>
            <Text style={{ fontSize: 11, fontWeight: "800", color: "#B45309" }}>CONTACTED</Text>
          </View>
        );
      case "CONVERTED":
        return (
          <View style={{ backgroundColor: "#DCFCE7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: "#86EFAC" }}>
            <Text style={{ fontSize: 11, fontWeight: "800", color: "#15803D" }}>CONVERTED</Text>
          </View>
        );
      default:
        return (
          <View style={{ backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B" }}>{status}</Text>
          </View>
        );
    }
  };

  const renderInquiryItem = ({ item }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate(ROUTES.WORKSHOP_INQUIRY_DETAILS, { id: item._id })}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: item.status === "NEW" ? "#93C5FD" : "#E2E8F0",
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: item.status === "NEW" ? 0.08 : 0.03,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        {/* Top Header Row */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="calendar-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}>{formattedDate}</Text>
          </View>
          {renderStatusBadge(item.status)}
        </View>

        {/* Customer & Company Name */}
        <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A", marginBottom: 2 }}>
          {item.customer?.name}
        </Text>
        {item.customer?.companyName ? (
          <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600", marginBottom: 8 }}>
            {item.customer.companyName}
          </Text>
        ) : null}

        {/* Vehicle Pill */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
          <View style={{ backgroundColor: "#FEF08A", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: "#FDE047" }}>
            <Text style={{ fontSize: 12, fontWeight: "900", color: "#854D0E" }}>
              {item.vehicle?.registration}
            </Text>
          </View>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155" }}>
            {item.vehicle?.make} {item.vehicle?.model} ({item.vehicle?.year})
          </Text>
          <Text style={{ fontSize: 12, color: "#64748B" }}>
            • {item.vehicle?.odometer?.toLocaleString()} km
          </Text>
        </View>

        {/* Booking Types Chips */}
        {item.bookingTypes && item.bookingTypes.length > 0 ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {item.bookingTypes.slice(0, 3).map((type, idx) => (
              <View key={idx} style={{ backgroundColor: "#F1F5F9", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: "#475569" }}>{type}</Text>
              </View>
            ))}
            {item.bookingTypes.length > 3 ? (
              <View style={{ backgroundColor: "#F1F5F9", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B" }}>+{item.bookingTypes.length - 3}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Request snippet */}
        {item.mainJobRequest ? (
          <Text style={{ fontSize: 13, color: "#475569", lineHeight: 18, marginBottom: 12 }} numberOfLines={2}>
            "{item.mainJobRequest}"
          </Text>
        ) : null}

        {/* Action Footer */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 10 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={() => handleCallCustomer(item.customer?.mobileNumber)}
              style={{ backgroundColor: "#EFF6FF", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, flexDirection: "row", alignItems: "center" }}
            >
              <Ionicons name="call-outline" size={14} color="#2563EB" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#2563EB" }}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleWhatsAppCustomer(item.customer?.mobileNumber, item.customer?.name)}
              style={{ backgroundColor: "#DCFCE7", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, flexDirection: "row", alignItems: "center" }}
            >
              <Ionicons name="logo-whatsapp" size={14} color="#16A34A" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#16A34A" }}>WhatsApp</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#2563EB", marginRight: 2 }}>
              View Card
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#2563EB" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
              Contact Inquiries
            </Text>
            <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}>
              Customer Booking Job Cards
            </Text>
          </View>
        </View>

        {stats.newCount > 0 ? (
          <View
            style={{
              backgroundColor: "#EFF6FF",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#BFDBFE",
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "800", color: "#1D4ED8" }}>
              {stats.newCount} NEW
            </Text>
          </View>
        ) : null}
      </View>

      <FlatList
        data={inquiries}
        keyExtractor={(item) => item._id}
        renderItem={renderInquiryItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />}
        ListHeaderComponent={
          <>
            {/* Shareable Booking Form Hero Card */}
            <View
              style={{
                backgroundColor: "#0F172A",
                borderRadius: 18,
                padding: 18,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 10,
                elevation: 4,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "rgba(37, 99, 235, 0.3)", justifyContent: "center", alignItems: "center", marginRight: 8 }}>
                    <Ionicons name="link-outline" size={18} color="#60A5FA" />
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: "#FFFFFF" }}>
                    Your Public Booking Link
                  </Text>
                </View>
                <View style={{ backgroundColor: "rgba(16, 185, 129, 0.2)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: "800", color: "#34D399" }}>NO LOGIN REQUIRED</Text>
                </View>
              </View>

              <Text style={{ fontSize: 12, color: "#94A3B8", lineHeight: 18, marginBottom: 12 }}>
                Share this link with your customers or on WhatsApp. Anyone can submit a booking without signing into the app, and inquiries will arrive directly here for your workshop.
              </Text>

              {/* URL Pill Display */}
              <View
                style={{
                  backgroundColor: "#1E293B",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                  marginBottom: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 12, color: "#93C5FD", fontWeight: "600", flex: 1, marginRight: 8 }} numberOfLines={1}>
                  {publicBookingUrl}
                </Text>
                <TouchableOpacity onPress={handlePreviewLink}>
                  <Ionicons name="open-outline" size={16} color="#93C5FD" />
                </TouchableOpacity>
              </View>

              {/* Buttons: Share / Copy */}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleShareLink}
                  style={{
                    flex: 1,
                    backgroundColor: "#2563EB",
                    borderRadius: 10,
                    paddingVertical: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="share-social-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>Share Link</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleCopyLink}
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                    borderRadius: 10,
                    paddingVertical: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="copy-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>Copy Link</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* KPI Summary Stats */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              <View style={{ flex: 1, backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E2E8F0" }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B" }}>Total</Text>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F172A", marginTop: 2 }}>{stats.total}</Text>
              </View>

              <View style={{ flex: 1, backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#BFDBFE" }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#1D4ED8" }}>New</Text>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#1D4ED8", marginTop: 2 }}>{stats.newCount}</Text>
              </View>

              <View style={{ flex: 1, backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#FDE68A" }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#B45309" }}>Contacted</Text>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#B45309", marginTop: 2 }}>{stats.contactedCount}</Text>
              </View>

              <View style={{ flex: 1, backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#86EFAC" }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#15803D" }}>Converted</Text>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#15803D", marginTop: 2 }}>{stats.convertedCount}</Text>
              </View>
            </View>

            {/* Status Filter Tabs */}
            <View style={{ flexDirection: "row", backgroundColor: "#E2E8F0", borderRadius: 10, padding: 3, marginBottom: 14 }}>
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => setActiveTab(tab.key)}
                    style={{
                      flex: 1,
                      paddingVertical: 7,
                      borderRadius: 8,
                      backgroundColor: isActive ? "#FFFFFF" : "transparent",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: isActive ? "800" : "600",
                        color: isActive ? "#0F172A" : "#64748B",
                      }}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Search Bar */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: Platform.OS === "ios" ? 10 : 6,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name="search-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Search by customer, phone, rego, make..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={(txt) => {
                  setSearchQuery(txt);
                  // Debounce search
                  clearTimeout(window._searchTimer);
                  window._searchTimer = setTimeout(fetchInquiries, 400);
                }}
                style={{ flex: 1, fontSize: 13, color: "#0F172A" }}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => { setSearchQuery(""); fetchInquiries(); }}>
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <WorkshopStateView loading={true} />
          ) : error ? (
            <WorkshopStateView error={error} onRetry={fetchInquiries} />
          ) : (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 32,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#E2E8F0",
                marginTop: 8,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: "#EFF6FF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <Ionicons name="mail-open-outline" size={28} color="#2563EB" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A", marginBottom: 6 }}>
                No Inquiries Found
              </Text>
              <Text style={{ fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 20, marginBottom: 18 }}>
                Share your online booking link with customers. When they complete the form, their job cards will appear here.
              </Text>
              <TouchableOpacity
                onPress={handleShareLink}
                style={{
                  backgroundColor: "#2563EB",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 10,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Ionicons name="share-social-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>Share Booking Link</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
