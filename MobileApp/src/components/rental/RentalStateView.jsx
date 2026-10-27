import React from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RentalStateView({
  type = "loading", // "loading" | "empty" | "error"
  title,
  message,
  onRetry,
  actionText = "Try Again",
  icon = "alert-circle-outline",
}) {
  if (type === "loading") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={{ marginTop: 12, fontSize: 14, color: "#64748B", fontWeight: "500" }}>
          {message || "Loading..."}
        </Text>
      </View>
    );
  }

  if (type === "error") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: "#FEF2F2",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Ionicons name="alert-circle" size={32} color="#DC2626" />
        </View>
        <Text style={{ fontSize: 17, fontWeight: "700", color: "#0F172A", marginBottom: 6, textAlign: "center" }}>
          {title || "Something went wrong"}
        </Text>
        <Text style={{ fontSize: 14, color: "#64748B", textAlign: "center", marginBottom: 20 }}>
          {message || "Unable to load data at this time."}
        </Text>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            style={{
              backgroundColor: "#059669",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 14 }}>{actionText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // type === "empty"
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#F1F5F9",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Ionicons name={icon} size={30} color="#64748B" />
      </View>
      <Text style={{ fontSize: 17, fontWeight: "700", color: "#0F172A", marginBottom: 6, textAlign: "center" }}>
        {title || "No records found"}
      </Text>
      <Text style={{ fontSize: 14, color: "#64748B", textAlign: "center", marginBottom: onRetry ? 20 : 0 }}>
        {message || "There are no items to display right now."}
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={{
            backgroundColor: "#F8FAFC",
            borderWidth: 1,
            borderColor: "#CBD5E1",
            paddingHorizontal: 18,
            paddingVertical: 9,
            borderRadius: 10,
            marginTop: 12,
          }}
        >
          <Text style={{ color: "#334155", fontWeight: "600", fontSize: 14 }}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
