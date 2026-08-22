import api from "./api";

export const serviceService = {
  getDueServices: async () => {
    const res = await api.get("/services/due");
    return res.data;
  },
  getServiceById: async (id) => {
    const res = await api.get(`/services/${id}`);
    return res.data;
  },
  updateServiceStatus: async (id, status) => {
    const res = await api.patch(`/services/${id}/status`, { status });
    return res.data;
  },
};
