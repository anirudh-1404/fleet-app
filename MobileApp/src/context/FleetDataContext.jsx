import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { fuelService } from "../services/fuelService";
import { invoiceService } from "../services/invoiceService";
import { contactService } from "../services/contactService";
import { noteService } from "../services/noteService";
import { reminderService } from "../services/reminderService";
import { serviceService } from "../services/serviceService";
import { inspectionService } from "../services/inspectionService";
import { operationsService } from "../services/operationsService";
import { notificationService } from "../services/notificationService";
import { socketService } from "../services/socketService";
import { useAuth } from "./AuthContext";

const FleetDataContext = createContext();

export function FleetDataProvider({ children }) {
  const { user, token } = useAuth();

  const [fuelLogs, setFuelLogs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [notes, setNotes] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [services, setServices] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [driverActivities, setDriverActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all fleet data when user is authenticated
  const fetchAllData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const [
        fuelData,
        invoiceData,
        contactData,
        noteData,
        reminderData,
        serviceData,
        opsData,
        notifData,
        inspData,
      ] = await Promise.allSettled([
        fuelService.getFuelLogs(),
        invoiceService.getInvoices(),
        contactService.getContacts(),
        noteService.getNotes(),
        reminderService.getReminders(),
        serviceService.getDueServices(),
        user && user.role === "manager" ? operationsService.getOperationsData() : Promise.resolve([]),
        notificationService.getNotifications(),
        user && user.role === "manager" ? inspectionService.getManagerInspections() : Promise.resolve([]),
      ]);

      if (fuelData.status === "fulfilled") setFuelLogs(fuelData.value);
      if (invoiceData.status === "fulfilled") setInvoices(invoiceData.value);
      if (contactData.status === "fulfilled") setContacts(contactData.value);
      if (noteData.status === "fulfilled") setNotes(noteData.value);
      if (reminderData.status === "fulfilled") setReminders(reminderData.value);
      if (serviceData.status === "fulfilled") setServices(serviceData.value);
      if (opsData.status === "fulfilled") setDriverActivities(opsData.value);
      if (notifData.status === "fulfilled") setNotifications(notifData.value);
      if (inspData.status === "fulfilled") setInspections(inspData.value);
    } catch (err) {
      console.error("Error fetching fleet data:", err);
      setError("Failed to load fleet data");
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (token) {
      fetchAllData();

      // Listen for Socket.IO real-time updates if manager
      socketService.connect();

      const handleRealtimeUpdate = () => {
        if (user && user.role === "manager") {
          operationsService.getOperationsData().then((data) => {
            if (data) setDriverActivities(data);
          }).catch((err) => console.error(err));
        }
      };

      const handleFuelUpdate = () => {
        fuelService.getManagerFuelLogs().then((data) => {
          if (data) setFuelLogs(data);
        }).catch((err) => console.error(err));
      };

      socketService.on("inspectionUpdated", handleRealtimeUpdate);
      socketService.on("journeyStarted", handleRealtimeUpdate);
      socketService.on("fuelLogUpdated", handleFuelUpdate);

      return () => {
        socketService.off("inspectionUpdated", handleRealtimeUpdate);
        socketService.off("journeyStarted", handleRealtimeUpdate);
        socketService.off("fuelLogUpdated", handleFuelUpdate);
      };
    }
  }, [token, user, fetchAllData]);

  // --- Notifications Actions ---
  const markNotificationAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id || item._id === id ? { ...item, isRead: true } : item))
    );
    try {
      await notificationService.markAsRead(id);
    } catch (e) {
      console.warn("Failed to mark notification read on backend:", e.message);
    }
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    try {
      await notificationService.markAllAsRead();
    } catch (e) {
      console.warn("Failed to mark all notifications read on backend:", e.message);
    }
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id && item._id !== id));
  };

  // --- Real-time Driver Activity Manual Refresh ---
  const fetchOperationsData = async (params = {}) => {
    try {
      const data = await operationsService.getOperationsData(params);
      setDriverActivities(data);
      return data;
    } catch (e) {
      console.error("Error fetching operations data:", e);
    }
  };

  // --- Fuel CRUD ---
  const addFuelLog = async (newFuel) => {
    const created = await fuelService.createFuelLog(newFuel);
    setFuelLogs((prev) => [created, ...prev]);
    return created;
  };

  const updateFuelLog = async (id, updatedFields) => {
    const updated = await fuelService.updateFuelLog(id, updatedFields);
    setFuelLogs((prev) =>
      prev.map((item) => (item.id === id || item._id === id ? updated : item))
    );
    return updated;
  };

  const deleteFuelLog = async (id) => {
    await fuelService.deleteFuelLog(id);
    setFuelLogs((prev) => prev.filter((item) => item.id !== id && item._id !== id));
  };

  // --- Invoice CRUD ---
  const addInvoice = async (newInvoice) => {
    const created = await invoiceService.createInvoice(newInvoice);
    setInvoices((prev) => [created, ...prev]);
    return created;
  };

  const updateInvoice = async (id, updatedFields) => {
    const updated = await invoiceService.updateInvoice(id, updatedFields);
    setInvoices((prev) =>
      prev.map((item) => (item.id === id || item._id === id ? updated : item))
    );
    return updated;
  };

  const deleteInvoice = async (id) => {
    await invoiceService.deleteInvoice(id);
    setInvoices((prev) => prev.filter((item) => item.id !== id && item._id !== id));
  };

  // --- Contact CRUD ---
  const addContact = async (newContact) => {
    const created = await contactService.createContact(newContact);
    setContacts((prev) => [created, ...prev]);
    return created;
  };

  const updateContact = async (id, updatedFields) => {
    const updated = await contactService.updateContact(id, updatedFields);
    setContacts((prev) =>
      prev.map((item) => (item.id === id || item._id === id ? updated : item))
    );
    return updated;
  };

  const deleteContact = async (id) => {
    await contactService.deleteContact(id);
    setContacts((prev) => prev.filter((item) => item.id !== id && item._id !== id));
  };

  // --- Note CRUD ---
  const addNote = async (newNote) => {
    const created = await noteService.createNote(newNote);
    setNotes((prev) => [created, ...prev]);
    return created;
  };

  const updateNote = async (id, updatedFields) => {
    const updated = await noteService.updateNote(id, updatedFields);
    setNotes((prev) =>
      prev.map((item) => (item.id === id || item._id === id ? updated : item))
    );
    return updated;
  };

  const deleteNote = async (id) => {
    await noteService.deleteNote(id);
    setNotes((prev) => prev.filter((item) => item.id !== id && item._id !== id));
  };

  // --- Reminder CRUD ---
  const addReminder = async (newReminder) => {
    const created = await reminderService.createReminder(newReminder);
    setReminders((prev) => [created, ...prev]);
    return created;
  };

  const updateReminder = async (id, updatedFields) => {
    const updated = await reminderService.updateReminder(id, updatedFields);
    setReminders((prev) =>
      prev.map((item) => (item.id === id || item._id === id ? updated : item))
    );
    return updated;
  };

  const deleteReminder = async (id) => {
    await reminderService.deleteReminder(id);
    setReminders((prev) => prev.filter((item) => item.id !== id && item._id !== id));
  };

  // --- Service CRUD ---
  const updateServiceStatus = async (id, newStatus) => {
    const updated = await serviceService.updateServiceStatus(id, newStatus);
    setServices((prev) =>
      prev.map((item) => (item.id === id || item._id === id ? updated : item))
    );
    return updated;
  };

  return (
    <FleetDataContext.Provider
      value={{
        fuelLogs,
        addFuelLog,
        updateFuelLog,
        deleteFuelLog,
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        contacts,
        addContact,
        updateContact,
        deleteContact,
        notes,
        addNote,
        updateNote,
        deleteNote,
        reminders,
        addReminder,
        updateReminder,
        deleteReminder,
        services,
        updateServiceStatus,
        inspections,
        setInspections,
        driverActivities,
        fetchOperationsData,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        isLoading,
        error,
        refreshAllData: fetchAllData,
      }}
    >
      {children}
    </FleetDataContext.Provider>
  );
}

export function useFleetData() {
  const context = useContext(FleetDataContext);
  if (!context) {
    throw new Error("useFleetData must be used within a FleetDataProvider");
  }
  return context;
}
