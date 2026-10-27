import React from "react";
import { View, Text } from "react-native";

const STATUS_CONFIGS = {
  AVAILABLE: {
    bg: "#ECFDF5",
    text: "#059669",
    border: "#A7F3D0",
    label: "Available",
  },
  RENTED: {
    bg: "#ECFDF5",
    text: "#059669",
    border: "#A7F3D0",
    label: "Rented",
  },
  MAINTENANCE: {
    bg: "#FFFBEB",
    text: "#D97706",
    border: "#FDE68A",
    label: "Maintenance",
  },
  INACTIVE: {
    bg: "#F1F5F9",
    text: "#64748B",
    border: "#CBD5E1",
    label: "Inactive",
  },
  UPCOMING: {
    bg: "#FAF5FF",
    text: "#7C3AED",
    border: "#E9D5FF",
    label: "Upcoming",
  },
  ACTIVE: {
    bg: "#ECFDF5",
    text: "#059669",
    border: "#A7F3D0",
    label: "Active",
  },
  RETURNING_TODAY: {
    bg: "#FFF7ED",
    text: "#EA580C",
    border: "#FFEDD5",
    label: "Returning Today",
  },
  OVERDUE: {
    bg: "#FEF2F2",
    text: "#DC2626",
    border: "#FECACA",
    label: "Overdue",
  },
  RETURNED: {
    bg: "#F8FAFC",
    text: "#475569",
    border: "#E2E8F0",
    label: "Returned",
  },
  CANCELLED: {
    bg: "#F1F5F9",
    text: "#94A3B8",
    border: "#CBD5E1",
    label: "Cancelled",
  },
  Paid: {
    bg: "#ECFDF5",
    text: "#059669",
    border: "#A7F3D0",
    label: "Paid",
  },
  Pending: {
    bg: "#FFFBEB",
    text: "#D97706",
    border: "#FDE68A",
    label: "Pending",
  },
  Partial: {
    bg: "#ECFDF5",
    text: "#059669",
    border: "#A7F3D0",
    label: "Partial",
  },
};

export default function RentalStatusBadge({ status, size = "md" }) {
  const config = STATUS_CONFIGS[status] || {
    bg: "#F1F5F9",
    text: "#64748B",
    border: "#CBD5E1",
    label: status || "Unknown",
  };

  const isSmall = size === "sm";

  return (
    <View
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        borderWidth: 1,
        paddingHorizontal: isSmall ? 8 : 10,
        paddingVertical: isSmall ? 2 : 4,
        borderRadius: 8,
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{
          color: config.text,
          fontSize: isSmall ? 11 : 12,
          fontWeight: "700",
          letterSpacing: 0.2,
        }}
      >
        {config.label}
      </Text>
    </View>
  );
}
