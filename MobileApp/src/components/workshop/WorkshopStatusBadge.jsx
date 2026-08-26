import React from "react";
import { View, Text } from "react-native";

export default function WorkshopStatusBadge({ status, size = "normal" }) {
  if (!status) return null;

  const s = String(status).toUpperCase();

  let dotColor = "#64748B";
  let bg = "#F1F5F9";
  let textColor = "#334155";

  if (s === "OPEN" || s === "AVAILABLE") {
    dotColor = "#2563EB";
    bg = "#EFF6FF";
    textColor = "#1E40AF";
  } else if (s === "IN_PROGRESS" || s === "IN_WORKSHOP" || s === "INSPECTION_PENDING") {
    dotColor = "#D97706";
    bg = "#FFFBEB";
    textColor = "#92400E";
  } else if (s === "WAITING_FOR_PARTS" || s === "URGENT" || s === "DUE") {
    dotColor = "#EA580C";
    bg = "#FFF7ED";
    textColor = "#9A3412";
  } else if (s === "READY_FOR_COLLECTION") {
    dotColor = "#7C3AED";
    bg = "#FAF5FF";
    textColor = "#6B21A8";
  } else if (s === "COMPLETED" || s === "PASSED" || s === "PASS") {
    dotColor = "#16A34A";
    bg = "#F0FDF4";
    textColor = "#166534";
  } else if (s === "CANCELLED" || s === "FAILED" || s === "FAIL" || s === "CRITICAL" || s === "OVERDUE" || s === "INACTIVE") {
    dotColor = "#DC2626";
    bg = "#FEF2F2";
    textColor = "#991B1B";
  } else if (s === "OUTSIDE_WORKSHOP" || s === "UPCOMING") {
    dotColor = "#64748B";
    bg = "#F8FAFC";
    textColor = "#475569";
  }

  const isSmall = size === "small";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: bg,
        paddingHorizontal: isSmall ? 8 : 10,
        paddingVertical: isSmall ? 3 : 5,
        borderRadius: 20,
        alignSelf: "flex-start",
      }}
    >
      <View
        style={{
          width: isSmall ? 5 : 6,
          height: isSmall ? 5 : 6,
          borderRadius: 3,
          backgroundColor: dotColor,
          marginRight: 5,
        }}
      />
      <Text
        style={{
          color: textColor,
          fontSize: isSmall ? 11 : 12,
          fontWeight: "600",
          letterSpacing: 0.2,
        }}
      >
        {s.replace(/_/g, " ")}
      </Text>
    </View>
  );
}
