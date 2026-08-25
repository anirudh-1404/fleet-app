import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ROUTES from "@constants/routes";

// Rental Screens
import RentalDashboardScreen from "../screens/rental/Dashboard/RentalDashboardScreen";
import RentalVehicleListScreen from "../screens/rental/Vehicles/RentalVehicleListScreen";
import AddRentalVehicleScreen from "../screens/rental/Vehicles/AddRentalVehicleScreen";
import RentalVehicleDetailsScreen from "../screens/rental/Vehicles/RentalVehicleDetailsScreen";
import EditRentalVehicleScreen from "../screens/rental/Vehicles/EditRentalVehicleScreen";

import RentalListScreen from "../screens/rental/Rentals/RentalListScreen";
import CreateRentalScreen from "../screens/rental/Rentals/CreateRentalScreen";
import RentalDetailsScreen from "../screens/rental/Rentals/RentalDetailsScreen";
import ReturnRentalScreen from "../screens/rental/Rentals/ReturnRentalScreen";

import CustomerListScreen from "../screens/rental/Customers/CustomerListScreen";
import CustomerDetailsScreen from "../screens/rental/Customers/CustomerDetailsScreen";

const Stack = createNativeStackNavigator();

export default function RentalNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={ROUTES.RENTAL_DASHBOARD}>
      {/* Dashboard */}
      <Stack.Screen name={ROUTES.RENTAL_DASHBOARD} component={RentalDashboardScreen} />

      {/* Vehicles */}
      <Stack.Screen name={ROUTES.RENTAL_VEHICLE_LIST} component={RentalVehicleListScreen} />
      <Stack.Screen name={ROUTES.ADD_RENTAL_VEHICLE} component={AddRentalVehicleScreen} />
      <Stack.Screen name={ROUTES.RENTAL_VEHICLE_DETAILS} component={RentalVehicleDetailsScreen} />
      <Stack.Screen name={ROUTES.EDIT_RENTAL_VEHICLE} component={EditRentalVehicleScreen} />

      {/* Rentals */}
      <Stack.Screen name={ROUTES.RENTAL_LIST} component={RentalListScreen} />
      <Stack.Screen name={ROUTES.CREATE_RENTAL} component={CreateRentalScreen} />
      <Stack.Screen name={ROUTES.RENTAL_DETAILS} component={RentalDetailsScreen} />
      <Stack.Screen name={ROUTES.RETURN_RENTAL} component={ReturnRentalScreen} />

      {/* Customers */}
      <Stack.Screen name={ROUTES.RENTAL_CUSTOMER_LIST} component={CustomerListScreen} />
      <Stack.Screen name={ROUTES.RENTAL_CUSTOMER_DETAILS} component={CustomerDetailsScreen} />
    </Stack.Navigator>
  );
}
