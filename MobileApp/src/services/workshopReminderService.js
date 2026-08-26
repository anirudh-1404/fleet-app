import api from "./api";

export const workshopReminderService = {
  getReminders: async (filters = {}) => {
    const res = await api.get("/workshop/reminders", { params: filters });
    return res.data;
  },

  getReminderById: async (id) => {
    const res = await api.get(`/workshop/reminders/${id}`);
    return res.data;
  },

  createReminder: async (reminderData) => {
    const res = await api.post("/workshop/reminders", reminderData);
    return res.data;
  },

  updateReminder: async (id, reminderData) => {
    const res = await api.patch(`/workshop/reminders/${id}`, reminderData);
    return res.data;
  },

  deleteReminder: async (id) => {
    const res = await api.delete(`/workshop/reminders/${id}`);
    return res.data;
  },
};
