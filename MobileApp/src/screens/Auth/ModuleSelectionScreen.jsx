import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

import ROUTES from "../../constants/routes";

const logoImg = require("../../../assets/logo.png");

const MODULE_DEFINITIONS = {
  manager: {
    id: "manager",
    title: "Fleet Management",
    tagline: "Fleet Operations & Driver Logs",
    description: "Track live fleet, review driver DVIR inspections, schedule service, and manage fuel & operating costs.",
    icon: "bus-outline",
    stackName: "ManagerStack",
    badge: "Fleet Active",
    color: "#059669",
    bgSoft: "#ECFDF5",
    border: "#A7F3D0",
  },
  workshop_manager: {
    id: "workshop_manager",
    title: "Workshop Management",
    tagline: "Job Cards & Maintenance Hub",
    description: "Create customer work orders, manage technician checklists, monitor parts inventory, and invoice repairs.",
    icon: "construct-outline",
    stackName: "WorkshopStack",
    badge: "Workshop Active",
    color: "#047857",
    bgSoft: "#ECFDF5",
    border: "#A7F3D0",
  },
  rental_owner: {
    id: "rental_owner",
    title: "Vehicle Rental",
    tagline: "Bookings & Rental Fleet",
    description: "Manage vehicle reservations, customer agreements, security deposits, and return condition inspections.",
    icon: "key-outline",
    stackName: "RentalStack",
    badge: "Rental Active",
    color: "#059669",
    bgSoft: "#ECFDF5",
    border: "#A7F3D0",
  },
  driver: {
    id: "driver",
    title: "Driver Portal",
    tagline: "Pre-trip Inspections & Runs",
    description: "Perform daily DVIR pre-check inspections and review assigned vehicle details.",
    icon: "speedometer-outline",
    stackName: "DriverStack",
    badge: "Driver Portal",
    color: "#047857",
    bgSoft: "#ECFDF5",
    border: "#A7F3D0",
  },
  workshop_employee: {
    id: "workshop_employee",
    title: "Technician Portal",
    tagline: "Assigned Work Orders",
    description: "View assigned repair jobs, complete inspection checklists, and upload service photos.",
    icon: "hardware-chip-outline",
    stackName: "WorkshopEmployeeStack",
    badge: "Technician Portal",
    color: "#065F46",
    bgSoft: "#ECFDF5",
    border: "#A7F3D0",
  },
};

export default function ModuleSelectionScreen({ navigation }) {
  const { user, modules, role, switchModule, logout, refreshUser } = useAuth();

  React.useEffect(() => {
    if (refreshUser && (!user?.name || user.name.trim().toLowerCase() === "user")) {
      refreshUser();
    }
  }, []);

  const displayName = React.useMemo(() => {
    const rawName = user?.name?.trim();
    if (rawName && rawName.toLowerCase() !== "user") {
      return rawName;
    }
    if (user?.email) {
      const emailPrefix = user.email.split("@")[0];
      return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }
    return "Partner";
  }, [user]);

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Sign out error:", e);
    }
    const rootNav = navigation.getParent() || navigation;
    rootNav.reset({
      index: 0,
      routes: [{ name: ROUTES.LOGIN }],
    });
  };

  // Normalize user modules list
  const availableModules =
    modules && modules.length > 0
      ? modules
      : user?.modules && user.modules.length > 0
      ? user.modules
      : [role || user?.role || "manager"];

  const handleSelect = async (modKey) => {
    const config = MODULE_DEFINITIONS[modKey];
    if (!config) return;
    await switchModule(modKey);
    navigation.reset({
      index: 0,
      routes: [{ name: config.stackName }],
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header Bar */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: Platform.OS === "android" ? 24 : 12,
          paddingBottom: 16,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderColor: "#E2E8F0",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Image
            source={logoImg}
            style={{ width: 40, height: 40, borderRadius: 10 }}
            resizeMode="contain"
          />
          <View>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#01311B", letterSpacing: -0.3 }}>
              Workfle
            </Text>
            <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "500" }}>
              Enterprise Workspace
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            backgroundColor: "#FEE2E2",
          }}
        >
          <Ionicons name="log-out-outline" size={16} color="#DC2626" />
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#DC2626" }}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 40,
          maxWidth: 640,
          width: "100%",
          alignSelf: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Greeting */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#059669", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Select Workspace
          </Text>
          <Text style={{ fontSize: 26, fontWeight: "800", color: "#0F172A", marginTop: 4, letterSpacing: -0.5 }}>
            Welcome, {displayName} 👋
          </Text>
          <Text style={{ fontSize: 14, color: "#64748B", marginTop: 6, lineHeight: 22 }}>
            Your account is authorized for multiple modules. Select the workspace you want to access today:
          </Text>
        </View>

        {/* Module Cards */}
        <View style={{ gap: 16 }}>
          {availableModules.map((modKey) => {
            const config = MODULE_DEFINITIONS[modKey];
            if (!config) return null;
            const isCurrentActive = role === modKey;

            return (
              <TouchableOpacity
                key={modKey}
                activeOpacity={0.88}
                onPress={() => handleSelect(modKey)}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 18,
                  padding: 20,
                  borderWidth: 2,
                  borderColor: isCurrentActive ? "#059669" : "#E2E8F0",
                  shadowColor: "#01311B",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.05,
                  shadowRadius: 12,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                    <View
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        backgroundColor: config.bgSoft,
                        borderWidth: 1,
                        borderColor: config.border,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name={config.icon} size={28} color={config.color} />
                    </View>
                    <View>
                      <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A", letterSpacing: -0.3 }}>
                        {config.title}
                      </Text>
                      <Text style={{ fontSize: 12, fontWeight: "600", color: config.color, marginTop: 2 }}>
                        {config.tagline}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#F1F5F9",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="arrow-forward" size={18} color="#0F172A" />
                  </View>
                </View>

                <Text style={{ fontSize: 13, color: "#64748B", marginTop: 14, lineHeight: 20 }}>
                  {config.description}
                </Text>

                <View
                  style={{
                    marginTop: 16,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderColor: "#F1F5F9",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: config.bgSoft,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "700", color: config.color }}>
                      {config.badge}
                    </Text>
                  </View>

                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#059669" }}>
                    Enter Workspace →
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
