import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { connectdb } from "./utils/db.js";

import authRoutes from "./routes/authRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import inspectionRoutes from "./routes/inspectionRoutes.js";
import journeyRoutes from "./routes/journeyRoutes.js";
import operationsRoutes from "./routes/operationsRoutes.js";
import fuelRoutes from "./routes/fuelRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import rentalRoutes from "./routes/rentalRoutes.js";
import path from "path";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

app.set("io", io);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/journeys", journeyRoutes);
app.use("/api/manager/operations", operationsRoutes);
app.use("/api/fuel", fuelRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/rental", rentalRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Fleet Express API + MongoDB + Socket.IO Server Active" });
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8000;

connectdb().then(() => {
  server.listen(PORT, () => {
    console.log(`Fleet Server running on port ${PORT}`);
  });
});
