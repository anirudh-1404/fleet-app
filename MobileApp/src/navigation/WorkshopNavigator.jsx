import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ROUTES from "../constants/routes";

// Dashboard
import WorkshopDashboardScreen from "../screens/workshop/Dashboard/WorkshopDashboardScreen";

// Customers
import CustomerListScreen from "../screens/workshop/Customers/CustomerListScreen";
import CustomerDetailsScreen from "../screens/workshop/Customers/CustomerDetailsScreen";
import AddCustomerScreen from "../screens/workshop/Customers/AddCustomerScreen";
import EditCustomerScreen from "../screens/workshop/Customers/EditCustomerScreen";

// Vehicles
import WorkshopVehicleListScreen from "../screens/workshop/Vehicles/WorkshopVehicleListScreen";
import WorkshopVehicleDetailsScreen from "../screens/workshop/Vehicles/WorkshopVehicleDetailsScreen";
import AddWorkshopVehicleScreen from "../screens/workshop/Vehicles/AddWorkshopVehicleScreen";
import EditWorkshopVehicleScreen from "../screens/workshop/Vehicles/EditWorkshopVehicleScreen";

// Work Orders
import WorkOrderListScreen from "../screens/workshop/WorkOrders/WorkOrderListScreen";
import WorkOrderDetailsScreen from "../screens/workshop/WorkOrders/WorkOrderDetailsScreen";
import CreateWorkOrderScreen from "../screens/workshop/WorkOrders/CreateWorkOrderScreen";
import EditWorkOrderScreen from "../screens/workshop/WorkOrders/EditWorkOrderScreen";

// Inspections
import InspectionListScreen from "../screens/workshop/Inspections/InspectionListScreen";
import InspectionDetailsScreen from "../screens/workshop/Inspections/InspectionDetailsScreen";
import CreateInspectionScreen from "../screens/workshop/Inspections/CreateInspectionScreen";

// Truck Services
import TruckServicesScreen from "../screens/workshop/TruckServices/TruckServicesScreen";
import TruckServiceDetailsScreen from "../screens/workshop/TruckServices/TruckServiceDetailsScreen";
import AddTruckServiceScreen from "../screens/workshop/TruckServices/AddTruckServiceScreen";

// Trailer Services
import TrailerServicesScreen from "../screens/workshop/TrailerServices/TrailerServicesScreen";
import TrailerServiceDetailsScreen from "../screens/workshop/TrailerServices/TrailerServiceDetailsScreen";
import AddTrailerServiceScreen from "../screens/workshop/TrailerServices/AddTrailerServiceScreen";

// Due Service
import DueServiceScreen from "../screens/workshop/DueService/DueServiceScreen";

// Schedule
import WorkshopScheduleScreen from "../screens/workshop/Schedule/WorkshopScheduleScreen";
import AddScheduleScreen from "../screens/workshop/Schedule/AddScheduleScreen";

// Invoices
import WorkshopInvoiceListScreen from "../screens/workshop/Invoices/WorkshopInvoiceListScreen";
import WorkshopInvoiceDetailsScreen from "../screens/workshop/Invoices/WorkshopInvoiceDetailsScreen";
import AddWorkshopInvoiceScreen from "../screens/workshop/Invoices/AddWorkshopInvoiceScreen";

// Contacts
import WorkshopContactsScreen from "../screens/workshop/Contacts/WorkshopContactsScreen";
import AddContactScreen from "../screens/workshop/Contacts/AddContactScreen";
import ContactDetailsScreen from "../screens/workshop/Contacts/ContactDetailsScreen";

// Notes
import WorkshopNotesScreen from "../screens/workshop/Notes/WorkshopNotesScreen";
import AddNoteScreen from "../screens/workshop/Notes/AddNoteScreen";
import NoteDetailsScreen from "../screens/workshop/Notes/NoteDetailsScreen";

