export const INSPECTION_DATA = [
  {
    id: "driver_checks",
    title: "Driver Checks",
    items: [
      "Valid driver's licence (correct class)",
      "Logbook/work diary up to date",
      "Fit for duty (not fatigued or impaired)",
      "Required PPE available (high-visibility clothing, safety boots, hard hat, gloves, etc.)"
    ]
  },
  {
    id: "walk_around",
    title: "Vehicle Walk-Around",
    items: [
      "Check tyres for correct inflation, damage, and adequate tread.",
      "Check for fluid leaks under the vehicle.",
      "Ensure headlights, brake lights, indicators, and hazard lights are working.",
      "Check windscreen and windows are clean and undamaged.",
      "Ensure number plates are clean and visible.",
      "Remove any obstacles around the vehicle.",
      "Truck body gate/doors Locked and secured."
    ]
  },
  {
    id: "under_bonnet",
    title: "Under the Bonnet (if applicable)",
    items: [
      "Engine oil level.",
      "Coolant level.",
      "Brake fluid level.",
      "Windscreen washer fluid.",
      "Battery appears secure and terminals are clean."
    ]
  },
  {
    id: "inside_vehicle",
    title: "Inside the Vehicle",
    items: [
      "Horn works.",
      "Wipers and washers operate correctly.",
      "Windows up-down working correctly.",
      "Rear View mirrors and Blind spot mirrors.",
      "Dashboard warning lights checked after starting.",
      "Fuel level is sufficient for the journey.",
      "Steering and brakes feel normal.",
      "Air pressure builds correctly",
      "Air leaks checked",
      "Low-air warning system operational"
    ]
  },
  {
    id: "coupling_trailer",
    title: "Coupling and Trailer (if applicable)",
    items: [
      "Fifth wheel securely locked",
      "Kingpin secure",
      "Safety chains correctly attached (where required)",
      "Electrical and air lines connected",
      "Landing legs fully raised",
      "Trailer brakes operational",
      "Trailer lights working"
    ]
  }
];

export const DUMMY_INSPECTION_SUBMISSIONS = [
  {
    id: "sub-001",
    driverName: "John Smith",
    vehicleName: "Volvo FH16",
    registration: "ABC-123",
    date: "Jul 31, 2026",
    status: "PASS",
    details: "All checks successfully passed. Odometer: 245,860 KM"
  },
  {
    id: "sub-002",
    driverName: "Michael Brown",
    vehicleName: "Scania R500",
    registration: "XYZ-789",
    date: "Jul 30, 2026",
    status: "FAIL",
    details: "Failed: Air leak checked in Inside Vehicle section."
  }
];

export let isTodayInspectionCompleted = false;
export const setTodayInspectionCompleted = (val) => {
  isTodayInspectionCompleted = val;
};
