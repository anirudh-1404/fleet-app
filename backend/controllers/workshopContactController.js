import WorkshopContact from "../models/WorkshopContact.js";

// @desc    Get all workshop contacts
// @route   GET /api/workshop/contacts
export const getWorkshopContacts = async (req, res) => {
  try {
    const owner = req.user._id;
    const { type, search } = req.query;

    let query = { owner };
    if (type && type !== "ALL") query.type = type;

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: "i" } },
        { company: { $regex: s, $options: "i" } },
        { phone: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
      ];
    }

    const contacts = await WorkshopContact.find(query).sort({ name: 1 }).lean();
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Server error fetching contacts" });
  }
};

// @desc    Get single contact by ID
// @route   GET /api/workshop/contacts/:id
export const getWorkshopContactById = async (req, res) => {
  try {
    const owner = req.user._id;
    const contact = await WorkshopContact.findOne({ _id: req.params.id, owner });
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json(contact);
  } catch (error) {
    console.error("Error fetching contact:", error);
    res.status(500).json({ message: "Server error fetching contact" });
  }
};

// @desc    Create contact
// @route   POST /api/workshop/contacts
export const createWorkshopContact = async (req, res) => {
  try {
    const owner = req.user._id;
    const { name, company, type, phone, email, address, notes } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Contact name is required" });
    }

    const contact = await WorkshopContact.create({
      owner,
      name: name.trim(),
      company: company ? company.trim() : "",
      type: type || "Other",
      phone: phone ? phone.trim() : "",
      email: email ? email.trim().toLowerCase() : "",
      address: address ? address.trim() : "",
      notes: notes ? notes.trim() : "",
    });

    res.status(201).json(contact);
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ message: "Server error creating contact" });
  }
};

// @desc    Update contact
// @route   PATCH /api/workshop/contacts/:id
export const updateWorkshopContact = async (req, res) => {
  try {
    const owner = req.user._id;
    const contact = await WorkshopContact.findOne({ _id: req.params.id, owner });
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    const { name, company, type, phone, email, address, notes } = req.body;

    if (name !== undefined) contact.name = name.trim();
    if (company !== undefined) contact.company = company.trim();
    if (type) contact.type = type;
    if (phone !== undefined) contact.phone = phone.trim();
    if (email !== undefined) contact.email = email.trim().toLowerCase();
    if (address !== undefined) contact.address = address.trim();
    if (notes !== undefined) contact.notes = notes.trim();

    await contact.save();
    res.json(contact);
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ message: "Server error updating contact" });
  }
};

// @desc    Delete contact
// @route   DELETE /api/workshop/contacts/:id
export const deleteWorkshopContact = async (req, res) => {
  try {
    const owner = req.user._id;
    const contact = await WorkshopContact.findOne({ _id: req.params.id, owner });
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    await WorkshopContact.deleteOne({ _id: contact._id });
    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Server error deleting contact" });
  }
};
