import api from "./api";

export const workshopInspectionService = {
  getInspections: async (filters = {}) => {
    const res = await api.get("/workshop/inspections", { params: filters });
    return res.data;
  },

  getInspectionById: async (id) => {
    const res = await api.get(`/workshop/inspections/${id}`);
    return res.data;
  },

  createInspection: async (inspectionData) => {
    const res = await api.post("/workshop/inspections", inspectionData);
    return res.data;
  },

  updateInspection: async (id, inspectionData) => {
    const res = await api.patch(`/workshop/inspections/${id}`, inspectionData);
    return res.data;
  },

  deleteInspection: async (id) => {
    const res = await api.delete(`/workshop/inspections/${id}`);
    return res.data;
  },
};
