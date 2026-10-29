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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
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
                    <View style={{ flex: 1 }}>
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
          minHeight: "100vh",
          height: "100vh",
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
          maxHeight: "100vh",
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