import api from "./api";

export const reminderService = {
  getReminders: async () => {
    const res = await api.get("/reminders");
    return res.data;
  },
  createReminder: async (data) => {
    const res = await api.post("/reminders", data);
    return res.data;
  },
  updateReminder: async (id, data) => {
    const res = await api.patch(`/reminders/${id}`, data);
    return res.data;
  },
  deleteReminder: async (id) => {
    const res = await api.delete(`/reminders/${id}`);
    return res.data;
  },
};
