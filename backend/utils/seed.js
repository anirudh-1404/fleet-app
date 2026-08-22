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
    console.log("Connected to MongoDB for complete wipe...");

    // Clear all existing collections
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

    console.log("Database wiped completely! Zero users, zero static records.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedData();
