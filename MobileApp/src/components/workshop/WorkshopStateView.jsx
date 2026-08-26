import React from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WorkshopStateView({
  loading,
  error,
  empty,
  emptyTitle = "No records found",
  emptySubtitle = "Get started by adding your first record.",
  emptyActionLabel,
  onEmptyAction,
  onRetry,
  icon = "document-text-outline",
}) {
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 12, fontSize: 14, color: "#64748B", fontWeight: "500" }}>
          Loading workshop data...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: "#FEE2E2",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Ionicons name="alert-circle-outline" size={32} color="#DC2626" />
        </View>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#0F172A", textAlign: "center" }}>
          Failed to Load Data
        </Text>
        <Text style={{ fontSize: 13, color: "#64748B", marginTop: 6, textAlign: "center", lineHeight: 18 }}>
          {error}
        </Text>
        {onRetry && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onRetry}
            style={{
              marginTop: 18,
              backgroundColor: "#2563EB",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" }}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (empty) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#F1F5F9",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Ionicons name={icon} size={30} color="#64748B" />
        </View>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#0F172A", textAlign: "center" }}>
          {emptyTitle}
        </Text>
        <Text style={{ fontSize: 13, color: "#64748B", marginTop: 6, textAlign: "center", lineHeight: 18 }}>
          {emptySubtitle}
        </Text>
        {emptyActionLabel && onEmptyAction && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onEmptyAction}
            style={{
              marginTop: 18,
              backgroundColor: "#2563EB",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" }}>
              {emptyActionLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return null;
}
