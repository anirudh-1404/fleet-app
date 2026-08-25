import api from "./api";

export const rentalService = {
  getRentals: async (params = {}) => {
    const res = await api.get("/rental/rentals", { params });
    return res.data;
  },

  getRentalById: async (id) => {
    const res = await api.get(`/rental/rentals/${id}`);
    return res.data;
  },

  createRental: async (data) => {
    const res = await api.post("/rental/rentals", data);
    return res.data;
  },

  updateRental: async (id, data) => {
    const res = await api.patch(`/rental/rentals/${id}`, data);
    return res.data;
  },

  returnRental: async (id, returnData) => {
    const res = await api.post(`/rental/rentals/${id}/return`, returnData);
    return res.data;
  },

  cancelRental: async (id) => {
    const res = await api.post(`/rental/rentals/${id}/cancel`);
    return res.data;
  },

  getDashboardData: async () => {
    const res = await api.get("/rental/dashboard");
    return res.data;
  },
};
