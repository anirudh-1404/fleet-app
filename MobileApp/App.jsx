import "react-native-gesture-handler";
import "./global.css";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "@navigation/RootNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { InspectionProvider } from "./src/context/InspectionContext";
import { FleetDataProvider } from "./src/context/FleetDataContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FleetDataProvider>
          <InspectionProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </InspectionProvider>
        </FleetDataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}