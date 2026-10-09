import "react-native-gesture-handler";
import "./global.css";
import React, { useEffect } from "react";
import { View, StatusBar, StyleSheet } from "react-native";
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
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />
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
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});