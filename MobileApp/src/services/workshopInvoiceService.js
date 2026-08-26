import api from "./api";

export const workshopInvoiceService = {
  getInvoices: async (filters = {}) => {
    const res = await api.get("/workshop/invoices", { params: filters });
    return res.data;
  },

  getInvoiceById: async (id) => {
    const res = await api.get(`/workshop/invoices/${id}`);
    return res.data;
  },

  createInvoice: async (invoiceData) => {
    const res = await api.post("/workshop/invoices", invoiceData);
    return res.data;
  },

  updateInvoice: async (id, invoiceData) => {
    const res = await api.patch(`/workshop/invoices/${id}`, invoiceData);
    return res.data;
  },

  deleteInvoice: async (id) => {
    const res = await api.delete(`/workshop/invoices/${id}`);
    return res.data;
  },
};
