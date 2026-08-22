export const DUMMY_SERVICES = [
  {
    id: "serv-001",
    vehicleName: "Volvo FH16",
    registration: "ABC-123",
    fleetNumber: "FLT-021",
    lastService: "15 Jan 2026",
    nextService: "15 Aug 2026",
    daysRemaining: 7,
    status: "Due Soon",
    healthStatus: "Needs Attention",
    odometer: "245,860 KM",
    serviceType: "Major Engine & Brake Service",
    provider: "Volvo Truck Center - Sydney",
    notes: "Requires full oil filter replacement, brake pad check, and transmission flush.",
    tasks: [
      { id: "t1", title: "Engine Oil & Filter Change", completed: false },
      { id: "t2", title: "Front & Rear Brake Inspection", completed: false },
      { id: "t3", title: "Tyre Pressure & Alignment Check", completed: true },
      { id: "t4", title: "Coolant System Flush", completed: false }
    ]
  },
  {
    id: "serv-002",
    vehicleName: "Scania R500",
    registration: "XYZ-789",
    fleetNumber: "FLT-088",
    lastService: "10 Feb 2026",
    nextService: "10 Aug 2026",
    daysRemaining: 2,
    status: "Overdue",
    healthStatus: "Critical",
    odometer: "189,100 KM",
    serviceType: "Scheduled 190k Maintenance",
    provider: "Scania Fleet Care",
    notes: "Overdue by 2 days. Suspension squeak reported by driver.",
    tasks: [
      { id: "t1", title: "Suspension Inspection & Lubrication", completed: false },
      { id: "t2", title: "Air Filter Replacement", completed: false },
      { id: "t3", title: "Battery Health Check", completed: true }
    ]
  },
  {
    id: "serv-003",
    vehicleName: "Toyota Hiace",
    registration: "VAN-456",
    fleetNumber: "FLT-014",
    lastService: "01 Jun 2026",
    nextService: "01 Dec 2026",
    daysRemaining: 115,
    status: "Normal",
    healthStatus: "Good",
    odometer: "98,000 KM",
    serviceType: "Minor Interval Service",
    provider: "Toyota Commercial Repair",
    notes: "Vehicle operating in optimal condition.",
    tasks: [
      { id: "t1", title: "Standard Oil Change", completed: true },
      { id: "t2", title: "Wiper Blade Replacement", completed: true }
    ]
  }
];
