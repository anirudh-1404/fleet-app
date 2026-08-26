import api from "./api";

export const workshopContactService = {
  getContacts: async (filters = {}) => {
    const res = await api.get("/workshop/contacts", { params: filters });
    return res.data;
  },

  getContactById: async (id) => {
    const res = await api.get(`/workshop/contacts/${id}`);
    return res.data;
  },

  createContact: async (contactData) => {
    const res = await api.post("/workshop/contacts", contactData);
    return res.data;
  },

  updateContact: async (id, contactData) => {
    const res = await api.patch(`/workshop/contacts/${id}`, contactData);
    return res.data;
  },

  deleteContact: async (id) => {
    const res = await api.delete(`/workshop/contacts/${id}`);
    return res.data;
  },
};
