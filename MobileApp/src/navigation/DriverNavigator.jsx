import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ROUTES from "@constants/routes";

// Screens
import DriverHomeScreen from "@screens/driver/Home/DriverHomeScreen";
import DriverPreCheckScreen from "@screens/driver/Inspection/DriverPreCheckScreen";
import InspectionReviewScreen from "@screens/driver/Inspection/InspectionReviewScreen";
import InspectionSubmittedScreen from "@screens/driver/Inspection/InspectionSubmittedScreen";
import HistoryScreen from "@screens/driver/History/HistoryScreen";
import NotificationsScreen from "@screens/common/NotificationsScreen";
import JobMessagesScreen from "@screens/workshop/EmployeePortal/JobMessagesScreen";

const Stack = createNativeStackNavigator();

export default function DriverNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }}>
      <Stack.Screen name={ROUTES.DRIVER_HOME} component={DriverHomeScreen} />
      <Stack.Screen name={ROUTES.NOTIFICATIONS} component={NotificationsScreen} />
      <Stack.Screen name={ROUTES.DRIVER_PRECHECK} component={DriverPreCheckScreen} />
      <Stack.Screen name={ROUTES.INSPECTION_REVIEW} component={InspectionReviewScreen} />
      <Stack.Screen name={ROUTES.INSPECTION_SUBMITTED} component={InspectionSubmittedScreen} />
      <Stack.Screen name={ROUTES.DRIVER_HISTORY} component={HistoryScreen} />
      <Stack.Screen name={ROUTES.WORKSHOP_EMPLOYEE_CHAT} component={JobMessagesScreen} />
    </Stack.Navigator>
  );
}
