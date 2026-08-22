import Contact from "../models/Contact.js";

export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return res.json(contacts);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching contacts" });
  }
};

export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    return res.json(contact);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching contact" });
  }
};

export const createContact = async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    return res.status(201).json(contact);
  } catch (error) {
    return res.status(500).json({ message: "Server error creating contact" });
  }
};

export const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    return res.json(contact);
  } catch (error) {
    return res.status(500).json({ message: "Server error updating contact" });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    return res.json({ message: "Contact deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error deleting contact" });
  }
};
