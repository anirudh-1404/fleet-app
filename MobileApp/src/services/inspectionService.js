import api from "./api";

export const inspectionService = {
  submitInspection: async (data) => {
    const res = await api.post("/inspections", data);
    return res.data;
  },
  getTodayInspection: async () => {
    const res = await api.get("/inspections/driver/today");
    return res.data;
  },
  getMyInspections: async () => {
    const res = await api.get("/inspections/driver/my");
    return res.data;
  },
  getManagerInspections: async (params = {}) => {
    const res = await api.get("/inspections/manager/all", { params });
    return res.data;
  },
  getInspectionById: async (id) => {
    const res = await api.get(`/inspections/${id}`);
    return res.data;
  },
};
