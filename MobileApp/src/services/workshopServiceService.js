import api from "./api";

export const workshopServiceService = {
  getServices: async (filters = {}) => {
    const res = await api.get("/workshop/services", { params: filters });
    return res.data;
  },

  getServiceById: async (id) => {
    const res = await api.get(`/workshop/services/${id}`);
    return res.data;
  },

  createService: async (serviceData) => {
    const res = await api.post("/workshop/services", serviceData);
    return res.data;
  },

  updateService: async (id, serviceData) => {
    const res = await api.patch(`/workshop/services/${id}`, serviceData);
    return res.data;
  },

  deleteService: async (id) => {
    const res = await api.delete(`/workshop/services/${id}`);
    return res.data;
  },
};