// Reminders
import WorkshopRemindersScreen from "../screens/workshop/Reminders/WorkshopRemindersScreen";
import AddReminderScreen from "../screens/workshop/Reminders/AddReminderScreen";
import ReminderDetailsScreen from "../screens/workshop/Reminders/ReminderDetailsScreen";

// Employees (Admin Management)
import EmployeeListScreen from "../screens/workshop/Employees/EmployeeListScreen";
import AddEmployeeScreen from "../screens/workshop/Employees/AddEmployeeScreen";
import EmployeeDetailsScreen from "../screens/workshop/Employees/EmployeeDetailsScreen";

// Job Details Sub-Screens (Checklist, Photos, Chat)
import DigitalChecklistScreen from "../screens/workshop/EmployeePortal/DigitalChecklistScreen";
import JobPhotosEvidenceScreen from "../screens/workshop/EmployeePortal/JobPhotosEvidenceScreen";
import JobMessagesScreen from "../screens/workshop/EmployeePortal/JobMessagesScreen";

// Contact Inquiries & Public Bookings
import ContactInquiriesScreen from "../screens/workshop/Inquiries/ContactInquiriesScreen";
import InquiryDetailsScreen from "../screens/workshop/Inquiries/InquiryDetailsScreen";

const Stack = createNativeStackNavigator();

