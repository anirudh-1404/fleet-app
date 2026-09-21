import api from "./api";

export const workshopEmployeeService = {
  // Admin Employee Management
  getEmployees: async () => {
    const res = await api.get("/workshop/employees");
    return res.data;
  },

  getEmployeeById: async (id) => {
    const res = await api.get(`/workshop/employees/${id}`);
    return res.data;
  },

  createEmployee: async (employeeData) => {
    const res = await api.post("/workshop/employees", employeeData);
    return res.data;
  },

  updateEmployee: async (id, employeeData) => {
    const res = await api.patch(`/workshop/employees/${id}`, employeeData);
    return res.data;
  },

  deleteEmployee: async (id) => {
    const res = await api.delete(`/workshop/employees/${id}`);
    return res.data;
  },

  // Mechanic / Employee Portal APIs
  getMyJobs: async (filters = {}) => {
    const res = await api.get("/workshop/my-jobs", { params: filters });
    return res.data;
  },

  getJobDetails: async (id) => {
    const res = await api.get(`/workshop/work-orders/${id}`);
    return res.data;
  },

  updateJobStatus: async (id, status) => {
    const res = await api.patch(`/workshop/work-orders/${id}`, { status });
    return res.data;
  },

  submitChecklist: async (id, { checklistType, items, isCompleted }) => {
    const res = await api.post(`/workshop/work-orders/${id}/checklist`, {
      checklistType,
      items,
      isCompleted,
    });
    return res.data;
  },

  uploadJobPhotoEvidence: async (id, { type, url, caption }) => {
    const res = await api.post(`/workshop/work-orders/${id}/photos`, {
      type,
      url,
      caption,
    });
    return res.data;
  },

  addWorkNote: async (id, text) => {
    const res = await api.post(`/workshop/work-orders/${id}/notes`, { text });
    return res.data;
  },

  getJobMessages: async (id) => {
    const res = await api.get(`/workshop/work-orders/${id}/messages`);
    return res.data;
  },

  sendJobMessage: async (id, { text, attachments }) => {
    const res = await api.post(`/workshop/work-orders/${id}/messages`, {
      text,
      attachments,
    });
    return res.data;
  },
};
