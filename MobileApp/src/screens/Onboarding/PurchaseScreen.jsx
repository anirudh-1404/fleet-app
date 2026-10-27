import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ROUTES from "../../constants/routes";

export default function PurchaseScreen() {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState("fleet");

  const handleProceedToCheckout = () => {
    navigation.navigate(ROUTES.CHECKOUT, { plan: selectedPlan });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View
        style={{
          width: "100%",
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderColor: "#E2E8F0",
        }}
      >
        <View
          style={{
            maxWidth: 640,
            width: "100%",
            alignSelf: "center",
            paddingHorizontal: 20,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: 4, marginRight: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>
            Choose a Plan
          </Text>
        </View>
      </View>

      {/* Main Container */}
      <View
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 640,
          alignSelf: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 16,
        }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#0F172A", marginBottom: 4 }}>
            Select your business type
          </Text>
          <Text style={{ fontSize: 14, color: "#64748B", marginBottom: 20 }}>
            Pick the module designed for your day-to-day operations.
          </Text>

          {/* Option 1: Fleet Management */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedPlan("fleet")}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              padding: 18,
              marginBottom: 14,
              borderWidth: 2,
              borderColor: selectedPlan === "fleet" ? "#059669" : "#E2E8F0",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A" }}>
                Fleet Management
              </Text>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: selectedPlan === "fleet" ? "#059669" : "#F1F5F9",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selectedPlan === "fleet" && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
            </View>

            <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>
              For companies managing internal transport, vehicles, and drivers.
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#94A3B8", textDecorationLine: "line-through" }}>
                $149/mo
              </Text>
              <Text style={{ fontSize: 24, fontWeight: "900", color: "#16A34A" }}>
                Free
              </Text>
              <View style={{ backgroundColor: "#DCFCE7", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 2 }}>
                <Text style={{ fontSize: 11, fontWeight: "800", color: "#15803D" }}>100% FREE</Text>
              </View>
            </View>

            <View style={{ borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 10, gap: 6 }}>
              <Text style={{ fontSize: 13, color: "#334155" }}>• Daily driver pre-trip checklists</Text>
              <Text style={{ fontSize: 13, color: "#334155" }}>• Live journey and odometer tracking</Text>
              <Text style={{ fontSize: 13, color: "#334155" }}>• Fuel logs and maintenance reminders</Text>
            </View>
          </TouchableOpacity>

          {/* Option 2: Vehicle Rentals */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedPlan("rental")}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              padding: 18,
              marginBottom: 14,
              borderWidth: 2,
              borderColor: selectedPlan === "rental" ? "#059669" : "#E2E8F0",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A" }}>
                Vehicle Rentals
              </Text>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: selectedPlan === "rental" ? "#059669" : "#F1F5F9",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selectedPlan === "rental" && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
            </View>

            <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>
              For businesses renting cars, vans, or trucks to customers.
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#94A3B8", textDecorationLine: "line-through" }}>
                $129/mo
              </Text>
              <Text style={{ fontSize: 24, fontWeight: "900", color: "#16A34A" }}>
                Free
              </Text>
              <View style={{ backgroundColor: "#DCFCE7", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 2 }}>
                <Text style={{ fontSize: 11, fontWeight: "800", color: "#15803D" }}>100% FREE</Text>
              </View>
            </View>

            <View style={{ borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 10, gap: 6 }}>
              <Text style={{ fontSize: 13, color: "#334155" }}>• Rental agreements and customer records</Text>
              <Text style={{ fontSize: 13, color: "#334155" }}>• Automatic return date calculation</Text>
              <Text style={{ fontSize: 13, color: "#334155" }}>• Double-booking prevention and damage logs</Text>
            </View>
          </TouchableOpacity>

          {/* Option 3: Workshop Management */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedPlan("workshop")}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              padding: 18,
              marginBottom: 14,
              borderWidth: 2,
              borderColor: selectedPlan === "workshop" ? "#059669" : "#E2E8F0",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A" }}>
                Workshop Management
              </Text>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: selectedPlan === "workshop" ? "#059669" : "#F1F5F9",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selectedPlan === "workshop" && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
            </View>

            <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>
              For vehicle repair shops, servicing, and truck/trailer inspections.
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#94A3B8", textDecorationLine: "line-through" }}>
                $199/mo
              </Text>
              <Text style={{ fontSize: 24, fontWeight: "900", color: "#16A34A" }}>
                Free
              </Text>
              <View style={{ backgroundColor: "#DCFCE7", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 2 }}>
                <Text style={{ fontSize: 11, fontWeight: "800", color: "#15803D" }}>100% FREE</Text>
              </View>
            </View>

            <View style={{ borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 10, gap: 6 }}>
              <Text style={{ fontSize: 13, color: "#334155" }}>• Work orders & job lifecycle tracking</Text>
              <Text style={{ fontSize: 13, color: "#334155" }}>• Truck & trailer inspections and checklists</Text>
              <Text style={{ fontSize: 13, color: "#334155" }}>• Services, parts, invoices & collection ready</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Pinned Continue Button */}
        <View style={{ paddingTop: 12, paddingBottom: 4 }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleProceedToCheckout}
            style={{
              height: 52,
              backgroundColor: "#01311B",
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#01311B",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
