import api from "./api";

export const customerService = {
  getCustomers: async (params = {}) => {
    const res = await api.get("/rental/customers", { params });
    return res.data;
  },

  getCustomerById: async (id) => {
    const res = await api.get(`/rental/customers/${id}`);
    return res.data;
  },

  createCustomer: async (data) => {
    const res = await api.post("/rental/customers", data);
    return res.data;
  },

  updateCustomer: async (id, data) => {
    const res = await api.patch(`/rental/customers/${id}`, data);
    return res.data;
  },
};
