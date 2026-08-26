import React from "react";
import { View, Text } from "react-native";

export default function WorkshopStatusBadge({ status, type = "status", size = "normal" }) {
  if (!status) return null;

  let bg = "#F1F5F9";
  let text = "#475569";
  let border = "#E2E8F0";

  const s = String(status).toUpperCase();

  // Work Order & Vehicle Statuses
  if (s === "OPEN" || s === "AVAILABLE") {
    bg = "#EFF6FF";
    text = "#1D4ED8";
    border = "#BFDBFE";
  } else if (s === "IN_PROGRESS" || s === "IN_WORKSHOP" || s === "INSPECTION_PENDING") {
    bg = "#FEF3C7";
    text = "#B45309";
    border = "#FDE68A";
  } else if (s === "WAITING_FOR_PARTS" || s === "URGENT" || s === "DUE") {
    bg = "#FFF7ED";
    text = "#C2410C";
    border = "#FFEDD5";
  } else if (s === "READY_FOR_COLLECTION") {
    bg = "#F3E8FF";
    text = "#6B21A8";
    border = "#E9D5FF";
  } else if (s === "COMPLETED" || s === "PASSED" || s === "PASS") {
    bg = "#DCFCE7";
    text = "#15803D";
    border = "#BBF7D0";
  } else if (s === "CANCELLED" || s === "FAILED" || s === "FAIL" || s === "CRITICAL" || s === "OVERDUE" || s === "INACTIVE") {
    bg = "#FEE2E2";
    text = "#B91C1C";
    border = "#FECACA";
  } else if (s === "OUTSIDE_WORKSHOP" || s === "UPCOMING") {
    bg = "#F1F5F9";
    text = "#475569";
    border = "#CBD5E1";
  } else if (s === "N/A" || s === "NORMAL") {
    bg = "#F8FAFC";
    text = "#64748B";
    border = "#E2E8F0";
  }

  const isSmall = size === "small";

  const formatText = (val) => {
    return val.replace(/_/g, " ");
  };

  return (
    <View
      style={{
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border,
        paddingHorizontal: isSmall ? 6 : 10,
        paddingVertical: isSmall ? 2 : 4,
        borderRadius: 6,
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{
          color: text,
          fontSize: isSmall ? 10 : 12,
          fontWeight: "700",
          textTransform: "uppercase",
        }}
      >
        {formatText(s)}
      </Text>
    </View>
  );
}
