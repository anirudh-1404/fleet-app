import api from "./api";

export const workshopScheduleService = {
  getSchedules: async (filters = {}) => {
    const res = await api.get("/workshop/schedule", { params: filters });
    return res.data;
  },

  getScheduleById: async (id) => {
    const res = await api.get(`/workshop/schedule/${id}`);
    return res.data;
  },

  createSchedule: async (scheduleData) => {
    const res = await api.post("/workshop/schedule", scheduleData);
    return res.data;
  },

  updateSchedule: async (id, scheduleData) => {
    const res = await api.patch(`/workshop/schedule/${id}`, scheduleData);
    return res.data;
  },

  deleteSchedule: async (id) => {
    const res = await api.delete(`/workshop/schedule/${id}`);
    return res.data;
  },
};
