import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import WorkshopInquiry from "./models/WorkshopInquiry.js";
import WorkshopVehicle from "./models/WorkshopVehicle.js";
import WorkshopWorkOrder from "./models/WorkshopWorkOrder.js";
import jwt from "jsonwebtoken";
import http from "http";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const API_BASE = "http://localhost:8000";

function apiRequest(path, method = "GET", data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const postData = data ? JSON.stringify(data) : "";
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }
    if (data) {
      options.headers["Content-Length"] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject({ statusCode: res.statusCode, body: parsed });
          }
        } catch (e) {
          resolve({ raw: body, statusCode: res.statusCode });
        }
      });
    });

    req.on("error", reject);
    if (data) req.write(postData);
    req.end();
  });
}

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for Inquiry Test");

  // 1. Get or create two different managers: Admin A and Admin B
  let adminA = await User.findOne({ email: "test_admin_a@workshop.com" });
  if (!adminA) {
    adminA = await User.create({
      name: "Admin Alpha Workshops",
      email: "test_admin_a@workshop.com",
      password: "password123",
      role: "workshop_manager",
    });
  }

  let adminB = await User.findOne({ email: "test_admin_b@workshop.com" });
  if (!adminB) {
    adminB = await User.create({
      name: "Admin Beta Heavy Diesel",
      email: "test_admin_b@workshop.com",
      password: "password123",
      role: "workshop_manager",
    });
  }

  const tokenA = jwt.sign({ id: adminA._id, role: adminA.role }, JWT_SECRET, { expiresIn: "7d" });
  const tokenB = jwt.sign({ id: adminB._id, role: adminB.role }, JWT_SECRET, { expiresIn: "7d" });

  console.log(`Admin A: ${adminA.name} (${adminA._id})`);
  console.log(`Admin B: ${adminB.name} (${adminB._id})`);

  // Step 1: Verify Public Web Booking Form serves for Admin A and Admin B
  console.log("\n--- Step 1: Testing Public Form Web Page HTTP 200 ---");
  const htmlCheckA = await apiRequest(`/booking/${adminA._id}`, "GET");
  if (htmlCheckA.statusCode !== 200) throw new Error("Booking page failed to load for Admin A");
  console.log("✓ Public booking page loads HTML successfully for Admin A");

  const infoCheckA = await apiRequest(`/api/public/bookings/${adminA._id}`, "GET");
  console.log("✓ Public info API for Admin A:", infoCheckA.workshop?.name);

  // Step 2: Customer 1 submits form via Admin A's link (NO LOGIN)
  console.log("\n--- Step 2: Customer 1 submits booking to Admin A ---");
  const cust1Rego = "INQ-ALPHA-" + Math.floor(1000 + Math.random() * 9000);
  const cust1Payload = {
    customerName: "Nathan Drake",
    companyName: "Uncharted Haulage",
    mobileNumber: "0411 222 333",
    email: "nathan@uncharted.com",
    preferredContactMethod: "WhatsApp",
    customerNotes: "Available after 2 PM",
    registration: cust1Rego,
    vin: "1KW909ALPHA123456",
    make: "Kenworth",
    model: "T909",
    year: 2022,
    odometer: 165000,
    vehicleType: "Truck",
    fuelType: "Diesel",
    bookingTypes: ["Service / Maintenance", "Diagnostic / Fault Finding"],
    mainJobRequest: "Air pressure leak warning light on dashboard and slow brake response",
    signature: "data:image/png;base64,sample_signature_data_for_test",
  };

  const submitResA = await apiRequest(`/api/public/bookings/${adminA._id}`, "POST", cust1Payload);
  console.log("✓ Customer 1 submitted booking successfully:", submitResA.inquiryId);

  // Step 3: Customer 2 submits form via Admin B's link (NO LOGIN)
  console.log("\n--- Step 3: Customer 2 submits booking to Admin B ---");
  const cust2Rego = "INQ-BETA-" + Math.floor(1000 + Math.random() * 9000);
  const cust2Payload = {
    customerName: "Lara Croft",
    companyName: "Tomb Transport Pty",
    mobileNumber: "0422 333 444",
    email: "lara@tombtransport.com",
    preferredContactMethod: "Phone",
    customerNotes: "Please inspect ASAP",
    registration: cust2Rego,
    vin: "1VOLVOBETA9876543",
    make: "Volvo",
    model: "FH16",
    year: 2023,
    odometer: 98000,
    vehicleType: "Truck",
    fuelType: "Diesel",
    bookingTypes: ["Electrical Repair", "Air Conditioning"],
    mainJobRequest: "AC blowing warm air, climate control code error",
    signature: "data:image/png;base64,sample_signature_data_for_lara",
  };

  const submitResB = await apiRequest(`/api/public/bookings/${adminB._id}`, "POST", cust2Payload);
  console.log("✓ Customer 2 submitted booking successfully:", submitResB.inquiryId);

  // Step 4: Strict Multi-Admin Isolation Check
  console.log("\n--- Step 4: Testing Multi-Admin Data Isolation ---");
  const adminAInquiries = await apiRequest("/api/workshop/inquiries", "GET", null, tokenA);
  console.log(`Admin A sees ${adminAInquiries.inquiries.length} inquiries. Stats:`, adminAInquiries.stats);

  const adminBInquiries = await apiRequest("/api/workshop/inquiries", "GET", null, tokenB);
  console.log(`Admin B sees ${adminBInquiries.inquiries.length} inquiries. Stats:`, adminBInquiries.stats);

  const adminAHasCust1 = adminAInquiries.inquiries.some((i) => i.vehicle.registration === cust1Rego);
  const adminAHasCust2 = adminAInquiries.inquiries.some((i) => i.vehicle.registration === cust2Rego);

  const adminBHasCust1 = adminBInquiries.inquiries.some((i) => i.vehicle.registration === cust1Rego);
  const adminBHasCust2 = adminBInquiries.inquiries.some((i) => i.vehicle.registration === cust2Rego);

  if (!adminAHasCust1) throw new Error("Admin A CANNOT see Customer 1's inquiry!");
  if (adminAHasCust2) throw new Error("SECURITY LEAK: Admin A can see Customer 2's inquiry!");

  if (adminBHasCust1) throw new Error("SECURITY LEAK: Admin B can see Customer 1's inquiry!");
  if (!adminBHasCust2) throw new Error("Admin B CANNOT see Customer 2's inquiry!");

  console.log("✓ 100% PERFECT DATA ISOLATION: Admin A only sees Admin A inquiries, Admin B only sees Admin B inquiries!");

  // Step 5: Admin A updates status to CONTACTED
  console.log("\n--- Step 5: Admin A marks inquiry as CONTACTED ---");
  const updateRes = await apiRequest(
    `/api/workshop/inquiries/${submitResA.inquiryId}/status`,
    "PATCH",
    { status: "CONTACTED", internalNotes: "Spoke with Nathan, truck arriving tomorrow at 8 AM" },
    tokenA
  );
  console.log("✓ Updated status to:", updateRes.inquiry?.status);

  // Step 6: Admin A 1-Click Converts Inquiry to Workshop Work Order
  console.log("\n--- Step 6: Admin A converts inquiry to active Work Order ---");
  const convertRes = await apiRequest(
    `/api/workshop/inquiries/${submitResA.inquiryId}/convert`,
    "POST",
    null,
    tokenA
  );
  console.log("✓ Converted successfully! Created Job:", {
    jobNumber: convertRes.workOrder?.jobNumber,
    status: convertRes.workOrder?.status,
    jobType: convertRes.workOrder?.jobType,
    intakeDetailsComplaint: convertRes.workOrder?.intakeDetails?.customerComplaint,
  });

  // Verify Inquiry is now CONVERTED
  const inquiryAfterConvert = await apiRequest(
    `/api/workshop/inquiries/${submitResA.inquiryId}`,
    "GET",
    null,
    tokenA
  );
  console.log("✓ Inquiry status after conversion:", inquiryAfterConvert.status);
  console.log("✓ Linked Work Order:", inquiryAfterConvert.convertedWorkOrder?.jobNumber);

  if (inquiryAfterConvert.status !== "CONVERTED") {
    throw new Error("Expected inquiry status to be CONVERTED!");
  }

  console.log("\n=============================================");
  console.log("ALL TESTS PASSED WITH 100% SUCCESS! 🎉");
  console.log("=============================================");

  await mongoose.disconnect();
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
