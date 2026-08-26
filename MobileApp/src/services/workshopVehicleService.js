import api from "./api";

export const workshopVehicleService = {
  getVehicles: async (filters = {}) => {
    const res = await api.get("/workshop/vehicles", { params: filters });
    return res.data;
  },

  getVehicleById: async (id) => {
    const res = await api.get(`/workshop/vehicles/${id}`);
    return res.data;
  },

  createVehicle: async (vehicleData) => {
    const res = await api.post("/workshop/vehicles", vehicleData);
    return res.data;
  },

  updateVehicle: async (id, vehicleData) => {
    const res = await api.patch(`/workshop/vehicles/${id}`, vehicleData);
    return res.data;
  },

  deleteVehicle: async (id) => {
    const res = await api.delete(`/workshop/vehicles/${id}`);
    return res.data;
  },
};
