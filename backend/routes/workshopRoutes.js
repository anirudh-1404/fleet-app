import express from "express";
import { protect } from "../middleware/authMiddleware.js";

// Controllers
import {
  getWorkshopCustomers,
  getWorkshopCustomerById,
  createWorkshopCustomer,
  updateWorkshopCustomer,
  deleteWorkshopCustomer,
} from "../controllers/workshopCustomerController.js";

import {
  getWorkshopVehicles,
  searchWorkshopVehicles,
  getWorkshopVehicleById,
  createWorkshopVehicle,
  updateWorkshopVehicle,
  deleteWorkshopVehicle,
} from "../controllers/workshopVehicleController.js";

import {
  getWorkshopWorkOrders,
  getWorkshopWorkOrderById,
  createWorkshopWorkOrder,
  updateWorkshopWorkOrder,
  deleteWorkshopWorkOrder,
  getMyAssignedJobs,
  submitJobChecklist,
  uploadJobPhotos,
  addJobWorkNote,
} from "../controllers/workshopWorkOrderController.js";

import {
  getWorkshopEmployees,
  getWorkshopEmployeeById,
  createWorkshopEmployee,
  updateWorkshopEmployee,
  deleteWorkshopEmployee,
} from "../controllers/workshopEmployeeController.js";

import {
  getJobMessages,
  sendJobMessage,
} from "../controllers/workshopJobMessageController.js";

import {
  getWorkshopInspections,
  getWorkshopInspectionById,
  createWorkshopInspection,
  updateWorkshopInspection,
  deleteWorkshopInspection,
} from "../controllers/workshopInspectionController.js";

import {
  getWorkshopServices,
  getWorkshopServiceById,
  createWorkshopService,
  updateWorkshopService,
  deleteWorkshopService,
} from "../controllers/workshopServiceController.js";

import { getWorkshopDueServices } from "../controllers/workshopDueServiceController.js";

import {
  getWorkshopSchedules,
  getWorkshopScheduleById,
  createWorkshopSchedule,
  updateWorkshopSchedule,
  deleteWorkshopSchedule,
} from "../controllers/workshopScheduleController.js";

import {
  getWorkshopInvoices,
  getWorkshopInvoiceById,
  createWorkshopInvoice,
  updateWorkshopInvoice,
  deleteWorkshopInvoice,
} from "../controllers/workshopInvoiceController.js";

import {
  getWorkshopContacts,
  getWorkshopContactById,
  createWorkshopContact,
  updateWorkshopContact,
  deleteWorkshopContact,
} from "../controllers/workshopContactController.js";

import {
  getWorkshopNotes,
  getWorkshopNoteById,
  createWorkshopNote,
  updateWorkshopNote,
  deleteWorkshopNote,
} from "../controllers/workshopNoteController.js";

import {
  getWorkshopReminders,
  getWorkshopReminderById,
  createWorkshopReminder,
  updateWorkshopReminder,
  deleteWorkshopReminder,
} from "../controllers/workshopReminderController.js";

import { getWorkshopDashboard } from "../controllers/workshopDashboardController.js";

const router = express.Router();

// Apply auth middleware to all workshop routes
router.use(protect);

// 1. Dashboard
router.get("/dashboard", getWorkshopDashboard);

// 2. Customers
router.get("/customers", getWorkshopCustomers);
router.post("/customers", createWorkshopCustomer);
router.get("/customers/:id", getWorkshopCustomerById);
router.patch("/customers/:id", updateWorkshopCustomer);
router.delete("/customers/:id", deleteWorkshopCustomer);

// 3. Vehicles
router.get("/vehicles", getWorkshopVehicles);
router.get("/vehicles/search", searchWorkshopVehicles);
router.post("/vehicles", createWorkshopVehicle);
router.get("/vehicles/:id", getWorkshopVehicleById);
router.patch("/vehicles/:id", updateWorkshopVehicle);
router.delete("/vehicles/:id", deleteWorkshopVehicle);

// 4. Work Orders
router.get("/work-orders", getWorkshopWorkOrders);
router.post("/work-orders", createWorkshopWorkOrder);
router.get("/work-orders/:id", getWorkshopWorkOrderById);
router.patch("/work-orders/:id", updateWorkshopWorkOrder);
router.delete("/work-orders/:id", deleteWorkshopWorkOrder);

// Work Order Job Actions (Mechanic / Admin)
router.get("/my-jobs", getMyAssignedJobs);
router.post("/work-orders/:id/checklist", submitJobChecklist);
router.post("/work-orders/:id/photos", uploadJobPhotos);
router.post("/work-orders/:id/notes", addJobWorkNote);
router.get("/work-orders/:id/messages", getJobMessages);
router.post("/work-orders/:id/messages", sendJobMessage);

// Employee Management (Admin)
router.get("/employees", getWorkshopEmployees);
router.post("/employees", createWorkshopEmployee);
router.get("/employees/:id", getWorkshopEmployeeById);
router.patch("/employees/:id", updateWorkshopEmployee);
router.delete("/employees/:id", deleteWorkshopEmployee);

// 5. Inspections (Truck & Trailer)
router.get("/inspections", getWorkshopInspections);
router.post("/inspections", createWorkshopInspection);
router.get("/inspections/:id", getWorkshopInspectionById);
router.patch("/inspections/:id", updateWorkshopInspection);
router.delete("/inspections/:id", deleteWorkshopInspection);

// 6 & 7. Services (Truck & Trailer Services)
router.get("/services", getWorkshopServices);
router.post("/services", createWorkshopService);
router.get("/services/:id", getWorkshopServiceById);
router.patch("/services/:id", updateWorkshopService);
router.delete("/services/:id", deleteWorkshopService);

// 8. Due Services
router.get("/due-services", getWorkshopDueServices);

// 9. Schedule Service & Inspections
router.get("/schedule", getWorkshopSchedules);
router.post("/schedule", createWorkshopSchedule);
router.get("/schedule/:id", getWorkshopScheduleById);
router.patch("/schedule/:id", updateWorkshopSchedule);
router.delete("/schedule/:id", deleteWorkshopSchedule);

// 10. Invoices (Parts, Insurances, Other Expenses)
router.get("/invoices", getWorkshopInvoices);
router.post("/invoices", createWorkshopInvoice);
router.get("/invoices/:id", getWorkshopInvoiceById);
router.patch("/invoices/:id", updateWorkshopInvoice);
router.delete("/invoices/:id", deleteWorkshopInvoice);

// 11. Contacts
router.get("/contacts", getWorkshopContacts);
router.post("/contacts", createWorkshopContact);
router.get("/contacts/:id", getWorkshopContactById);
router.patch("/contacts/:id", updateWorkshopContact);
router.delete("/contacts/:id", deleteWorkshopContact);

// 12. Notes
router.get("/notes", getWorkshopNotes);
router.post("/notes", createWorkshopNote);
router.get("/notes/:id", getWorkshopNoteById);
router.patch("/notes/:id", updateWorkshopNote);
router.delete("/notes/:id", deleteWorkshopNote);

// 13. Reminders
router.get("/reminders", getWorkshopReminders);
router.post("/reminders", createWorkshopReminder);
router.get("/reminders/:id", getWorkshopReminderById);
router.patch("/reminders/:id", updateWorkshopReminder);
router.delete("/reminders/:id", deleteWorkshopReminder);

export default router;
