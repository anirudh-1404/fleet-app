import api from "./api";

export const rentalVehicleService = {
  getVehicles: async (params = {}) => {
    const res = await api.get("/rental/vehicles", { params });
    return res.data;
  },

  getVehicleById: async (id) => {
    const res = await api.get(`/rental/vehicles/${id}`);
    return res.data;
  },

  createVehicle: async (data) => {
    const res = await api.post("/rental/vehicles", data);
    return res.data;
  },

  updateVehicle: async (id, data) => {
    const res = await api.patch(`/rental/vehicles/${id}`, data);
    return res.data;
  },

  deleteVehicle: async (id) => {
    const res = await api.delete(`/rental/vehicles/${id}`);
    return res.data;
  },
};
