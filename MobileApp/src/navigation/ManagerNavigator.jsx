import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ROUTES from "@constants/routes";

// Existing Screens
import DashboardScreen from "@screens/manager/Dashboard/DashboardScreen";
import FleetListScreen from "@screens/manager/Fleet/FleetListScreen";
import VehicleDetailsScreen from "@screens/manager/Fleet/VehicleDetailsScreen";
import DriverListScreen from "@screens/manager/Drivers/DriverListScreen";
import DriverDetailsScreen from "@screens/manager/Drivers/DriverDetailsScreen";
import AddDriverScreen from "@screens/manager/Drivers/AddDriverScreen";
import AddVehicleScreen from "@screens/manager/Fleet/AddVehicleScreen";
import EditVehicleScreen from "@screens/manager/Fleet/EditVehicleScreen";
import AssignDriverScreen from "@screens/manager/Fleet/AssignDriverScreen";

// Inspections
import DriverInspectionsScreen from "@screens/manager/Inspections/DriverInspectionsScreen";
import InspectionDetailsScreen from "@screens/manager/Inspections/InspectionDetailsScreen";
import DriverPreCheckScreen from "@screens/driver/Inspection/DriverPreCheckScreen";
import TodaysOperationsScreen from "@screens/manager/Operations/TodaysOperationsScreen";
import NotificationsScreen from "@screens/common/NotificationsScreen";

// Due Service Module
import DueServiceScreen from "@screens/manager/DueService/DueServiceScreen";
import ServiceDetailsScreen from "@screens/manager/DueService/ServiceDetailsScreen";

// Fuel Module
import FuelScreen from "@screens/manager/Fuel/FuelScreen";
import FuelDetailsScreen from "@screens/manager/Fuel/FuelDetailsScreen";
import AddFuelScreen from "@screens/manager/Fuel/AddFuelScreen";
import EditFuelScreen from "@screens/manager/Fuel/EditFuelScreen";

// Invoice Module
import InvoiceScreen from "@screens/manager/Invoice/InvoiceScreen";
import InvoiceDetailsScreen from "@screens/manager/Invoice/InvoiceDetailsScreen";
import AddInvoiceScreen from "@screens/manager/Invoice/AddInvoiceScreen";
import EditInvoiceScreen from "@screens/manager/Invoice/EditInvoiceScreen";

// Contact Module
import ContactsScreen from "@screens/manager/Contacts/ContactsScreen";
import ContactDetailsScreen from "@screens/manager/Contacts/ContactDetailsScreen";
import AddContactScreen from "@screens/manager/Contacts/AddContactScreen";
import EditContactScreen from "@screens/manager/Contacts/EditContactScreen";

// Notes Module
import NotesScreen from "@screens/manager/Notes/NotesScreen";
import NoteDetailsScreen from "@screens/manager/Notes/NoteDetailsScreen";
import AddNoteScreen from "@screens/manager/Notes/AddNoteScreen";
import EditNoteScreen from "@screens/manager/Notes/EditNoteScreen";

// Reminder Module
import ReminderScreen from "@screens/manager/Reminder/ReminderScreen";
import ReminderDetailsScreen from "@screens/manager/Reminder/ReminderDetailsScreen";
import AddReminderScreen from "@screens/manager/Reminder/AddReminderScreen";
import EditReminderScreen from "@screens/manager/Reminder/EditReminderScreen";

// Team Chat
import JobMessagesScreen from "@screens/workshop/EmployeePortal/JobMessagesScreen";

// Contact Inquiries & Public Bookings
import ContactInquiriesScreen from "@screens/workshop/Inquiries/ContactInquiriesScreen";
import InquiryDetailsScreen from "@screens/workshop/Inquiries/InquiryDetailsScreen";

const Stack = createNativeStackNavigator();

