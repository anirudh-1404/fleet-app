import api from "./api";

export const workshopDashboardService = {
  getDashboardData: async () => {
    const res = await api.get("/workshop/dashboard");
    return res.data;
  },
};
