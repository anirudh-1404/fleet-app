import api from "./api";

export const vehicleService = {
  getVehicles: async () => {
    const res = await api.get("/vehicles");
    return res.data;
  },
  getVehicleById: async (id) => {
    const res = await api.get(`/vehicles/${id}`);
    return res.data;
  },
  getMyVehicle: async () => {
    const res = await api.get("/vehicles/driver/me");
    return res.data;
  },
  createVehicle: async (data) => {
    const res = await api.post("/vehicles", data);
    return res.data;
  },
  updateVehicle: async (id, data) => {
    const res = await api.patch(`/vehicles/${id}`, data);
    return res.data;
  },
  deleteVehicle: async (id) => {
    const res = await api.delete(`/vehicles/${id}`);
    return res.data;
  },
  assignDriver: async (vehicleId, driverId) => {
    const res = await api.patch(`/vehicles/${vehicleId}/assign-driver`, { driverId });
    return res.data;
  },
};
