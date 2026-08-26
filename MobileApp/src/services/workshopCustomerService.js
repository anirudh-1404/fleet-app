import api from "./api";

export const workshopCustomerService = {
  getCustomers: async (search = "") => {
    const params = search ? { search } : {};
    const res = await api.get("/workshop/customers", { params });
    return res.data;
  },

  getCustomerById: async (id) => {
    const res = await api.get(`/workshop/customers/${id}`);
    return res.data;
  },

  createCustomer: async (customerData) => {
    const res = await api.post("/workshop/customers", customerData);
    return res.data;
  },

  updateCustomer: async (id, customerData) => {
    const res = await api.patch(`/workshop/customers/${id}`, customerData);
    return res.data;
  },

  deleteCustomer: async (id) => {
    const res = await api.delete(`/workshop/customers/${id}`);
    return res.data;
  },
};
