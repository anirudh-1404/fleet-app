import api from "./api";

export const workshopInquiryService = {
  // Get all inquiries for manager with optional status & search
  getInquiries: async (params = {}) => {
    const res = await api.get("/workshop/inquiries", { params });
    return res.data;
  },

  // Get single inquiry details
  getInquiryById: async (id) => {
    const res = await api.get(`/workshop/inquiries/${id}`);
    return res.data;
  },

  // Update inquiry status (NEW, CONTACTED, CONVERTED, ARCHIVED)
  updateInquiryStatus: async (id, status, internalNotes) => {
    const res = await api.patch(`/workshop/inquiries/${id}/status`, {
      status,
      internalNotes,
    });
    return res.data;
  },

  // Convert inquiry into an active Workshop Work Order
  convertToWorkOrder: async (id) => {
    const res = await api.post(`/workshop/inquiries/${id}/convert`);
    return res.data;
  },

  // Delete inquiry
  deleteInquiry: async (id) => {
    const res = await api.delete(`/workshop/inquiries/${id}`);
    return res.data;
  },
};

export default workshopInquiryService;
