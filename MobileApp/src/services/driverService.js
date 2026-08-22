import api from "./api";

export const driverService = {
  getDrivers: async () => {
    const res = await api.get("/drivers");
    return res.data;
  },
  getDriverById: async (id) => {
    const res = await api.get(`/drivers/${id}`);
    return res.data;
  },
  createDriver: async (data) => {
    const res = await api.post("/drivers", data);
    return res.data;
  },
  updateDriver: async (id, data) => {
    const res = await api.patch(`/drivers/${id}`, data);
    return res.data;
  },
  deleteDriver: async (id) => {
    const res = await api.delete(`/drivers/${id}`);
    return res.data;
  },
};
