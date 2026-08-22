import api from "./api";

export const invoiceService = {
  getInvoices: async () => {
    const res = await api.get("/invoices");
    return res.data;
  },
  createInvoice: async (data) => {
    const res = await api.post("/invoices", data);
    return res.data;
  },
  updateInvoice: async (id, data) => {
    const res = await api.patch(`/invoices/${id}`, data);
    return res.data;
  },
  deleteInvoice: async (id) => {
    const res = await api.delete(`/invoices/${id}`);
    return res.data;
  },
};
