const API = "http://localhost:8000/api";

async function testWorkshopEmployeeFlow() {
  console.log("=== STARTING WORKSHOP EMPLOYEE & JOB MANAGEMENT TESTS ===");

  try {
    // 1. Register or Login Workshop Manager
    const managerEmail = "admin@garagepro.com";
    const password = "password123";

    let managerToken = "";
    const loginRes = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: managerEmail, password }),
    });

    if (loginRes.ok) {
      const data = await loginRes.json();
      managerToken = data.token;
      console.log("✓ Logged in as existing workshop manager");
    } else {
      const regRes = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Marcus Workshop Admin",
          email: managerEmail,
          password,
          phone: "+61 400 111 222",
          role: "workshop_manager",
        }),
      });
      const regData = await regRes.json();
      if (!regRes.ok) throw new Error(regData.message);
      managerToken = regData.token;
      console.log("✓ Registered new workshop manager");
    }

    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${managerToken}`,
    };

    // 2. Admin creates a new workshop employee (mechanic)
    const employeeEmail = `mechanic_${Date.now()}@garagepro.com`;
    const employeePassword = "MechanicPassword123";

    const createEmpRes = await fetch(`${API}/workshop/employees`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Dave The Mechanic",
        email: employeeEmail,
        password: employeePassword,
        phone: "+61 411 999 888",
        designation: "Senior Diagnostic Tech",
        specialization: ["Brakes", "Lube Service", "Suspension"],
        status: "Active",
      }),
    });

    const empData = await createEmpRes.json();
    if (!createEmpRes.ok) throw new Error(empData.message || "Failed to create employee");
    const employeeId = empData._id;
    console.log(`✓ Admin successfully created employee: ${empData.name} (${empData.designation})`);

    // 3. Admin lists employees
    const listEmpRes = await fetch(`${API}/workshop/employees`, {
      headers: authHeaders,
    });
    const employeesList = await listEmpRes.json();
    if (!listEmpRes.ok) throw new Error("Failed to list employees");
    const foundEmp = employeesList.find((e) => e._id === employeeId);
    if (!foundEmp) throw new Error("Created employee not found in employee list");
    console.log(`✓ Listed ${employeesList.length} employees, found created employee`);

    // 4. Employee logs in and gets token
    const empLoginRes = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: employeeEmail, password: employeePassword }),
    });
    const empLoginData = await empLoginRes.json();
    if (!empLoginRes.ok) throw new Error("Employee login failed: " + empLoginData.message);
    const employeeToken = empLoginData.token;
    console.log(`✓ Employee successfully logged in with role: ${empLoginData.role}`);

    const empHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${employeeToken}`,
    };

    // 5. Admin creates Customer & Vehicle if needed, then creates Work Order assigned to Employee
    // Create customer
    const custRes = await fetch(`${API}/workshop/customers`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        fullName: "Sarah Connor",
        email: `sarah_${Date.now()}@example.com`,
        phone: "+61 422 333 444",
      }),
    });
    const custData = await custRes.json();
    const customerId = custData._id;

    // Create vehicle
    const vehRes = await fetch(`${API}/workshop/vehicles`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        registration: `TST-${Math.floor(100 + Math.random() * 900)}`,
        make: "Toyota",
        model: "Hilux 4WD",
        year: 2023,
        vehicleType: "Truck",
        odometer: 45000,
        customerId: customerId,
      }),
    });
    const vehData = await vehRes.json();
    if (!vehRes.ok) throw new Error(vehData.message || "Failed to create vehicle");
    const vehicleId = vehData._id;

    // Create Work Order assigned to Dave The Mechanic
    const woRes = await fetch(`${API}/workshop/work-orders`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        customerId,
        vehicleId,
        jobType: "Lube Service",
        description: "Standard 45,000 km oil & filter change with 25-point safety check",
        assignedTo: employeeId,
        priority: "Normal",
        status: "OPEN",
      }),
    });
    const woData = await woRes.json();
    if (!woRes.ok) throw new Error(woData.message || "Failed to create work order");
    const workOrderId = woData._id;
    console.log(`✓ Admin created Work Order ${woData.jobNumber} assigned to ${woData.assignedMechanic}`);

    // 6. Employee fetches their assigned jobs
    const myJobsRes = await fetch(`${API}/workshop/my-jobs`, {
      headers: empHeaders,
    });
    const myJobsData = await myJobsRes.json();
    if (!myJobsRes.ok) throw new Error("Failed to fetch employee my-jobs");
    const assignedJob = myJobsData.jobs.find((j) => j._id === workOrderId);
    if (!assignedJob) throw new Error("Work order not found in employee's assigned jobs");
    console.log(`✓ Employee retrieved assigned jobs: Total=${myJobsData.counts.all}, Assigned=${myJobsData.counts.assigned}`);

    // 7. Employee updates status to IN_PROGRESS
    const updateStatusRes = await fetch(`${API}/workshop/work-orders/${workOrderId}`, {
      method: "PATCH",
      headers: empHeaders,
      body: JSON.stringify({ status: "IN_PROGRESS" }),
    });
    const updatedStatusData = await updateStatusRes.json();
    if (!updateStatusRes.ok) throw new Error(updatedStatusData.message || "Failed to update status");
    console.log(`✓ Employee updated job status to: ${updatedStatusData.status}`);

    // 8. Employee submits digital checklist
    const checklistItems = [
      { id: "oil_drain", label: "Drain Engine Oil & Replace Filter", category: "Engine", status: "PASS", observation: "Clean drain plug" },
      { id: "tyre_depth", label: "Check Tyre Tread Depth", category: "Tyres & Brakes", status: "PASS", measurement: "5.5mm" },
      { id: "brake_pads", label: "Check Brake Pad Thickness", category: "Tyres & Brakes", status: "PASS", measurement: "7mm" },
      { id: "battery_test", label: "Test Battery Health & Voltage", category: "Electrical", status: "PASS", measurement: "12.8V" },
    ];

    const checklistRes = await fetch(`${API}/workshop/work-orders/${workOrderId}/checklist`, {
      method: "POST",
      headers: empHeaders,
      body: JSON.stringify({
        checklistType: "LUBE_SERVICE",
        items: checklistItems,
        isCompleted: true,
      }),
    });
    const checklistData = await checklistRes.json();
    if (!checklistRes.ok) throw new Error(checklistData.message || "Failed to save checklist");
    console.log(`✓ Employee submitted digital checklist (${checklistData.checklist.items.length} items, type: ${checklistData.checklist.checklistType})`);

    // 9. Employee uploads photo evidence (before & after)
    const photoRes = await fetch(`${API}/workshop/work-orders/${workOrderId}/photos`, {
      method: "POST",
      headers: empHeaders,
      body: JSON.stringify({
        type: "before",
        url: "https://example.com/photos/oil-drain-before.jpg",
        caption: "Dark engine oil before flush",
      }),
    });
    const photoData = await photoRes.json();
    if (!photoRes.ok) throw new Error(photoData.message || "Failed to upload photo");
    console.log(`✓ Employee uploaded photo evidence: ${photoData.photos.before[0].caption}`);

    // 10. Employee adds work notes
    const noteRes = await fetch(`${API}/workshop/work-orders/${workOrderId}/notes`, {
      method: "POST",
      headers: empHeaders,
      body: JSON.stringify({
        text: "Oil replaced with 5.5L 5W-30 synthetic. Filter torqued to 25Nm. Vehicle running smoothly.",
      }),
    });
    const noteData = await noteRes.json();
    if (!noteRes.ok) throw new Error(noteData.message || "Failed to add work note");
    console.log(`✓ Employee added work note: "${noteData.workNotes[0].text.slice(0, 45)}..."`);

    // 11. Team Chat: Employee sends message, Admin replies
    const msg1Res = await fetch(`${API}/workshop/work-orders/${workOrderId}/messages`, {
      method: "POST",
      headers: empHeaders,
      body: JSON.stringify({ text: "Hey Boss, oil service complete. Brake pads look great, no replacement needed." }),
    });
    const msg1Data = await msg1Res.json();
    if (!msg1Res.ok) throw new Error(msg1Data.message || "Failed to send employee message");
    console.log(`✓ Mechanic sent chat message: "${msg1Data.text}"`);

    const msg2Res = await fetch(`${API}/workshop/work-orders/${workOrderId}/messages`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ text: "Awesome work Dave! Please test drive and mark as completed." }),
    });
    const msg2Data = await msg2Res.json();
    if (!msg2Res.ok) throw new Error(msg2Data.message || "Failed to send manager message");
    console.log(`✓ Admin replied in chat: "${msg2Data.text}"`);

    // Verify messages retrieved
    const getMsgsRes = await fetch(`${API}/workshop/work-orders/${workOrderId}/messages`, {
      headers: empHeaders,
    });
    const messages = await getMsgsRes.json();
    if (!getMsgsRes.ok || messages.length !== 2) throw new Error("Failed to retrieve chat messages");
    console.log(`✓ Retrieved all ${messages.length} work order team messages`);

    // 12. Employee marks work order COMPLETED
    const completeRes = await fetch(`${API}/workshop/work-orders/${workOrderId}`, {
      method: "PATCH",
      headers: empHeaders,
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    const completeData = await completeRes.json();
    if (!completeRes.ok) throw new Error(completeData.message || "Failed to complete job");
    console.log(`✓ Employee marked job as COMPLETED (actual completion: ${completeData.actualCompletionDate})`);

    console.log("\n🎉 ALL 12 WORKSHOP EMPLOYEE & JOB MANAGEMENT TESTS PASSED SUCCESSFULLY! 🎉\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
    process.exit(1);
  }
}

testWorkshopEmployeeFlow();
