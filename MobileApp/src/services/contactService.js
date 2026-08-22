import api from "./api";

export const contactService = {
  getContacts: async () => {
    const res = await api.get("/contacts");
    return res.data;
  },
  createContact: async (data) => {
    const res = await api.post("/contacts", data);
    return res.data;
  },
  updateContact: async (id, data) => {
    const res = await api.patch(`/contacts/${id}`, data);
    return res.data;
  },
  deleteContact: async (id) => {
    const res = await api.delete(`/contacts/${id}`);
    return res.data;
  },
};