export default function ManagerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }}>
      <Stack.Screen name={ROUTES.MANAGER_DASHBOARD} component={DashboardScreen} />
      <Stack.Screen name={ROUTES.FLEET_LIST} component={FleetListScreen} />
      <Stack.Screen name={ROUTES.DRIVER_LIST} component={DriverListScreen} />
      <Stack.Screen name={ROUTES.VEHICLE_DETAILS} component={VehicleDetailsScreen} />
      <Stack.Screen name={ROUTES.DRIVER_DETAILS} component={DriverDetailsScreen} />
      <Stack.Screen name="AddDriver" component={AddDriverScreen} />
      <Stack.Screen name={ROUTES.ADD_VEHICLE} component={AddVehicleScreen} />
      <Stack.Screen name={ROUTES.EDIT_VEHICLE} component={EditVehicleScreen} />
      <Stack.Screen name={ROUTES.ASSIGN_DRIVER} component={AssignDriverScreen} />
      
      {/* Driver Inspections & Operations */}
      <Stack.Screen name={ROUTES.NOTIFICATIONS} component={NotificationsScreen} />
      <Stack.Screen name={ROUTES.TODAYS_OPERATIONS} component={TodaysOperationsScreen} />
      <Stack.Screen name={ROUTES.DRIVER_INSPECTIONS} component={DriverInspectionsScreen} />
      <Stack.Screen name={ROUTES.INSPECTION_DETAILS} component={InspectionDetailsScreen} />
      <Stack.Screen name={ROUTES.DRIVER_PRECHECK} component={DriverPreCheckScreen} />

      {/* Due Service */}
      <Stack.Screen name={ROUTES.DUE_SERVICE} component={DueServiceScreen} />
      <Stack.Screen name={ROUTES.SERVICE_DETAILS} component={ServiceDetailsScreen} />

      {/* Fuel */}
      <Stack.Screen name={ROUTES.FUEL_DATA} component={FuelScreen} />
      <Stack.Screen name={ROUTES.FUEL_DETAILS} component={FuelDetailsScreen} />
      <Stack.Screen name={ROUTES.ADD_FUEL} component={AddFuelScreen} />
      <Stack.Screen name={ROUTES.EDIT_FUEL} component={EditFuelScreen} />

      {/* Invoice */}
      <Stack.Screen name={ROUTES.INVOICES} component={InvoiceScreen} />
      <Stack.Screen name={ROUTES.INVOICE_DETAILS} component={InvoiceDetailsScreen} />
      <Stack.Screen name={ROUTES.ADD_INVOICE} component={AddInvoiceScreen} />
      <Stack.Screen name={ROUTES.EDIT_INVOICE} component={EditInvoiceScreen} />

      {/* Contacts */}
      <Stack.Screen name={ROUTES.CONTACTS} component={ContactsScreen} />
      <Stack.Screen name={ROUTES.CONTACT_DETAILS} component={ContactDetailsScreen} />
      <Stack.Screen name={ROUTES.ADD_CONTACT} component={AddContactScreen} />
      <Stack.Screen name={ROUTES.EDIT_CONTACT} component={EditContactScreen} />

      {/* Notes */}
      <Stack.Screen name={ROUTES.NOTES} component={NotesScreen} />
      <Stack.Screen name={ROUTES.NOTE_DETAILS} component={NoteDetailsScreen} />
      <Stack.Screen name={ROUTES.ADD_NOTE} component={AddNoteScreen} />
      <Stack.Screen name={ROUTES.EDIT_NOTE} component={EditNoteScreen} />

      {/* Reminders */}
      <Stack.Screen name={ROUTES.REMINDERS} component={ReminderScreen} />
      <Stack.Screen name={ROUTES.REMINDER_DETAILS} component={ReminderDetailsScreen} />
      <Stack.Screen name={ROUTES.ADD_REMINDER} component={AddReminderScreen} />
      <Stack.Screen name={ROUTES.EDIT_REMINDER} component={EditReminderScreen} />

      {/* Team Chat */}
      <Stack.Screen name={ROUTES.WORKSHOP_EMPLOYEE_CHAT} component={JobMessagesScreen} />

      {/* Contact Inquiries & Public Bookings */}
      <Stack.Screen name={ROUTES.WORKSHOP_INQUIRIES} component={ContactInquiriesScreen} />
      <Stack.Screen name={ROUTES.WORKSHOP_INQUIRY_DETAILS} component={InquiryDetailsScreen} />
    </Stack.Navigator>
  );
}
