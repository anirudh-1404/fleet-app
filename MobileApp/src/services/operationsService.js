import api from "./api";

export const operationsService = {
  getOperationsData: async ({ from, to, status, search } = {}) => {
    const res = await api.get("/manager/operations", {
      params: { from, to, status, search },
    });
    return res.data;
  },
};