export default function WorkshopNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.WORKSHOP_DASHBOARD}
      screenOptions={{ headerShown: false }}
    >
      {/* 1. Dashboard */}
      <Stack.Screen name={ROUTES.WORKSHOP_DASHBOARD} component={WorkshopDashboardScreen} />

      {/* 2. Customers */}
      <Stack.Screen name={ROUTES.WORKSHOP_CUSTOMER_LIST} component={CustomerListScreen} />
      <Stack.Screen name={ROUTES.WORKSHOP_CUSTOMER_DETAILS} component={CustomerDetailsScreen} />
      <Stack.Screen name={ROUTES.ADD_WORKSHOP_CUSTOMER} component={AddCustomerScreen} />
      <Stack.Screen name={ROUTES.EDIT_WORKSHOP_CUSTOMER} component={EditCustomerScreen} />

      {/* 3. Vehicles */}
      <Stack.Screen name={ROUTES.WORKSHOP_VEHICLE_LIST} component={WorkshopVehicleListScreen} />
      <Stack.Screen name={ROUTES.WORKSHOP_VEHICLE_DETAILS} component={WorkshopVehicleDetailsScreen} />
      <Stack.Screen name={ROUTES.ADD_WORKSHOP_VEHICLE} component={AddWorkshopVehicleScreen} />
      <Stack.Screen name={ROUTES.EDIT_WORKSHOP_VEHICLE} component={EditWorkshopVehicleScreen} />

      {/* 4. Work Orders */}
      <Stack.Screen name={ROUTES.WORKSHOP_WORKORDER_LIST} component={WorkOrderListScreen} />
      <Stack.Screen name={ROUTES.WORKSHOP_WORKORDER_DETAILS} component={WorkOrderDetailsScreen} />
      <Stack.Screen name={ROUTES.CREATE_WORKSHOP_WORKORDER} component={CreateWorkOrderScreen} />
      <Stack.Screen name={ROUTES.EDIT_WORKSHOP_WORKORDER} component={EditWorkOrderScreen} />

      {/* 5. Inspections */}
      <Stack.Screen name={ROUTES.WORKSHOP_INSPECTION_LIST} component={InspectionListScreen} />
      <Stack.Screen name={ROUTES.WORKSHOP_INSPECTION_DETAILS} component={InspectionDetailsScreen} />
      <Stack.Screen name={ROUTES.CREATE_WORKSHOP_INSPECTION} component={CreateInspectionScreen} />

      {/* 6. Truck Services */}
      <Stack.Screen name={ROUTES.WORKSHOP_TRUCK_SERVICES} component={TruckServicesScreen} />
      <Stack.Screen name={ROUTES.WORKSHOP_TRUCK_SERVICE_DETAILS} component={TruckServiceDetailsScreen} />
      <Stack.Screen name={ROUTES.ADD_WORKSHOP_TRUCK_SERVICE} component={AddTruckServiceScreen} />

      {/* 7. Trailer Services */}
      <Stack.Screen name={ROUTES.WORKSHOP_TRAILER_SERVICES} component={TrailerServicesScreen} />
      <Stack.Screen name={ROUTES.WORKSHOP_TRAILER_SERVICE_DETAILS} component={TrailerServiceDetailsScreen} />
      <Stack.Screen name={ROUTES.ADD_WORKSHOP_TRAILER_SERVICE} component={AddTrailerServiceScreen} />

      {/* 8. Due Service */}
      <Stack.Screen name={ROUTES.WORKSHOP_DUE_SERVICE} component={DueServiceScreen} />

      {/* 9. Schedule */}
      <Stack.Screen name={ROUTES.WORKSHOP_SCHEDULE} component={WorkshopScheduleScreen} />
      <Stack.Screen name={ROUTES.ADD_WORKSHOP_SCHEDULE} component={AddScheduleScreen} />

      {/* 10. Invoices */}
      <Stack.Screen name={ROUTES.WORKSHOP_INVOICE_LIST} component={WorkshopInvoiceListScreen} />
      <Stack.Screen name={ROUTES.WORKSHOP_INVOICE_DETAILS} component={WorkshopInvoiceDetailsScreen} />
      <Stack.Screen name={ROUTES.ADD_WORKSHOP_INVOICE} component={AddWorkshopInvoiceScreen} />

      {/* 11. Contacts */}
      <Stack.Screen name={ROUTES.WORKSHOP_CONTACTS} component={WorkshopContactsScreen} />
      <Stack.Screen name={ROUTES.ADD_WORKSHOP_CONTACT} component={AddContactScreen} />
      <Stack.Screen name={ROUTES.WORKSHOP_CONTACT_DETAILS} component={ContactDetailsScreen} />

      {/* 12. Notes */}
      <Stack.Screen name={ROUTES.WORKSHOP_NOTES} component={WorkshopNotesScreen} />
      <Stack.Screen name={ROUTES.ADD_WORKSHOP_NOTE} component={AddNoteScreen} />
      <Stack.Screen name={ROUTES.WORKSHOP_NOTE_DETAILS} component={NoteDetailsScreen} />

      {/* 13. Reminders */}
      <Stack.Screen name={ROUTES.WORKSHOP_REMINDERS} component={WorkshopRemindersScreen} />
      <Stack.Screen name={ROUTES.ADD_WORKSHOP_REMINDER} component={AddReminderScreen} />
      <Stack.Screen name={ROUTES.WORKSHOP_REMINDER_DETAILS} component={ReminderDetailsScreen} />

      {/* 14. Employees (Admin) */}
      <Stack.Screen name={ROUTES.WORKSHOP_EMPLOYEE_LIST} component={EmployeeListScreen} />
      <Stack.Screen name={ROUTES.ADD_WORKSHOP_EMPLOYEE} component={AddEmployeeScreen} />
      <Stack.Screen name={ROUTES.WORKSHOP_EMPLOYEE_DETAILS} component={EmployeeDetailsScreen} />

      {/* 15. Job Detail Modals & Subscreens */}
      <Stack.Screen name={ROUTES.WORKSHOP_EMPLOYEE_CHECKLIST} component={DigitalChecklistScreen} />
      <Stack.Screen name={ROUTES.WORKSHOP_EMPLOYEE_PHOTOS} component={JobPhotosEvidenceScreen} />
      <Stack.Screen name={ROUTES.WORKSHOP_EMPLOYEE_CHAT} component={JobMessagesScreen} />

      {/* 16. Contact Inquiries & Public Booking Cards */}
      <Stack.Screen name={ROUTES.WORKSHOP_INQUIRIES} component={ContactInquiriesScreen} />
      <Stack.Screen name={ROUTES.WORKSHOP_INQUIRY_DETAILS} component={InquiryDetailsScreen} />
    </Stack.Navigator>
  );
}
