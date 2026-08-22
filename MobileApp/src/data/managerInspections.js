export const MOCK_INSPECTIONS = [
  {
    id: "insp-001",
    driver: {
      name: "John Smith",
      licence: "AU-248716",
      phone: "+61 412 345 678",
      email: "john.smith@example.com"
    },
    vehicle: {
      name: "Volvo FH16",
      registration: "ABC-123",
      fleetNumber: "FLT-021",
      trailerNumber: "TR-11"
    },
    date: "Today",
    time: "08:05 AM",
    duration: "12 mins",
    status: "Completed",
    inspectionStatus: "Completed",
    journeyStatus: "Started",
    inspectionTime: "08:05 AM",
    journeyStartTime: "08:15 AM",
    summary: {
      pass: 30,
      fail: 1,
      na: 2,
      notes: 1
    },
    notesList: [
      "Small oil leak near rear axle."
    ],
    sections: [
      {
        id: "driver_checks",
        title: "Driver Checks",
        items: [
          { name: "Valid driver's licence (correct class)", status: "PASS" },
          { name: "Logbook/work diary up to date", status: "PASS" },
          { name: "Fit for duty (not fatigued or impaired)", status: "PASS" },
          { name: "Required PPE available (high-visibility clothing, safety boots, hard hat, gloves, etc.)", status: "PASS" }
        ]
      },
      {
        id: "walk_around",
        title: "Vehicle Walk-Around",
        items: [
          { name: "Check tyres for correct inflation, damage, and adequate tread.", status: "PASS" },
          { name: "Check for fluid leaks under the vehicle.", status: "FAIL", note: "Small oil leak near rear axle." },
          { name: "Ensure headlights, brake lights, indicators, and hazard lights are working.", status: "PASS" },
          { name: "Check windscreen and windows are clean and undamaged.", status: "PASS" },
          { name: "Ensure number plates are clean and visible.", status: "PASS" },
          { name: "Remove any obstacles around the vehicle.", status: "PASS" },
          { name: "Truck body gate/doors Locked and secured.", status: "PASS" }
        ]
      },
      {
        id: "under_bonnet",
        title: "Under the Bonnet (if applicable)",
        items: [
          { name: "Engine oil level.", status: "PASS" },
          { name: "Coolant level.", status: "PASS" },
          { name: "Brake fluid level.", status: "PASS" },
          { name: "Windscreen washer fluid.", status: "PASS" },
          { name: "Battery appears secure and terminals are clean.", status: "PASS" }
        ]
      },
      {
        id: "inside_vehicle",
        title: "Inside the Vehicle",
        items: [
          { name: "Horn works.", status: "PASS" },
          { name: "Wipers and washers operate correctly.", status: "PASS" },
          { name: "Windows up-down working correctly.", status: "PASS" },
          { name: "Rear View mirrors and Blind spot mirrors.", status: "PASS" },
          { name: "Dashboard warning lights checked after starting.", status: "PASS" },
          { name: "Fuel level is sufficient for the journey.", status: "PASS" },
          { name: "Steering and brakes feel normal.", status: "PASS" },
          { name: "Air pressure builds correctly", status: "PASS" },
          { name: "Air leaks checked", status: "PASS" },
          { name: "Low-air warning system operational", status: "PASS" }
        ]
      },
      {
        id: "coupling_trailer",
        title: "Coupling and Trailer (if applicable)",
        items: [
          { name: "Fifth wheel securely locked", status: "PASS" },
          { name: "Kingpin secure", status: "PASS" },
          { name: "Safety chains correctly attached (where required)", status: "PASS" },
          { name: "Electrical and air lines connected", status: "PASS" },
          { name: "Landing legs fully raised", status: "PASS" },
          { name: "Trailer brakes operational", status: "N/A" },
          { name: "Trailer lights working", status: "N/A" }
        ]
      }
    ]
  },
  {
    id: "insp-002",
    driver: {
      name: "David Wilson",
      licence: "AU-983621",
      phone: "+61 412 555 666",
      email: "daniel.wilson@example.com"
    },
    vehicle: {
      name: "Scania R500",
      registration: "XYZ-789",
      fleetNumber: "FLT-088",
      trailerNumber: "TR-05"
    },
    date: "Today",
    time: "Not Started",
    duration: "--",
    status: "Pending",
    inspectionStatus: "Pending",
    journeyStatus: "Not Started",
    inspectionTime: "-",
    journeyStartTime: "-",
    summary: {
      pass: 0,
      fail: 0,
      na: 0,
      notes: 0
    },
    notesList: [],
    sections: []
  },
  {
    id: "insp-003",
    driver: {
      name: "Steve Adams",
      licence: "AU-555333",
      phone: "+61 412 222 333",
      email: "steve.adams@example.com"
    },
    vehicle: {
      name: "Mercedes Actros",
      registration: "MQA-707",
      fleetNumber: "FLT-007",
      trailerNumber: "Not Applicable"
    },
    date: "Today",
    time: "08:10 AM",
    duration: "10 mins",
    status: "Completed",
    inspectionStatus: "Completed",
    journeyStatus: "Not Started",
    inspectionTime: "08:10 AM",
    journeyStartTime: "-",
    summary: {
      pass: 32,
      fail: 0,
      na: 0,
      notes: 0
    },
    notesList: [],
    sections: [
      {
        id: "driver_checks",
        title: "Driver Checks",
        items: [
          { name: "Valid driver's licence (correct class)", status: "PASS" },
          { name: "Logbook/work diary up to date", status: "PASS" },
          { name: "Fit for duty (not fatigued or impaired)", status: "PASS" },
          { name: "Required PPE available (high-visibility clothing, safety boots, hard hat, gloves, etc.)", status: "PASS" }
        ]
      },
      {
        id: "walk_around",
        title: "Vehicle Walk-Around",
        items: [
          { name: "Check tyres for correct inflation, damage, and adequate tread.", status: "PASS" },
          { name: "Check for fluid leaks under the vehicle.", status: "PASS" },
          { name: "Ensure headlights, brake lights, indicators, and hazard lights are working.", status: "PASS" },
          { name: "Check windscreen and windows are clean and undamaged.", status: "PASS" },
          { name: "Ensure number plates are clean and visible.", status: "PASS" },
          { name: "Remove any obstacles around the vehicle.", status: "PASS" },
          { name: "Truck body gate/doors Locked and secured.", status: "PASS" }
        ]
      },
      {
        id: "under_bonnet",
        title: "Under the Bonnet (if applicable)",
        items: [
          { name: "Engine oil level.", status: "PASS" },
          { name: "Coolant level.", status: "PASS" },
          { name: "Brake fluid level.", status: "PASS" },
          { name: "Windscreen washer fluid.", status: "PASS" },
          { name: "Battery appears secure and terminals are clean.", status: "PASS" }
        ]
      },
      {
        id: "inside_vehicle",
        title: "Inside the Vehicle",
        items: [
          { name: "Horn works.", status: "PASS" },
          { name: "Wipers and washers operate correctly.", status: "PASS" },
          { name: "Windows up-down working correctly.", status: "PASS" },
          { name: "Rear View mirrors and Blind spot mirrors.", status: "PASS" },
          { name: "Dashboard warning lights checked after starting.", status: "PASS" },
          { name: "Fuel level is sufficient for the journey.", status: "PASS" },
          { name: "Steering and brakes feel normal.", status: "PASS" },
          { name: "Air pressure builds correctly", status: "PASS" },
          { name: "Air leaks checked", status: "PASS" },
          { name: "Low-air warning system operational", status: "PASS" }
        ]
      },
      {
        id: "coupling_trailer",
        title: "Coupling and Trailer (if applicable)",
        items: [
          { name: "Fifth wheel securely locked", status: "PASS" },
          { name: "Kingpin secure", status: "PASS" },
          { name: "Safety chains correctly attached (where required)", status: "PASS" },
          { name: "Electrical and air lines connected", status: "PASS" },
          { name: "Landing legs fully raised", status: "PASS" },
          { name: "Trailer brakes operational", status: "PASS" },
          { name: "Trailer lights working", status: "PASS" }
        ]
      }
    ]
  }
];

export const getInspectionById = (id) => {
  return MOCK_INSPECTIONS.find((i) => i.id === id) || MOCK_INSPECTIONS[0];
};
