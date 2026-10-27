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
          <View style={{ backgroundColor: "#ECFDF5", paddingHorizontal: 9, paddingVertical: 3.5, borderRadius: 6, borderWidth: 1, borderColor: "#A7F3D0" }}>
            <Text style={{ fontSize: 10, fontWeight: "800", color: "#047857", letterSpacing: 0.3 }}>NEW LEAD</Text>
          </View>
        );
      case "CONTACTED":
        return (
          <View style={{ backgroundColor: "#FEF3C7", paddingHorizontal: 9, paddingVertical: 3.5, borderRadius: 6, borderWidth: 1, borderColor: "#FDE68A" }}>
            <Text style={{ fontSize: 10, fontWeight: "800", color: "#B45309", letterSpacing: 0.3 }}>CONTACTED</Text>
          </View>
        );
      case "CONVERTED":
        return (
          <View style={{ backgroundColor: "#DCFCE7", paddingHorizontal: 9, paddingVertical: 3.5, borderRadius: 6, borderWidth: 1, borderColor: "#86EFAC" }}>
            <Text style={{ fontSize: 10, fontWeight: "800", color: "#15803D", letterSpacing: 0.3 }}>CONVERTED</Text>
          </View>
        );
      default:
        return (
          <View style={{ backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 3.5, borderRadius: 6 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: "#64748B" }}>{status}</Text>
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
        activeOpacity={0.88}
        onPress={() => navigation.navigate(ROUTES.WORKSHOP_INQUIRY_DETAILS, { id: item._id })}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          padding: 16,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: item.status === "NEW" ? "#6EE7B7" : "#E2E8F0",
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: item.status === "NEW" ? 0.08 : 0.03,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        {/* Top Header Row */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="calendar-outline" size={13} color="#64748B" style={{ marginRight: 5 }} />
            <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}>{formattedDate}</Text>
          </View>
          {renderStatusBadge(item.status)}
        </View>

        {/* Customer & Company Name */}
        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }} numberOfLines={1}>
            {item.customer?.name || "Customer Name"}
          </Text>
          {item.customer?.companyName ? (
            <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600", marginTop: 2 }} numberOfLines={1}>
              {item.customer.companyName}
            </Text>
          ) : null}
        </View>

        {/* Vehicle Details Box - Stable Structured Row */}
        <View
          style={{
            backgroundColor: "#F8FAFC",
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 9,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: "#F1F5F9",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 }}>
              {/* Australian Style Number Plate */}
              <View
                style={{
                  backgroundColor: "#FEF08A",
                  paddingHorizontal: 7,
                  paddingVertical: 2.5,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: "#FDE047",
                  marginRight: 8,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "900", color: "#854D0E", letterSpacing: 0.5 }}>
                  {item.vehicle?.registration || "NO REGO"}
                </Text>
              </View>

              {/* Make & Model */}
              <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: "#1E293B", flex: 1 }}>
                {item.vehicle?.make} {item.vehicle?.model} {item.vehicle?.year ? `(${item.vehicle.year})` : ""}
              </Text>
            </View>

            {/* Odometer */}
            {item.vehicle?.odometer ? (
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B" }}>
                {Number(item.vehicle.odometer).toLocaleString()} km
              </Text>
            ) : null}
          </View>
        </View>

        {/* Booking Types Chips */}
        {item.bookingTypes && item.bookingTypes.length > 0 ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {item.bookingTypes.slice(0, 3).map((type, idx) => (
              <View
                key={idx}
                style={{
                  backgroundColor: "#ECFDF5",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: "#A7F3D0",
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "600", color: "#047857" }}>{type}</Text>
              </View>
            ))}
            {item.bookingTypes.length > 3 ? (
              <View
                style={{
                  backgroundColor: "#F1F5F9",
                  paddingHorizontal: 7,
                  paddingVertical: 3,
                  borderRadius: 6,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B" }}>
                  +{item.bookingTypes.length - 3} more
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Request snippet */}
        {item.mainJobRequest ? (
          <View
            style={{
              backgroundColor: "#F8FAFC",
              borderLeftWidth: 3,
              borderLeftColor: "#10B981",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 4,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 12, color: "#475569", lineHeight: 17, fontStyle: "italic" }} numberOfLines={2}>
              "{item.mainJobRequest}"
            </Text>
          </View>
        ) : null}

        {/* Action Footer */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderTopWidth: 1,
            borderTopColor: "#F1F5F9",
            paddingTop: 10,
          }}
        >
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => handleCallCustomer(item.customer?.mobileNumber)}
              style={{
                backgroundColor: "#ECFDF5",
                paddingHorizontal: 12,
                paddingVertical: 6.5,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons name="call-outline" size={13} color="#059669" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#059669" }}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => handleWhatsAppCustomer(item.customer?.mobileNumber, item.customer?.name)}
              style={{
                backgroundColor: "#DCFCE7",
                paddingHorizontal: 12,
                paddingVertical: 6.5,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons name="logo-whatsapp" size={13} color="#16A34A" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#16A34A" }}>WhatsApp</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#059669", marginRight: 2 }}>
              View Card
            </Text>
            <Ionicons name="chevron-forward" size={15} color="#059669" />
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
              backgroundColor: "#ECFDF5",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#A7F3D0",
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "800", color: "#047857" }}>
              {stats.newCount} NEW
            </Text>
          </View>
        ) : null}
      </View>

      <FlatList
        data={inquiries}
        keyExtractor={(item) => item._id}
        renderItem={renderInquiryItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} />}
        ListHeaderComponent={
          <>
            {/* Shareable Booking Form Hero Card */}
            <View
              style={{
                backgroundColor: "#0F172A",
                borderRadius: 18,
                padding: 16,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 10,
                elevation: 4,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: "rgba(37, 99, 235, 0.35)",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 8,
                    }}
                  >
                    <Ionicons name="link-outline" size={17} color="#34D399" />
                  </View>
                  <Text
                    style={{ fontSize: 15, fontWeight: "800", color: "#FFFFFF", flexShrink: 1 }}
                    numberOfLines={1}
                  >
                    Public Booking Link
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "rgba(16, 185, 129, 0.2)",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: "rgba(52, 211, 153, 0.3)",
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: "800", color: "#34D399", letterSpacing: 0.4 }}>
                    NO LOGIN
                  </Text>
                </View>
              </View>

              <Text style={{ fontSize: 12, color: "#94A3B8", lineHeight: 18, marginBottom: 12 }}>
                Share this link with your customers. Anyone can book online without an account, and inquiries arrive instantly here.
              </Text>

              {/* URL Pill Display */}
              <View
                style={{
                  backgroundColor: "#1E293B",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                  marginBottom: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 12, color: "#6EE7B7", fontWeight: "600", flex: 1, marginRight: 8 }} numberOfLines={1}>
                  {publicBookingUrl}
                </Text>
                <TouchableOpacity onPress={handlePreviewLink} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="open-outline" size={16} color="#6EE7B7" />
                </TouchableOpacity>
              </View>

              {/* Buttons: Share / Copy */}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleShareLink}
                  style={{
                    flex: 1,
                    backgroundColor: "#059669",
                    borderRadius: 10,
                    paddingVertical: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="share-social-outline" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
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
                  <Ionicons name="copy-outline" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>Copy Link</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* KPI Summary Stats - Perfectly balanced and aligned */}
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 14 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 4,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 64,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A" }}>{stats.total}</Text>
                <Text numberOfLines={1} style={{ fontSize: 10, fontWeight: "700", color: "#64748B", marginTop: 3 }}>
                  Total
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: "#F0F7FF",
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 4,
                  borderWidth: 1,
                  borderColor: "#A7F3D0",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 64,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "900", color: "#047857" }}>{stats.newCount}</Text>
                <Text numberOfLines={1} style={{ fontSize: 10, fontWeight: "700", color: "#047857", marginTop: 3 }}>
                  New
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: "#FFFBEB",
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 4,
                  borderWidth: 1,
                  borderColor: "#FDE68A",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 64,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "900", color: "#B45309" }}>{stats.contactedCount}</Text>
                <Text numberOfLines={1} style={{ fontSize: 10, fontWeight: "700", color: "#B45309", marginTop: 3 }}>
                  Contacted
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: "#F0FDF4",
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 4,
                  borderWidth: 1,
                  borderColor: "#86EFAC",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 64,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "900", color: "#15803D" }}>{stats.convertedCount}</Text>
                <Text numberOfLines={1} style={{ fontSize: 10, fontWeight: "700", color: "#15803D", marginTop: 3 }}>
                  Converted
                </Text>
              </View>
            </View>

            {/* Status Filter Tabs - Scrollable Pills with Count Badges */}
            <View style={{ marginBottom: 12 }}>
              <FlatList
                horizontal
                data={TABS}
                keyExtractor={(t) => t.key}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingBottom: 2 }}
                renderItem={({ item: tab }) => {
                  const isActive = activeTab === tab.key;
                  const count =
                    tab.key === "ALL"
                      ? stats.total
                      : tab.key === "NEW"
                      ? stats.newCount
                      : tab.key === "CONTACTED"
                      ? stats.contactedCount
                      : stats.convertedCount;

                  return (
                    <TouchableOpacity
                      key={tab.key}
                      activeOpacity={0.8}
                      onPress={() => setActiveTab(tab.key)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderRadius: 20,
                        backgroundColor: isActive ? "#0F172A" : "#FFFFFF",
                        borderWidth: 1,
                        borderColor: isActive ? "#0F172A" : "#E2E8F0",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: isActive ? "800" : "600",
                          color: isActive ? "#FFFFFF" : "#64748B",
                          marginRight: 6,
                        }}
                      >
                        {tab.label}
                      </Text>
                      <View
                        style={{
                          backgroundColor: isActive ? "rgba(255, 255, 255, 0.22)" : "#F1F5F9",
                          paddingHorizontal: 6,
                          paddingVertical: 1.5,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "800",
                            color: isActive ? "#FFFFFF" : "#64748B",
                          }}
                        >
                          {count}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
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
                  backgroundColor: "#ECFDF5",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <Ionicons name="mail-open-outline" size={28} color="#059669" />
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
                  backgroundColor: "#059669",
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
