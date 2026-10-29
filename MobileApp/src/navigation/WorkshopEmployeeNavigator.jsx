import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ROUTES from "../constants/routes";

import EmployeeHomeScreen from "../screens/workshop/EmployeePortal/EmployeeHomeScreen";
import EmployeeJobDetailsScreen from "../screens/workshop/EmployeePortal/EmployeeJobDetailsScreen";
import DigitalChecklistScreen from "../screens/workshop/EmployeePortal/DigitalChecklistScreen";
import JobPhotosEvidenceScreen from "../screens/workshop/EmployeePortal/JobPhotosEvidenceScreen";
import JobMessagesScreen from "../screens/workshop/EmployeePortal/JobMessagesScreen";

import EmployeeStartServiceScreen from "../screens/workshop/EmployeePortal/EmployeeStartServiceScreen";

const Stack = createNativeStackNavigator();

export default function WorkshopEmployeeNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.WORKSHOP_EMPLOYEE_HOME}
      screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }}
    >
      <Stack.Screen
        name={ROUTES.WORKSHOP_EMPLOYEE_HOME}
        component={EmployeeHomeScreen}
      />
      <Stack.Screen
        name={ROUTES.WORKSHOP_EMPLOYEE_START_SERVICE}
        component={EmployeeStartServiceScreen}
      />
      <Stack.Screen
        name={ROUTES.WORKSHOP_EMPLOYEE_JOB_DETAILS}
        component={EmployeeJobDetailsScreen}
      />
      <Stack.Screen
        name={ROUTES.WORKSHOP_EMPLOYEE_CHECKLIST}
        component={DigitalChecklistScreen}
      />
      <Stack.Screen
        name={ROUTES.WORKSHOP_EMPLOYEE_PHOTOS}
        component={JobPhotosEvidenceScreen}
      />
      <Stack.Screen
        name={ROUTES.WORKSHOP_EMPLOYEE_CHAT}
        component={JobMessagesScreen}
      />
    </Stack.Navigator>
  );
}
