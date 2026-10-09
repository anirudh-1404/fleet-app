import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Platform,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AppFooter({ style, textStyle }) {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (isKeyboardVisible) {
    return null;
  }

  const handleOpenLink = () => {
    const url = "https://www.itechloombas.com/";
    Linking.openURL(url).catch((err) => {
      console.warn("Could not open link:", err);
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handleOpenLink}
      style={[
        styles.footerContainer,
        {
          paddingBottom: Math.max(insets.bottom, 6),
        },
        style,
      ]}
    >
      <Text style={[styles.text, textStyle]}>
        Designed and Developed by{" "}
        <Text style={styles.linkText}>
          itechloombas
        </Text>
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: "#FFFFFF",
    paddingTop: 5,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
  },
  linkText: {
    color: "#2563EB",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
