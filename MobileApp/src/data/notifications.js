export const DUMMY_NOTIFICATIONS = [
  {
    id: "notif-001",
    title: "Inspection Failed Alert",
    message: "John Smith reported a small oil leak near the rear axle during vehicle pre-check for Volvo FH16 (ABC-123).",
    time: "10 mins ago",
    category: "Inspection",
    isRead: false,
    isUrgent: true,
    targetRoute: "InspectionDetails",
    targetParams: { inspectionId: "insp-001" }
  },
  {
    id: "notif-002",
    title: "Service Overdue Notice",
    message: "Scania R500 (XYZ-789) has exceeded its scheduled 190,000 KM service interval by 2 days.",
    time: "1 hour ago",
    category: "Service",
    isRead: false,
    isUrgent: true,
    targetRoute: "ServiceDetails",
    targetParams: { serviceId: "serv-002" }
  },
  {
    id: "notif-003",
    title: "Journey Started",
    message: "John Smith started today's journey for Volvo FH16 (ABC-123) at 08:18 AM.",
    time: "2 hours ago",
    category: "Journey",
    isRead: true,
    isUrgent: false,
    targetRoute: "TodaysOperations",
    targetParams: {}
  },
  {
    id: "notif-004",
    title: "Registration Expiry Warning",
    message: "Volvo FH16 (ABC-123) registration is due for renewal in 7 days.",
    time: "Yesterday",
    category: "Rego",
    isRead: true,
    isUrgent: false,
    targetRoute: "ReminderDetails",
    targetParams: { reminderId: "r-001" }
  },
  {
    id: "notif-005",
    title: "New Operational Note",
    message: "Michael Johnson added a note regarding Ford Ranger tyre alignment inspection.",
    time: "2 days ago",
    category: "Notes",
    isRead: true,
    isUrgent: false,
    targetRoute: "NoteDetails",
    targetParams: { noteId: "n-002" }
  }
];
