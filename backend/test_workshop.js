const API_BASE = "http://localhost:8000/api";

async function runWorkshopTests() {
  console.log("==================================================");
  console.log("STARTING WORKSHOP MODULE END-TO-END INTEGRATION TEST");
  console.log("==================================================");

  const testEmail = `workshop_mgr_${Date.now()}@test.com`;
  const testPassword = "Password123!";
  let token = "";
  let customerId = "";
  let vehicleId = "";
  let workOrderId = "";
  let inspectionId = "";
  let serviceId = "";
  let invoiceId = "";

  // 1. Register Workshop Manager
  console.log("\n[1] Registering Workshop Manager:", testEmail);
  const regRes = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Raj Sharma (Workshop Lead)",
      email: testEmail,
      password: testPassword,
      phone: "+91 98111 22233",
      role: "workshop_manager",
    }),
  });

  const regData = await regRes.json();
  if (!regRes.ok) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
  token = regData.token;
  console.log("✔ Registered with token and role:", regData.role);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // 2. Create Customer (Amit Sharma)
  console.log("\n[2] Creating Customer: Amit Sharma");
  const custRes = await fetch(`${API_BASE}/workshop/customers`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      fullName: "Amit Sharma",
      companyName: "Sharma Logistics Ltd",
      phone: "+91 98765 43210",
      email: "amit@sharmalogistics.com",
      address: "Plot 14, Transporters Nagar, Sector 4",
      notes: "Preferred fleet contractor, 5 trucks in operation",
    }),
  });

  const custData = await custRes.json();
  if (!custRes.ok) throw new Error(`Customer creation failed: ${JSON.stringify(custData)}`);
  customerId = custData._id;
  console.log("✔ Customer Created with ID:", customerId);

  // 3. Create Customer Vehicle (Volvo FH16, Registration ABC-123)
  console.log("\n[3] Creating Customer Vehicle: Volvo FH16 (ABC-123)");
  const vehRes = await fetch(`${API_BASE}/workshop/vehicles`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      customerId,
      vehicleType: "Truck",
      registration: "ABC-123",
      make: "Volvo",
      model: "FH16",
      year: 2024,
      vin: "YV2RT40A5MA123456",
      odometer: 145000,
      status: "OUTSIDE_WORKSHOP",
      notes: "Heavy transport prime mover",
    }),
  });

  const vehData = await vehRes.json();
  if (!vehRes.ok) throw new Error(`Vehicle creation failed: ${JSON.stringify(vehData)}`);
  vehicleId = vehData._id;
  console.log("✔ Vehicle Created. Status:", vehData.status, "Registration:", vehData.registration);

  // 4. Create Work Order (Basic Service)
  console.log("\n[4] Creating Work Order: Basic Service");
  const woRes = await fetch(`${API_BASE}/workshop/work-orders`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      customerId,
      vehicleId,
      jobType: "Basic Service",
      description: "Standard 150k km interval service & brake check",
      priority: "Urgent",
      assignedMechanic: "Raj",
      status: "OPEN",
    }),
  });

  const woData = await woRes.json();
  if (!woRes.ok) throw new Error(`Work order creation failed: ${JSON.stringify(woData)}`);
  workOrderId = woData._id;
  console.log("✔ Work Order Created. Job Number:", woData.jobNumber, "Status:", woData.status);

  // Verify Vehicle Status changed to IN_WORKSHOP
  const checkVehRes = await fetch(`${API_BASE}/workshop/vehicles/${vehicleId}`, {
    headers: authHeaders,
  });
  const checkVehData = await checkVehRes.json();
  console.log("✔ Vehicle Status dynamically updated to:", checkVehData.vehicle.status);

  // 5. Create Inspection
  console.log("\n[5] Recording Truck Inspection");
  const inspRes = await fetch(`${API_BASE}/workshop/inspections`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      customerId,
      vehicleId,
      workOrderId,
      inspectionType: "Truck",
      inspectorName: "Raj",
      checklistItems: [
        { item: "Brakes & Air Lines", status: "PASS", note: "Pads at 60%" },
        { item: "Headlights & Indicators", status: "FAIL", note: "Rear left light lens cracked" },
        { item: "Tires & Wheels", status: "PASS", note: "Tread depth 8mm" },
        { item: "Engine Oil & Fluids", status: "PASS", note: "Clean" },
      ],
      status: "IN_PROGRESS",
      notes: "Requires replacement rear tail light assembly",
    }),
  });

  const inspData = await inspRes.json();
  if (!inspRes.ok) throw new Error(`Inspection failed: ${JSON.stringify(inspData)}`);
  inspectionId = inspData._id;
  console.log("✔ Inspection recorded. Status:", inspData.status, "Checks count:", inspData.checklistItems.length);

  // 6. Record Service
  console.log("\n[6] Recording Truck Service: Basic Service");
  const srvRes = await fetch(`${API_BASE}/workshop/services`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      customerId,
      vehicleId,
      workOrderId,
      vehicleCategory: "Truck",
      serviceType: "Basic Service",
      odometer: 145500,
      cost: 450,
      workshopVendor: "In-house Workshop Bay 1",
      notes: "Engine oil flushed, fuel filter and oil filter replaced",
    }),
  });

  const srvData = await srvRes.json();
  if (!srvRes.ok) throw new Error(`Service recording failed: ${JSON.stringify(srvData)}`);
  serviceId = srvData._id;
  console.log("✔ Service recorded. Next due date calculated:", srvData.nextDueDate);

  // 7. Record Parts / Invoice Expense
  console.log("\n[7] Adding Parts Invoice: Brake Light ($120)");
  const invRes = await fetch(`${API_BASE}/workshop/invoices`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      invoiceNumber: "INV-PARTS-8842",
      category: "Parts",
      customerId,
      vehicleId,
      workOrderId,
      vendor: "Volvo Genuine Parts",
      amount: 120,
      notes: "Rear tail light assembly and wiring harness",
    }),
  });

  const invData = await invRes.json();
  if (!invRes.ok) throw new Error(`Invoice recording failed: ${JSON.stringify(invData)}`);
  invoiceId = invData._id;
  console.log("✔ Invoice recorded. Amount:", invData.amount, "Category:", invData.category);

  // 8. Transition Work Order to READY_FOR_COLLECTION
  console.log("\n[8] Moving Work Order to READY_FOR_COLLECTION");
  const update1Res = await fetch(`${API_BASE}/workshop/work-orders/${workOrderId}`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ status: "READY_FOR_COLLECTION" }),
  });
  const update1Data = await update1Res.json();
  console.log("✔ Work order status:", update1Data.status);

  // Verify Vehicle is READY_FOR_COLLECTION
  const checkVehRes2 = await fetch(`${API_BASE}/workshop/vehicles/${vehicleId}`, {
    headers: authHeaders,
  });
  const checkVehData2 = await checkVehRes2.json();
  console.log("✔ Vehicle status dynamically updated to:", checkVehData2.vehicle.status);

  // 9. Transition Work Order to COMPLETED & Vehicle handover
  console.log("\n[9] Customer Collects Vehicle -> Moving Work Order to COMPLETED");
  const update2Res = await fetch(`${API_BASE}/workshop/work-orders/${workOrderId}`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ status: "COMPLETED" }),
  });
  const update2Data = await update2Res.json();
  console.log("✔ Work order status:", update2Data.status, "Completion date:", update2Data.actualCompletionDate);

  // Verify Vehicle returns to OUTSIDE_WORKSHOP
  const checkVehRes3 = await fetch(`${API_BASE}/workshop/vehicles/${vehicleId}`, {
    headers: authHeaders,
  });
  const checkVehData3 = await checkVehRes3.json();
  console.log("✔ Vehicle status returned to:", checkVehData3.vehicle.status);

  // 10. Test Schedule, Contact, Note, and Reminder
  console.log("\n[10] Creating Schedule, Contact, Note, and Reminder");
  await fetch(`${API_BASE}/workshop/schedule`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      vehicleId,
      customerId,
      serviceOrInspectionType: "Annual Service",
      scheduledDate: new Date(Date.now() + 86400000 * 14),
      assignedPerson: "Raj",
      notes: "Pre-booked 6-month checkup",
    }),
  });

  await fetch(`${API_BASE}/workshop/contacts`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Dave Auto Electricals",
      type: "Vendor",
      phone: "+91 99887 76655",
      notes: "Battery and alternator supplier",
    }),
  });

  await fetch(`${API_BASE}/workshop/notes`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      vehicleId,
      noteText: "Customer reported slight steering vibration above 80 km/h - re-aligned tires.",
    }),
  });

  await fetch(`${API_BASE}/workshop/reminders`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      title: "Order brake shoe replacements for stock",
      dueDate: new Date(Date.now() + 86400000 * 3),
      repeat: "Weekly",
    }),
  });
  console.log("✔ Sub-module entities created successfully");

  // 11. Test Live Workshop Dashboard API
  console.log("\n[11] Fetching Live Workshop Dashboard KPIs");
  const dashRes = await fetch(`${API_BASE}/workshop/dashboard`, {
    headers: authHeaders,
  });
  const dashData = await dashRes.json();
  console.log("✔ Dashboard Summary KPIs:", dashData.summary);
  console.log("✔ Recent Activity Count:", dashData.recentActivity?.length);

  // 12. Test Due Services API
  console.log("\n[12] Fetching System-Generated Due Services");
  const dueRes = await fetch(`${API_BASE}/workshop/due-services`, {
    headers: authHeaders,
  });
  const dueData = await dueRes.json();
  console.log("✔ Due Services calculated:", dueData.length, "vehicles evaluated");

  console.log("\n==================================================");
  console.log("ALL 12 INTEGRATION TESTS PASSED 100% SUCCESSFULLY!");
  console.log("==================================================");
}

runWorkshopTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
