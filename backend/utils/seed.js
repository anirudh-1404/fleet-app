import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Inspection from "../models/Inspection.js";
import Journey from "../models/Journey.js";
import Fuel from "../models/Fuel.js";
import Service from "../models/Service.js";
import Invoice from "../models/Invoice.js";
import Contact from "../models/Contact.js";
import Note from "../models/Note.js";
import Reminder from "../models/Reminder.js";
import Notification from "../models/Notification.js";

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("No MONGO_URI found in process.env!");
      return;
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      Inspection.deleteMany({}),
      Journey.deleteMany({}),
      Fuel.deleteMany({}),
      Service.deleteMany({}),
      Invoice.deleteMany({}),
      Contact.deleteMany({}),
      Note.deleteMany({}),
      Reminder.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log("Cleared existing database records.");

    // 1. Create Users (Manager & Drivers)
    const manager = await User.create({
      name: "Michael Johnson",
      email: "manager@fleet.com",
      password: "manager123",
      role: "manager",
      phone: "+61 412 345 678",
      status: "Active",
    });

    const driver1 = await User.create({
      name: "John Smith",
      email: "john@fleet.com",
      password: "driver123",
      role: "driver",
      phone: "+61 498 765 432",
      status: "Active",
    });

    const driver2 = await User.create({
      name: "David Wilson",
      email: "david@fleet.com",
      password: "driver123",
      role: "driver",
      phone: "+61 411 222 333",
      status: "Active",
    });

    const driver3 = await User.create({
      name: "Steve Adams",
      email: "steve@fleet.com",
      password: "driver123",
      role: "driver",
      phone: "+61 422 333 444",
      status: "Active",
    });

    const driver4 = await User.create({
      name: "Sarah Connor",
      email: "sarah@fleet.com",
      password: "driver123",
      role: "driver",
      phone: "+61 433 444 555",
      status: "Active",
    });

    console.log("Seeded Users (Manager & 4 Drivers)");

    // 2. Create Vehicles
    const vehicle1 = await Vehicle.create({
      vehicleType: "Truck",
      registration: "ABC-123",
      fleetNumber: "FLT-021",
      make: "Volvo",
      model: "FH16",
      year: 2024,
      vin: "1V1FH16X8MA123456",
      status: "Active",
      assignedDriver: driver1._id,
    });

    const vehicle2 = await Vehicle.create({
      vehicleType: "Truck",
      registration: "XYZ-789",
      fleetNumber: "FLT-042",
      make: "Scania",
      model: "R500",
      year: 2023,
      vin: "YS2R500X702654321",
      status: "Due Service",
      assignedDriver: driver2._id,
    });

    const vehicle3 = await Vehicle.create({
      vehicleType: "Truck",
      registration: "DEF-456",
      fleetNumber: "FLT-015",
      make: "Mercedes",
      model: "Actros",
      year: 2024,
      vin: "WDB9630031L987654",
      status: "Active",
      assignedDriver: driver3._id,
    });

    const vehicle4 = await Vehicle.create({
      vehicleType: "Van",
      registration: "VAN-456",
      fleetNumber: "FLT-088",
      make: "Toyota",
      model: "Hiace",
      year: 2022,
      vin: "JTEBR32F900112233",
      status: "In Inspection",
      assignedDriver: driver4._id,
    });

    console.log("Seeded Vehicles & Driver Assignments");

    // 3. Create Due Services
    await Service.create([
      {
        vehicle: vehicle2._id,
        serviceType: "190,000 KM Major Service",
        serviceDate: "2026-08-06",
        odometer: "192,450",
        cost: "$1,850",
        vendor: "Scania Authorized Service",
        nextDueDate: "2026-11-06",
        status: "Overdue",
        notes: "Transmission oil change and brake pad inspection required urgently.",
      },
      {
        vehicle: vehicle1._id,
        serviceType: "50,000 KM Standard Service",
        serviceDate: "2026-08-15",
        odometer: "48,200",
        cost: "$650",
        vendor: "Volvo Truck Center",
        nextDueDate: "2026-11-15",
        status: "Scheduled",
        notes: "Routine filter replace and engine checkup.",
      },
    ]);

    // 4. Create Fuel Logs
    await Fuel.create([
      {
        vehicle: vehicle1._id,
        date: "Aug 05, 2026",
        litres: 240,
        cost: 480,
        odometer: 48200,
        fuelEfficiency: "3.2 L/100km",
        vendor: "Shell Fleet Express",
        notes: "Full tank refill before long route",
        createdBy: manager._id,
      },
      {
        vehicle: vehicle2._id,
        date: "Aug 04, 2026",
        litres: 310,
        cost: 620,
        odometer: 192450,
        fuelEfficiency: "3.8 L/100km",
        vendor: "BP Highway",
        notes: "Highway transit refill",
        createdBy: manager._id,
      },
    ]);

    // 5. Create Invoices
    await Invoice.create([
      {
        invoiceNumber: "INV-2026-101",
        category: "Services",
        vendor: "Volvo Service Center",
        amount: "$1,250",
        date: "Aug 02, 2026",
        vehicle: vehicle1._id,
        status: "Paid",
        notes: "40,000 KM scheduled service invoice",
        createdBy: manager._id,
      },
      {
        invoiceNumber: "INV-2026-102",
        category: "Parts",
        vendor: "Scania Spare Parts",
        amount: "$890",
        date: "Aug 03, 2026",
        vehicle: vehicle2._id,
        status: "Pending",
        notes: "Replacement brake pads and disc set",
        createdBy: manager._id,
      },
    ]);

    // 6. Create Contacts
    await Contact.create([
      {
        name: "David Miller",
        company: "Apex Fleet Services",
        role: "Senior Technician",
        phone: "+61 412 888 999",
        email: "david@apexfleet.com.au",
        category: "Service Provider",
        notes: "Primary contact for heavy vehicle maintenance",
      },
      {
        name: "Sarah Jenkins",
        company: "Shell Commercial",
        role: "Account Manager",
        phone: "+61 433 111 222",
        email: "sarah.j@shell.com",
        category: "Supplier",
        notes: "Manages commercial fuel card discounts",
      },
    ]);

    // 7. Create Notes
    await Note.create([
      {
        title: "Tyre Pressure Advisory",
        content: "Please ensure rear trailer tyre pressure is checked daily on Volvo FH16 during morning pre-checks.",
        text: "Please ensure rear trailer tyre pressure is checked daily on Volvo FH16 during morning pre-checks.",
        date: "Aug 04, 2026",
        authorName: "Michael Johnson",
        linkedVehicle: vehicle1._id,
        vehicleRegistration: "ABC-123",
        createdBy: manager._id,
      },
    ]);

    // 8. Create Reminders
    await Reminder.create([
      {
        title: "Volvo FH16 Rego Renewal",
        type: "Registration",
        dueDate: "Aug 15, 2026",
        repeat: "Yearly",
        status: "Urgent",
        linkedItem: "ABC-123",
        createdBy: manager._id,
      },
      {
        title: "Driver Safety Briefing",
        type: "Meeting",
        dueDate: "Aug 10, 2026",
        repeat: "Monthly",
        status: "Normal",
        linkedItem: "All Drivers",
        createdBy: manager._id,
      },
    ]);

    // 9. Create Notifications
    await Notification.create([
      {
        title: "Inspection Failed Alert",
        message: "Sarah Connor reported 3 failed items during vehicle pre-check for Toyota Hiace (VAN-456).",
        time: "10 mins ago",
        category: "Inspection",
        isRead: false,
        isUrgent: true,
        targetRoute: "InspectionDetails",
      },
      {
        title: "Service Overdue Notice",
        message: "Scania R500 (XYZ-789) has exceeded its scheduled 190,000 KM service interval.",
        time: "1 hour ago",
        category: "Service",
        isRead: false,
        isUrgent: true,
        targetRoute: "ServiceDetails",
      },
    ]);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedData();
