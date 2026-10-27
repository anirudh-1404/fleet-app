import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function JobMessagesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { jobNumber } = route.params || {};

  const [notified, setNotified] = useState(false);

  const handleNotifyMe = () => {
    setNotified(true);
    Alert.alert(
      "You're on the list! 🎉",
      "Thank you for your interest! We'll notify you as soon as Team Chat is activated in your portal."
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Navigation Bar */}
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
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A" }}>
              Team Chat
            </Text>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#64748B" }}>
              {jobNumber ? `Work Order #${jobNumber}` : "Fleet & Workshop Collaboration"}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#FEF3C7",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#FDE68A",
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "800", color: "#B45309" }}>
            COMING SOON
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 24,
          paddingBottom: 48,
          alignItems: "center",
        }}
      >
        {/* Glowing Chat Icon Container */}
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 30,
            backgroundColor: "#ECFDF5",
            borderWidth: 2,
            borderColor: "#A7F3D0",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 16,
            marginBottom: 20,
            shadowColor: "#059669",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 4,
          }}
        >
          <Ionicons name="chatbubbles" size={48} color="#059669" />
        </View>

        {/* Coming Soon Pill */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#ECFDF5",
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#A7F3D0",
            marginBottom: 12,
          }}
        >
          <Ionicons name="sparkles" size={14} color="#059669" style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 12, fontWeight: "800", color: "#047857", letterSpacing: 0.5 }}>
            FEATURE IN PROGRESS 🚀
          </Text>
        </View>

        {/* Headline & Description */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "800",
            color: "#0F172A",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Team Chat & Live Messaging
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#64748B",
            textAlign: "center",
            lineHeight: 22,
            marginBottom: 28,
            maxWidth: 340,
          }}
        >
          Real-time messaging between fleet managers, drivers, and mechanics is currently under construction. You will soon be able to coordinate repairs and dispatches seamlessly.
        </Text>

        {/* Feature Highlights Grid */}
        <View style={{ width: "100%", gap: 12, marginBottom: 32 }}>
          {/* Highlight 1 */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              flexDirection: "row",
              alignItems: "center",
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.03,
              shadowRadius: 8,
              elevation: 1,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: "#ECFDF5",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 14,
              }}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A", marginBottom: 2 }}>
                Direct & Group Messaging
              </Text>
              <Text style={{ fontSize: 12, color: "#64748B", lineHeight: 18 }}>
                1-on-1 driver dispatch chats & workshop group channels.
              </Text>
            </View>
          </View>

          {/* Highlight 2 */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              flexDirection: "row",
              alignItems: "center",
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.03,
              shadowRadius: 8,
              elevation: 1,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: "#F0FDF4",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 14,
              }}
            >
              <Ionicons name="camera-outline" size={22} color="#16A34A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A", marginBottom: 2 }}>
                Photo & Defect Sharing
              </Text>
              <Text style={{ fontSize: 12, color: "#64748B", lineHeight: 18 }}>
                Instantly send inspection defect photos and repair updates.
              </Text>
            </View>
          </View>

          {/* Highlight 3 */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              flexDirection: "row",
              alignItems: "center",
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.03,
              shadowRadius: 8,
              elevation: 1,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: "#FEF3C7",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 14,
              }}
            >
              <Ionicons name="notifications-outline" size={22} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A", marginBottom: 2 }}>
                Push Alerts & Priority Mentions
              </Text>
              <Text style={{ fontSize: 12, color: "#64748B", lineHeight: 18 }}>
                Instant notifications for urgent jobs and vehicle breakdowns.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ width: "100%", gap: 12 }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: "#059669",
              borderRadius: 14,
              paddingVertical: 15,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#059669",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#FFFFFF" }}>
              Back to Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleNotifyMe}
            style={{
              backgroundColor: notified ? "#F0FDF4" : "#FFFFFF",
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: notified ? "#86EFAC" : "#E2E8F0",
              flexDirection: "row",
            }}
          >
            <Ionicons
              name={notified ? "checkmark-circle" : "notifications-outline"}
              size={18}
              color={notified ? "#16A34A" : "#64748B"}
              style={{ marginRight: 6 }}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: notified ? "#16A34A" : "#334155",
              }}
            >
              {notified ? "We'll Notify You" : "Notify Me When Ready"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
