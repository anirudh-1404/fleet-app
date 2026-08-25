import Customer from "../models/Customer.js";
import Rental from "../models/Rental.js";

// @desc    Get all customers for the owner
// @route   GET /api/rental/customers
export const getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { owner: req.user._id };

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { fullName: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { licenceNumber: searchRegex },
      ];
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });

    // Fetch rental counts for each customer
    const customerIds = customers.map((c) => c._id);
    const rentals = await Rental.find({ customer: { $in: customerIds } }).select("customer status");

    const rentalCountMap = {};
    rentals.forEach((r) => {
      const cId = r.customer.toString();
      rentalCountMap[cId] = (rentalCountMap[cId] || 0) + 1;
    });

    const customersWithCount = customers.map((c) => ({
      ...c.toObject(),
      totalRentals: rentalCountMap[c._id.toString()] || 0,
    }));

    return res.status(200).json(customersWithCount);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return res.status(500).json({ message: "Failed to fetch customers", error: error.message });
  }
};

// @desc    Get customer by ID + Rental history
// @route   GET /api/rental/customers/:id
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const rentals = await Rental.find({
      customer: customer._id,
      owner: req.user._id,
    })
      .populate("vehicle", "make model year registration vehicleType photo")
      .sort({ startDate: -1 });

    return res.status(200).json({
      customer,
      rentals,
    });
  } catch (error) {
    console.error("Error fetching customer details:", error);
    return res.status(500).json({ message: "Failed to fetch customer details", error: error.message });
  }
};

// @desc    Create a new customer (or reuse if matching phone/licence)
// @route   POST /api/rental/customers
export const createCustomer = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      address,
      licenceNumber,
      licenceClass,
      licenceExpiry,
      idNumber,
      emergencyContact,
      notes,
    } = req.body;

    if (!fullName || !phone || !licenceNumber) {
      return res.status(400).json({
        message: "Please provide full name, phone number, and licence number",
      });
    }

    // Check if customer already exists for this owner
    let customer = await Customer.findOne({
      owner: req.user._id,
      $or: [
        { phone: phone.trim() },
        { licenceNumber: licenceNumber.toUpperCase().trim() },
      ],
    });

    if (customer) {
      // Update existing customer info with latest details if provided
      if (fullName) customer.fullName = fullName.trim();
      if (email) customer.email = email.toLowerCase().trim();
      if (address) customer.address = address.trim();
      if (licenceClass) customer.licenceClass = licenceClass.trim();
      if (licenceExpiry) customer.licenceExpiry = licenceExpiry;
      if (idNumber) customer.idNumber = idNumber.trim();
      if (emergencyContact) customer.emergencyContact = emergencyContact.trim();
      if (notes) customer.notes = notes.trim();

      customer = await customer.save();
      return res.status(200).json(customer);
    }

    customer = await Customer.create({
      owner: req.user._id,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email ? email.toLowerCase().trim() : "",
      address: address ? address.trim() : "",
      licenceNumber: licenceNumber.toUpperCase().trim(),
      licenceClass: licenceClass ? licenceClass.trim() : "",
      licenceExpiry: licenceExpiry || "",
      idNumber: idNumber ? idNumber.trim() : "",
      emergencyContact: emergencyContact ? emergencyContact.trim() : "",
      notes: notes ? notes.trim() : "",
    });

    return res.status(201).json(customer);
  } catch (error) {
    console.error("Error creating customer:", error);
    return res.status(500).json({ message: "Failed to create customer", error: error.message });
  }
};

// @desc    Update customer details
// @route   PATCH /api/rental/customers/:id
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const updatableFields = [
      "fullName",
      "phone",
      "email",
      "address",
      "licenceNumber",
      "licenceClass",
      "licenceExpiry",
      "idNumber",
      "emergencyContact",
      "notes",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "email") {
          customer.email = req.body.email.toLowerCase().trim();
        } else if (field === "licenceNumber") {
          customer.licenceNumber = req.body.licenceNumber.toUpperCase().trim();
        } else {
          customer[field] = typeof req.body[field] === "string" ? req.body[field].trim() : req.body[field];
        }
      }
    });

    const updated = await customer.save();
    return res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating customer:", error);
    return res.status(500).json({ message: "Failed to update customer", error: error.message });
  }
};
