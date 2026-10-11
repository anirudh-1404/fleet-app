import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ROUTES from "../../constants/routes";
import { useAuth } from "../../context/AuthContext";

const logoImg = require("../../../assets/logo.png");

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const { user, role } = useAuth();

  useEffect(() => {
    if (user && role) {
      if (role === "workshop_manager") {
        navigation.reset({ index: 0, routes: [{ name: "WorkshopStack" }] });
      } else if (role === "workshop_employee") {
        navigation.reset({ index: 0, routes: [{ name: "WorkshopEmployeeStack" }] });
      } else if (role === "manager") {
        navigation.reset({ index: 0, routes: [{ name: "ManagerStack" }] });
      } else if (role === "rental_owner") {
        navigation.reset({ index: 0, routes: [{ name: "RentalStack" }] });
      } else if (role === "driver") {
        navigation.reset({ index: 0, routes: [{ name: "DriverStack" }] });
      }
    }
  }, [user, role]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View
        style={{
          flex: 1,
          paddingHorizontal: 28,
          justifyContent: "space-between",
          paddingVertical: 24,
          maxWidth: 640,
          width: "100%",
          alignSelf: "center",
        }}
      >
        {/* Top Logo Row */}
        <View style={{ paddingTop: 28, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Image
            source={logoImg}
            style={{ width: 44, height: 44, borderRadius: 12 }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#0F172A", letterSpacing: -0.5 }}>
            Workfle
          </Text>
        </View>

        {/* Center Simple Headline */}
        <View style={{ marginVertical: "auto" }}>
          <Text style={{ fontSize: 32, fontWeight: "800", color: "#0F172A", lineHeight: 42, letterSpacing: -0.5 }}>
            Fleet management & vehicle rentals, simplified.
          </Text>

          <Text style={{ fontSize: 16, color: "#64748B", lineHeight: 24, marginTop: 12 }}>
            Track your vehicles, manage driver pre-trip checks, and handle customer rentals with ease.
          </Text>
        </View>

        {/* Bottom Buttons */}
        <View style={{ gap: 12, paddingBottom: 12 }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate(ROUTES.PURCHASE)}
            style={{
              height: 52,
              backgroundColor: "#2563EB",
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
              Get Started
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate(ROUTES.LOGIN)}
            style={{
              height: 52,
              backgroundColor: "#F8FAFC",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#0F172A", fontSize: 15, fontWeight: "600" }}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
