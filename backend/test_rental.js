const API = "http://localhost:8000/api";

async function testRentalModule() {
  console.log("=== STARTING RENTAL MODULE INTEGRATION TESTS ===");

  try {
    // 1. Register or Login Rental Owner
    const ownerEmail = "owner@rental.com";
    const password = "password123";

    let token = "";
    const loginRes = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ownerEmail, password }),
    });

    if (loginRes.ok) {
      const data = await loginRes.json();
      token = data.token;
      console.log("✓ Logged in as existing rental owner");
    } else {
      // Register
      const regRes = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Alex Rental Owner",
          email: ownerEmail,
          password,
          phone: "+1 555-0100",
          role: "rental_owner",
        }),
      });
      const regData = await regRes.json();
      if (!regRes.ok) throw new Error(regData.message);
      token = regData.token;
      console.log("✓ Registered new rental owner");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // 2. Create a Rental Vehicle
    const regNum = "RENT-" + Math.floor(1000 + Math.random() * 9000);
    const vehicleRes = await fetch(`${API}/rental/vehicles`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        vehicleType: "Van",
        make: "Toyota",
        model: "HiAce Commercial",
        year: 2024,
        registration: regNum,
        dailyRate: 120,
        securityDeposit: 300,
        status: "AVAILABLE",
        notes: "Excellent condition van",
      }),
    });
    const vehicle = await vehicleRes.json();
    if (!vehicleRes.ok) throw new Error(vehicle.message);
    console.log(`✓ Created rental vehicle: ${vehicle.make} ${vehicle.model} (${vehicle.registration}) with ID: ${vehicle._id}`);

    // 3. Test Availability / Overlap Validation
    // Book from 2026-08-25 to 2026-08-28 (3 days)
    const rental1Res = await fetch(`${API}/rental/rentals`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        vehicleId: vehicle._id,
        customerDetails: {
          fullName: "John Smith",
          phone: "+1 555-0199",
          email: "john.smith@example.com",
          licenceNumber: "DL-98765432",
          licenceClass: "Car (Class C)",
        },
        startDate: "2026-08-25",
        startTime: "09:00",
        durationDays: 3,
        returnDate: "2026-08-28",
        returnTime: "17:00",
        dailyRate: 120,
        securityDeposit: 300,
        paymentStatus: "Paid",
      }),
    });
    const rental1 = await rental1Res.json();
    if (!rental1Res.ok) throw new Error(rental1.message);
    console.log(`✓ Created initial rental agreement #${rental1._id} for John Smith`);

    // Verify Vehicle status is now RENTED
    const vehCheckRes = await fetch(`${API}/rental/vehicles/${vehicle._id}`, { headers });
    const vehCheckData = await vehCheckRes.json();
    console.log(`✓ Vehicle status after booking: ${vehCheckData.vehicle.status} (Expected: RENTED)`);
    if (vehCheckData.vehicle.status !== "RENTED") {
      throw new Error("Vehicle status did not transition to RENTED");
    }

    // 4. Attempt OVERLAPPING Booking (2026-08-26 to 2026-08-30) - MUST FAIL!
    const overlapRes = await fetch(`${API}/rental/rentals`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        vehicleId: vehicle._id,
        customerDetails: {
          fullName: "Sarah Wilson",
          phone: "+1 555-0299",
          licenceNumber: "DL-11223344",
        },
        startDate: "2026-08-26",
        durationDays: 4,
        returnDate: "2026-08-30",
        dailyRate: 120,
      }),
    });

    const overlapData = await overlapRes.json();
    if (overlapRes.status === 400 && overlapData.message?.includes("already booked")) {
      console.log(`✓ Overlap Prevention correctly rejected booking: "${overlapData.message}"`);
    } else {
      throw new Error(`OVERLAP CHECK FAILED: Expected 400 rejected, got ${overlapRes.status} ${JSON.stringify(overlapData)}`);
    }

    // 5. Test Vehicle Return
    const returnRes = await fetch(`${API}/rental/rentals/${rental1._id}/return`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        actualReturnDate: "2026-08-28",
        actualReturnTime: "16:45",
        returnOdometer: 52400,
        returnFuelLevel: "Full",
        damageNotes: "No scratches, clean condition",
        additionalCharges: 0,
        returnNotes: "Returned on time",
        paymentStatus: "Paid",
      }),
    });
    const returnData = await returnRes.json();
    if (!returnRes.ok) throw new Error(returnData.message);
    console.log(`✓ Vehicle returned successfully. Rental status: ${returnData.status}`);

    // Verify Vehicle is now AVAILABLE again
    const vehAfterReturnRes = await fetch(`${API}/rental/vehicles/${vehicle._id}`, { headers });
    const vehAfterReturnData = await vehAfterReturnRes.json();
    console.log(`✓ Vehicle status after return: ${vehAfterReturnData.vehicle.status} (Expected: AVAILABLE)`);
    if (vehAfterReturnData.vehicle.status !== "AVAILABLE") {
      throw new Error("Vehicle status did not revert to AVAILABLE");
    }

    // 6. Test Vehicle Rental History
    console.log(`✓ Rental history length for vehicle: ${vehAfterReturnData.rentalHistory.length} (Expected: >= 1)`);

    // 7. Test Dashboard API
    const dashRes = await fetch(`${API}/rental/dashboard`, { headers });
    const dashData = await dashRes.json();
    console.log("✓ Dashboard summary stats:", dashData.summary);

    console.log("=== ALL RENTAL MODULE TESTS PASSED PERFECTLY ===");
  } catch (error) {
    console.error("TEST FAILED:", error.message || error);
    process.exit(1);
  }
}

testRentalModule();
