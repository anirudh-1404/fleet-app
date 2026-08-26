import api from "./api";

export const workshopDueServiceService = {
  getDueServices: async (filters = {}) => {
    const res = await api.get("/workshop/due-services", { params: filters });
    return res.data;
  },
};
