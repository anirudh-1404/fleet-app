import api from "./api";

export const fuelService = {
  getManagerFuelLogs: async () => {
    const response = await api.get("/fuel");
    return response.data;
  },

  getMyFuelLogs: async () => {
    const response = await api.get("/fuel/my-logs");
    return response.data;
  },

  getFuelById: async (id) => {
    const response = await api.get(`/fuel/${id}`);
    return response.data;
  },

  submitFuelLog: async (payload) => {
    const response = await api.post("/fuel", payload);
    return response.data;
  },

  updateFuelLog: async (id, payload) => {
    const response = await api.patch(`/fuel/${id}`, payload);
    return response.data;
  },

  deleteFuelLog: async (id) => {
    const response = await api.delete(`/fuel/${id}`);
    return response.data;
  },
};
