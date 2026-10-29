import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./global.css";
import React, { useEffect } from "react";
import { View, StatusBar, StyleSheet, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import * as Updates from "expo-updates";
import RootNavigator from "@navigation/RootNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { InspectionProvider } from "./src/context/InspectionContext";
import { FleetDataProvider } from "./src/context/FleetDataContext";

import AppFooter from "./src/components/common/AppFooter";

export default function App() {
  useEffect(() => {
    // Inject web touch scrolling rules for Android Chrome & mobile browsers
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const styleId = "workfle-android-scroll-fix";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
          html, body, #root {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
            overscroll-behavior-y: none;
          }
          * {
            -webkit-tap-highlight-color: transparent;
          }
          /* Force Android Chrome & mobile browsers to allow vertical touch scrolling */
          [style*="overflow-y: auto"],
          [style*="overflow-y: scroll"],
          .r-overflowY-auto,
          .r-overflowY-scroll,
          div[style*="overflow-y: auto"],
          div[style*="overflow-y: scroll"] {
            touch-action: pan-y !important;
            -webkit-overflow-scrolling: touch !important;
            overscroll-behavior-y: contain;
          }
          [style*="overflow-x: auto"],
          [style*="overflow-x: scroll"],
          .r-overflowX-auto,
          .r-overflowX-scroll,
          div[style*="overflow-x: auto"],
          div[style*="overflow-x: scroll"] {
            touch-action: pan-x !important;
            -webkit-overflow-scrolling: touch !important;
          }
          [role="button"], [data-focusable="true"], [tabindex="0"], button, a {
            touch-action: manipulation !important;
          }
        `;
        document.head.appendChild(style);
      }
    }

    async function checkForUpdates() {
      try {
        if (!__DEV__) {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        }
      } catch (error) {
        console.log("Expo auto-update error:", error);
      }
    }
    checkForUpdates();
  }, []);

  return (
    <GestureHandlerRootView style={[{ flex: 1 }, isWeb && { height: "100%", width: "100%", touchAction: "manipulation" }]}>
      <SafeAreaProvider style={isWeb ? { flex: 1, height: "100%", width: "100%" } : { flex: 1 }}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />
        <View style={styles.outerShell}>
          <View style={styles.appContainer}>
            <NavigationContainer>
              <AuthProvider>
                <FleetDataProvider>
                  <InspectionProvider>
                    <View style={{ flex: 1, height: "100%", width: "100%", minHeight: 0 }}>
                      <RootNavigator />
                    </View>
                    <AppFooter />
                  </InspectionProvider>
                </FleetDataProvider>
              </AuthProvider>
            </NavigationContainer>
          </View>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const isWeb = Platform.OS === "web";

const styles = StyleSheet.create({
  outerShell: {
    flex: 1,
    backgroundColor: isWeb ? "#F1F5F9" : "#FFFFFF",
    width: "100%",
    height: "100%",
    ...(isWeb
      ? {
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          minHeight: "100%",
          overflow: "hidden",
        }
      : {}),
  },
  appContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    position: "relative",
    ...(isWeb
      ? {
          maxWidth: 1200,
          alignSelf: "center",
          height: "100%",
          maxHeight: "100%",
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.08,
          shadowRadius: 25,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: "#E2E8F0",
          overflow: "hidden",
        }
      : {}),
  },
});