import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  Linking,
  Alert,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ROUTES from "../../constants/routes";
import { useAuth } from "../../context/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 330);

export default function WorkshopSidebarDrawer({
  visible,
  onClose,
  user,
  summary = {},
  onLogout,
}) {
  const navigation = useNavigation();
  const { modules } = useAuth();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Compute safe padding for all device notches, dynamic islands & status bars
  const topInset = Math.max(
    insets.top,
    Platform.OS === "ios" ? 54 : (StatusBar.currentHeight || 28)
  );
  const bottomInset = Math.max(insets.bottom, Platform.OS === "ios" ? 24 : 12);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleNavigate = (routeName, params) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      if (routeName) {
        navigation.navigate(routeName, params);
      }
    });
  };

  const getInitials = (name) => {
    if (!name) return "WM";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleOpenWebsite = () => {
    Linking.openURL("https://www.itechloombas.com/").catch((err) =>
      console.warn("Could not open link:", err)
    );
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlayContainer}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        {/* Center column constraint for web browser shell */}
        <View style={styles.webShellConstraint} pointerEvents="box-none">
          {/* Sliding Sidebar */}
          <Animated.View
            style={[
              styles.drawerContent,
              {
                width: DRAWER_WIDTH,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
          <View style={{ flex: 1 }}>
            {/* Header with Brand & Close Button */}
            <View style={[styles.drawerHeader, { paddingTop: topInset + 8 }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={styles.brandIconBox}>
                  <Ionicons name="construct" size={18} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.brandTitle}>Workfle</Text>
                  <Text style={styles.brandSubtitle}>Workshop Manager</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* User Profile Card */}
            <View style={styles.userCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.name || "Workshop Admin"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 }}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.userRole}>
                    {user?.role === "admin" ? "Workshop Admin" : "Workshop Manager"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Menu Sections List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.menuScroll}
            >
              {/* SECTION: OPERATIONS */}
              <Text style={styles.sectionHeader}>OPERATIONS</Text>

              {/* Work Orders */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handleNavigate(ROUTES.WORKSHOP_WORKORDER_LIST)}
                style={styles.menuItem}
              >
                <View style={[styles.menuIconBox, { backgroundColor: "#ECFDF5" }]}>
                  <Ionicons name="clipboard-outline" size={19} color="#059669" />
                </View>
                <Text style={styles.menuTitle}>Work Orders</Text>
                {summary.openWorkOrders > 0 && (
                  <View style={[styles.badgePill, { backgroundColor: "#A7F3D0" }]}>
                    <Text style={[styles.badgeText, { color: "#047857" }]}>
                      {summary.openWorkOrders}
                    </Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
              </TouchableOpacity>

              {/* Contact Inquiries */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handleNavigate(ROUTES.WORKSHOP_INQUIRIES)}
                style={styles.menuItem}
              >
                <View style={[styles.menuIconBox, { backgroundColor: "#DCFCE7" }]}>
                  <Ionicons name="mail-unread-outline" size={19} color="#15803D" />
                </View>
                <Text style={styles.menuTitle}>Contact Inquiries</Text>
                <View style={[styles.badgePill, { backgroundColor: "#DCFCE7" }]}>
                  <Text style={[styles.badgeText, { color: "#15803D" }]}>Leads</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
              </TouchableOpacity>

              {/* Schedule / Due Service */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handleNavigate(ROUTES.WORKSHOP_SCHEDULE)}
                style={styles.menuItem}
              >
                <View style={[styles.menuIconBox, { backgroundColor: "#F1F5F9" }]}>
                  <Ionicons name="calendar-outline" size={19} color="#475569" />
                </View>
                <Text style={styles.menuTitle}>Workshop Schedule</Text>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
              </TouchableOpacity>

              {/* SECTION: CUSTOMERS & FLEET */}
              <Text style={styles.sectionHeader}>CUSTOMERS & FLEET</Text>

              {/* Customers */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handleNavigate(ROUTES.WORKSHOP_CUSTOMER_LIST)}
                style={styles.menuItem}
              >
                <View style={[styles.menuIconBox, { backgroundColor: "#ECFDF5" }]}>
                  <Ionicons name="people-outline" size={19} color="#059669" />
                </View>
                <Text style={styles.menuTitle}>Customers</Text>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
              </TouchableOpacity>

              {/* Vehicles */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handleNavigate(ROUTES.WORKSHOP_VEHICLE_LIST)}
                style={styles.menuItem}
              >
                <View style={[styles.menuIconBox, { backgroundColor: "#FEF3C7" }]}>
                  <Ionicons name="car-outline" size={19} color="#D97706" />
                </View>
                <Text style={styles.menuTitle}>Vehicles</Text>
                {summary.vehiclesInWorkshop > 0 && (
                  <View style={[styles.badgePill, { backgroundColor: "#FEF3C7" }]}>
                    <Text style={[styles.badgeText, { color: "#B45309" }]}>
                      {summary.vehiclesInWorkshop} In Bay
                    </Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
              </TouchableOpacity>

              {/* SECTION: BILLING & INVOICING */}
              <Text style={styles.sectionHeader}>FINANCE & BILLING</Text>

              {/* Invoices */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handleNavigate(ROUTES.WORKSHOP_INVOICE_LIST)}
                style={styles.menuItem}
              >
                <View style={[styles.menuIconBox, { backgroundColor: "#DCFCE7" }]}>
                  <Ionicons name="receipt-outline" size={19} color="#16A34A" />
                </View>
                <Text style={styles.menuTitle}>Tax Invoices (PDF)</Text>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
              </TouchableOpacity>

              {/* SECTION: TEAM & WORKFORCE */}
              <Text style={styles.sectionHeader}>TEAM & DISPATCH</Text>

              {/* Technicians / Employees */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handleNavigate(ROUTES.WORKSHOP_EMPLOYEE_LIST)}
                style={styles.menuItem}
              >
                <View style={[styles.menuIconBox, { backgroundColor: "#E0E7FF" }]}>
                  <Ionicons name="id-card-outline" size={19} color="#4338CA" />
                </View>
                <Text style={styles.menuTitle}>Technicians & Staff</Text>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
              </TouchableOpacity>

              {/* Team Chat */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handleNavigate(ROUTES.WORKSHOP_EMPLOYEE_CHAT)}
                style={styles.menuItem}
              >
                <View style={[styles.menuIconBox, { backgroundColor: "#ECFDF5" }]}>
                  <Ionicons name="chatbubbles-outline" size={19} color="#059669" />
                </View>
                <Text style={styles.menuTitle}>Team Chat</Text>
                <View style={[styles.badgePill, { backgroundColor: "#FEF3C7" }]}>
                  <Text style={[styles.badgeText, { color: "#D97706" }]}>Coming Soon</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
              </TouchableOpacity>

              {/* SECTION: QUICK UTILITIES */}
              <Text style={styles.sectionHeader}>QUICK UTILITIES</Text>

              {/* Contacts */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handleNavigate(ROUTES.WORKSHOP_CONTACTS)}
                style={styles.menuItem}
              >
                <View style={[styles.menuIconBox, { backgroundColor: "#ECFDF5" }]}>
                  <Ionicons name="call-outline" size={19} color="#059669" />
                </View>
                <Text style={styles.menuTitle}>Suppliers & Contacts</Text>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
              </TouchableOpacity>

              {/* Workshop Notes */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handleNavigate(ROUTES.WORKSHOP_NOTES)}
                style={styles.menuItem}
              >
                <View style={[styles.menuIconBox, { backgroundColor: "#FEF9C3" }]}>
                  <Ionicons name="document-text-outline" size={19} color="#CA8A04" />
                </View>
                <Text style={styles.menuTitle}>Workshop Notes</Text>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
              </TouchableOpacity>
            </ScrollView>

            {/* Bottom Drawer Footer */}
            <View style={[styles.drawerFooter, { paddingBottom: bottomInset + 8 }]}>
              {/* Switch Workspace if multiple modules */}
              {modules && modules.length > 1 && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    onClose();
                    navigation.navigate(ROUTES.MODULE_SELECTION);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#ECFDF5",
                    borderWidth: 1,
                    borderColor: "#A7F3D0",
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 10,
                    marginBottom: 8,
                    gap: 8,
                  }}
                >
                  <Ionicons name="grid-outline" size={18} color="#059669" />
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#065F46" }}>Switch Workspace</Text>
                </TouchableOpacity>
              )}

              {/* Logout Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  onClose();
                  setTimeout(() => {
                    if (onLogout) onLogout();
                  }, 150);
                }}
                style={styles.logoutBtn}
              >
                <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>

              {/* itechloombas credit link */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleOpenWebsite}
                style={styles.creditBox}
              >
                <Text style={styles.creditText}>
                  Designed & Developed by{" "}
                  <Text style={styles.creditLink}>itechloombas</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    flexDirection: "row",
  },
  webShellConstraint: {
    flex: 1,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 1200 : undefined,
    alignSelf: "center",
    flexDirection: "row",
    position: "relative",
    height: "100%",
  },
  backdrop: {
    ...StyleSheet.FillObject,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
  },
  drawerContent: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 16,
  },
  drawerHeader: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  brandIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  userName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  userRole: {
    fontSize: 10,
    fontWeight: "700",
    color: "#10B981",
  },
  menuScroll: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 6,
    paddingHorizontal: 6,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 2,
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  badgePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  drawerFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  logoutText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#EF4444",
  },
  creditBox: {
    marginTop: 10,
    alignItems: "center",
  },
  creditText: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "500",
  },
  creditLink: {
    color: "#059669",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
