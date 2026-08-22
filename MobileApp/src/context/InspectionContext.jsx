import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { inspectionService } from "../services/inspectionService";
import { journeyService } from "../services/journeyService";
import { useAuth } from "./AuthContext";
import { INSPECTION_DATA } from "@data/inspection";

const InspectionContext = createContext();

export function InspectionProvider({ children }) {
  const { user, token } = useAuth();

  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState({});
  const [odometer, setOdometer] = useState("245860");
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [todayInspectionRecord, setTodayInspectionRecord] = useState(null);
  const [todayJourneyRecord, setTodayJourneyRecord] = useState(null);

  const [isInspectionCompleted, setIsInspectionCompleted] = useState(false);
  const [journeyStatus, setJourneyStatus] = useState("Not Started");
  const [journeyStartTime, setJourneyStartTime] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  // Fetch driver today's inspection and journey from backend
  const fetchTodayDriverState = useCallback(async () => {
    if (!token || (user && user.role !== "driver")) return;
    setIsLoading(true);
    try {
      const [inspRes, journeyRes] = await Promise.allSettled([
        inspectionService.getTodayInspection(),
        journeyService.getTodayJourney(),
      ]);

      if (inspRes.status === "fulfilled" && inspRes.value) {
        const insp = inspRes.value;
        setTodayInspectionRecord(insp);
        setIsInspectionCompleted(insp.overallStatus === "Completed" || insp.overallStatus === "Failed");
        if (insp.odometer) setOdometer(insp.odometer);
      } else {
        setTodayInspectionRecord(null);
        setIsInspectionCompleted(false);
      }

      if (journeyRes.status === "fulfilled" && journeyRes.value) {
        const j = journeyRes.value;
        setTodayJourneyRecord(j);
        setJourneyStatus(j.status === "started" ? "Started" : j.status === "completed" ? "Completed" : "Not Started");
        if (j.startedAt) {
          setJourneyStartTime(
            new Date(j.startedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
          );
        }
      } else {
        setTodayJourneyRecord(null);
        setJourneyStatus("Not Started");
        setJourneyStartTime(null);
      }
    } catch (e) {
      console.error("Error fetching today driver state:", e);
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (token && user && user.role === "driver") {
      fetchTodayDriverState();
    }
  }, [token, user, fetchTodayDriverState]);

  // Submit inspection to backend
  const submitInspectionToBackend = async (vehicleRegistration, fleetNumber, vehicleId, customOdometer) => {
    // Format sections payload for backend
    const formattedSections = INSPECTION_DATA.map((sectionObj, sectionIdx) => {
      const items = sectionObj.items.map((item, itemIdx) => {
        const itemKey = `${sectionIdx}_${itemIdx}`;
        const itemLabel = typeof item === "string" ? item : (item.label || item);
        return {
          itemKey,
          label: itemLabel,
          status: answers[itemKey] || "N/A",
          note: notes[itemKey] || "",
        };
      });

      return {
        sectionName: sectionObj.title,
        items,
      };
    });

    const payload = {
      vehicleId,
      vehicleRegistration,
      fleetNumber,
      odometer: customOdometer || odometer,
      sections: formattedSections,
    };

    const savedInspection = await inspectionService.submitInspection(payload);
    setTodayInspectionRecord(savedInspection);
    setIsInspectionCompleted(true);
    return savedInspection;
  };

  // Start journey on backend (enforces completed inspection)
  const startJourneyOnBackend = async () => {
    const savedJourney = await journeyService.startJourney();
    setTodayJourneyRecord(savedJourney);
    setJourneyStatus("Started");
    if (savedJourney.startedAt) {
      setJourneyStartTime(
        new Date(savedJourney.startedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
    }
    return savedJourney;
  };

  // End journey on backend
  const endJourneyOnBackend = async (endOdometer) => {
    const savedJourney = await journeyService.endJourney(endOdometer);
    setIsInspectionCompleted(false);
    setJourneyStatus("Not Started");
    setJourneyStartTime(null);
    setTodayInspectionRecord(null);
    setTodayJourneyRecord(null);
    setSelectedVehicle(null);
    return savedJourney;
  };

  const resetInspection = () => {
    setAnswers({});
    setNotes({});
    setOdometer("245860");
    setIsInspectionCompleted(false);
    setJourneyStatus("Not Started");
    setJourneyStartTime(null);
    setTodayInspectionRecord(null);
    setTodayJourneyRecord(null);
  };

  return (
    <InspectionContext.Provider
      value={{
        answers,
        setAnswers,
        notes,
        setNotes,
        odometer,
        setOdometer,
        selectedVehicle,
        setSelectedVehicle,
        isInspectionCompleted,
        setIsInspectionCompleted,
        journeyStatus,
        setJourneyStatus,
        journeyStartTime,
        setJourneyStartTime,
        todayInspectionRecord,
        todayJourneyRecord,
        submitInspectionToBackend,
        startJourneyOnBackend,
        endJourneyOnBackend,
        refreshTodayState: fetchTodayDriverState,
        resetInspection,
        isLoading,
      }}
    >
      {children}
    </InspectionContext.Provider>
  );
}

export function useInspection() {
  const context = useContext(InspectionContext);
  if (!context) {
    throw new Error("useInspection must be used within an InspectionProvider");
  }
  return context;
}
