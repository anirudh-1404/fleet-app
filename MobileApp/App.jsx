import "react-native-gesture-handler";
import "./global.css";
import React from "react";
import { View, Platform, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "@navigation/RootNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { InspectionProvider } from "./src/context/InspectionContext";
import { FleetDataProvider } from "./src/context/FleetDataContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0,
        }}
      >
        <NavigationContainer>
          <AuthProvider>
            <FleetDataProvider>
              <InspectionProvider>
                <RootNavigator />
              </InspectionProvider>
            </FleetDataProvider>
          </AuthProvider>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}