import api from "./api";

export const workshopWorkOrderService = {
  getWorkOrders: async (filters = {}) => {
    const res = await api.get("/workshop/work-orders", { params: filters });
    return res.data;
  },

  getWorkOrderById: async (id) => {
    const res = await api.get(`/workshop/work-orders/${id}`);
    return res.data;
  },

  createWorkOrder: async (workOrderData) => {
    const res = await api.post("/workshop/work-orders", workOrderData);
    return res.data;
  },

  updateWorkOrder: async (id, workOrderData) => {
    const res = await api.patch(`/workshop/work-orders/${id}`, workOrderData);
    return res.data;
  },

  deleteWorkOrder: async (id) => {
    const res = await api.delete(`/workshop/work-orders/${id}`);
    return res.data;
  },
};
